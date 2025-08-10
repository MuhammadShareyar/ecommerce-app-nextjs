"use server";

import { prisma } from "@/db/prisma";
import { LATEST_PRODUCT_LIMIT } from "../constants";
import { convertToPlainObject } from "../utils";

// Get latest products
export async function getLatestProducts() {
  const products = await prisma.product.findMany({
    take: LATEST_PRODUCT_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  return convertToPlainObject(products);
}

// Get product by slug
export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({ where: { slug: slug } });
  return product;
}
