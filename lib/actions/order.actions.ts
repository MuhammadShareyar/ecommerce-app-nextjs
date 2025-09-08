"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getUserById } from "./user.action";
import { getMyCart } from "./cart.actions";
import { insertOrderSchema } from "../validator";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types/Cart";
import { PaymentResult } from "@/types/PaymentResult";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "@prisma/client";

// Create order and order items
export async function placeOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    const userId = session.user?.id;
    if (!userId) throw new Error("User not found");

    const cart = await getMyCart();
    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: "Your cart is empty",
        redirectTo: "/cart",
      };
    }
    if (!user.address) {
      return {
        success: false,
        message: "No shipping address",
        redirectTo: "/shipping-address",
      };
    }
    if (!user.paymentMethod) {
      return {
        success: false,
        message: "No payment method",
        redirectTo: "/payment-method",
      };
    }

    const orderData = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    // create a transaction to create order and order item in db
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // creating order
      const newOrder = await tx.order.create({ data: orderData });

      // creating orderitem
      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: { ...item, price: item.price, orderId: newOrder.id },
        });
      }

      //   clear the cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          itemsPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
          totalPrice: 0,
        },
      });

      return newOrder.id;
    });

    if (!insertedOrderId) {
      throw new Error("Order not placed");
    }
    return {
      success: true,
      message: "Order placed successfully",
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    return {
      success: false,
      message: formatError(error),
    };
  }
}

// get order details
export async function getOrderById(orderId: string) {
  const orderDetails = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true,
      user: { select: { name: true, email: true } },
    },
  });

  return convertToPlainObject(orderDetails);
}

//  Create new paypal order
export async function createPaypalOrder(orderId: string) {
  try {
    // Get order from db;
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // create a new paypal order
    const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

    if (!paypalOrder.id) {
      throw new Error("Paypal order creation failed");
    }

    // Update order with paypal order id
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentResult: {
          id: paypalOrder.id,
          status: paypalOrder.status,
          email_address: "",
          pricePaid: 0,
        },
      },
    });

    return {
      success: true,
      message: "Item order created successfully",
      data: paypalOrder.id,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function approvePaypalOrder(
  orderId: string,
  data: { orderID: string }
) {
  try {
    // Get order from db;
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const captureData = await paypal.capturePayment(data.orderID);

    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
      captureData.status !== "COMPLETED"
    ) {
      throw new Error("Paypal order capture failed");
    }

    // update order
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid:
          captureData.purchase_units[0].payments.captures[0].amount.value,
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: "Your order has been placed successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// update order to paid
async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  // Get order from db;
  const order = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.isPaid) {
    throw new Error("Order is already paid");
  }

  // update order
  await prisma.$transaction(async (tx) => {
    // update product stock
    for (const item of order.orderitems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: -item.qty },
        },
      });
    }

    // update order
    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });
  });

  const updatedOrder = await getOrderById(orderId);

  if (!updatedOrder) {
    throw new Error("Failed to retrieve updated order details");
  }

  return updatedOrder;
}

export async function getMyOrders({
  page = 1,
  limit = PAGE_SIZE,
}: {
  page: number;
  limit?: number;
}) {
  const session = await auth();
  if (!session) throw new Error("User is not authenticated");

  const userId = session.user?.id;
  if (!userId) throw new Error("User not found");

  const orders = await prisma.order.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const ordersCount = await prisma.order.count({
    where: { userId: userId },
  });

  return {
    data: orders,
    totalPages: Math.ceil(ordersCount / limit),
    total: ordersCount,
  };
}

type SalesDataType = {
  month: string;
  totalSales: number;
}[];

// get dashboard order summary data
export async function getOrderSummary() {
  // fetch data counts
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  // calculate the total sales
  const totalSales = await prisma.order.aggregate({
    _sum: { totalPrice: true },
  });

  // fetch total sales
  const salesDataRaw = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

  const salesData: SalesDataType = salesDataRaw.map((entry) => ({
    month: entry.month,
    totalSales: Number(entry.totalSales), // Convert Decimal to number
  }));

  // get latest sales
  const latestSales = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
    },
    take: 6,
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    latestSales,
    salesData,
  };
}

type OrderProps = {
  page: number;
  limit?: number;
};
//  to get all orders
export async function getAllOrders({ limit = PAGE_SIZE, page }: OrderProps) {
  const data = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  const dataCount = await prisma.order.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// action to delete order
export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id: id } });

    revalidatePath("/admin/orders");

    return { success: true, message: "Order deleted successfuly!" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// update cod order to paid
export async function updateOrderToPaidCOD(id: string) {
  try {
    await updateOrderToPaid({ orderId: id });

    revalidatePath(`/order/${id}`);

    return { success: true, message: "Order marked as paid successfuly!" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// update cod order to delivered
export async function deliveredOrder(id: string) {
  try {
    const order = await prisma.order.findFirst({ where: { id } });

    if (!order) throw new Error("No order found!");

    if (!order.isPaid) throw new Error("Order is not paid yet!");

    await prisma.order.update({
      where: { id: id },
      data: { isDelivered: true, deliveredAt: new Date() },
    });

    revalidatePath(`/order/${id}`);

    return { success: true, message: "Order marked as paid successfuly!" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
