/*
  Warnings:

  - You are about to drop the column `taxAmount` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "taxAmount",
ALTER COLUMN "shippingCharge" SET DEFAULT 0;
