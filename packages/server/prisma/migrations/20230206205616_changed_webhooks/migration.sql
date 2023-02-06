/*
  Warnings:

  - You are about to drop the `Header` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Header" DROP CONSTRAINT "Header_webhookId_fkey";

-- AlterTable
ALTER TABLE "Webhook" ADD COLUMN     "headers" JSONB;

-- DropTable
DROP TABLE "Header";
