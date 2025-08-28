import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";
import { PAYMENT_METHODS } from "./constants";

export const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    "Price must have exactly 2 decimal places"
  );

// Schema for inserting product
export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be atleast 3 characters"),
  slug: z.string().min(3, "Slug must be atleast 3 characters"),
  category: z.string().min(3, "Category must be atleast 3 characters"),
  brand: z.string().min(3, "Brand must be atleast 3 characters"),
  description: z.string().min(3, "Description must be atleast 3 characters"),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, "Product must be atleast 1 image"),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
});

// Schema for signin
export const signInFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be atleast 8 characters"),
});

// Schema for signingup user
export const signUpFormSchema = z
  .object({
    name: z.string().min(3, "Name must be atleast 3 characters"),
    email: z.string().email(),
    password: z.string().min(8, "Password must be atleast 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be atleast 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords does not matched",
    path: ["confirmPassword"],
  });

// schema for carts
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  qty: z.number().int().nonnegative("Quantity must be a positive number"),
  image: z.string().min(1, "Image is required"),
  price: currency,
});

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, "Session cart id is required"),
  userId: z.string().optional().nullable(),
});

// schema for the shipping address
export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, "Name must be atleast 3 characters"),
  streetAddress: z.string().min(3, "Address must be atleast 3 characters"),
  city: z.string().min(3, "City must be atleast 3 characters"),
  postalCode: z.string().min(3, "Postal code must be atleast 3 characters"),
  country: z.string().min(3, "Country must be atleast 3 characters"),
  lat: z.number().optional().nullable(),
  lng: z.number().optional().nullable(),
});

// schema for payment methods
export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, "Payment method is required"),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ["type"],
    message: "Invalid payment method",
  });

// Schema for order
export const insertOrderSchema = z.object({
  userId: z.string().min(1, "User id is required"),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    path: ["paymentMethod"],
    message: "Invalid payment method",
  }),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
});

export const insertOrderItemSchema = z.object({
  productId: z.string().min(1, "Product id is required"),
  price: currency,
  qty: z.number(),
  name: z.string(),
  slug: z.string(),
  image: z.string(),
});

export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string(),
  pricePaid: z.string(),
});

// update profile schema
export const updateProfileSchema = z.object({
  name: z.string().min(3, "Name field is required!"),
  email: z.string().min(3, "Email must be at least 3 characters"),
});
