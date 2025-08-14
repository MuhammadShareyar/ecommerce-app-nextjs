/*
  Warnings:

  - You are about to drop the column `stock` on the `OrderItem` table. All the data in the column will be lost.
  - Added the required column `qty` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."OrderItem" DROP COLUMN "stock",
ADD COLUMN     "qty" INTEGER NOT NULL;
