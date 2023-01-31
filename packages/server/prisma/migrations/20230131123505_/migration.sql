/*
  Warnings:

  - You are about to drop the column `headers` on the `Webhook` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ActivityHistory" ALTER COLUMN "startTime" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Webhook" DROP COLUMN "headers";

-- CreateTable
CREATE TABLE "Header" (
    "id" SERIAL NOT NULL,
    "webhookId" INTEGER NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "value" VARCHAR(255) NOT NULL,

    CONSTRAINT "Header_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Header_webhookId_key_key" ON "Header"("webhookId", "key");

-- AddForeignKey
ALTER TABLE "Header" ADD CONSTRAINT "Header_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "Webhook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
