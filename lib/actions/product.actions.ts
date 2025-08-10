"use server";

import { LATEST_PRODUCT_LIMIT } from "../constants";
import { PrismaClient } from "../generated/prisma";
import { convertToPlainObject } from "../utils";

// Get latest products
export async function getLatestProducts() {
  const prisma = new PrismaClient();

  const products = await prisma.product.findMany({
    take: LATEST_PRODUCT_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  return convertToPlainObject(products);
}
