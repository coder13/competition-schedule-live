/*
  Warnings:

  - You are about to drop the column `URL` on the `Webhooks` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[competitionId,url]` on the table `Webhooks` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `url` to the `Webhooks` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Webhooks_competitionId_URL_key";

-- AlterTable
ALTER TABLE "Webhooks" DROP COLUMN "URL",
ADD COLUMN     "url" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Webhooks_competitionId_url_key" ON "Webhooks"("competitionId", "url");
