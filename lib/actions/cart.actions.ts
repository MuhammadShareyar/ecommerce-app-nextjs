"use server";
import { CartItem } from "@/types/Cart";
import { cookies } from "next/headers";
import { formatError } from "../utils";

export async function addItemToCart(data: CartItem) {
  try {

    return {
      success: true,
      message: "Item added to the cart",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
