"use server";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getUserById } from "./user.action";
import { getMyCart } from "./cart.actions";
import { insertOrderSchema } from "../validator";
import { prisma } from "@/db/prisma";
import { CartItem } from "@/types/Cart";

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
    const insertedOrderId = prisma.$transaction(async (tx) => {
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

