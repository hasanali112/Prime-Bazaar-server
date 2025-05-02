/*
  Warnings:

  - You are about to drop the column `attachments` on the `cancellation_requests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "cancellation_requests" DROP COLUMN "attachments";
