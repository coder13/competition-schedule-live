/*
  Warnings:

  - The primary key for the `CompetitionSid` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `CompetitionSid` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[competitionId]` on the table `CompetitionSid` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CompetitionSid_competitionId_sid_key";

-- AlterTable
ALTER TABLE "CompetitionSid" DROP CONSTRAINT "CompetitionSid_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "CompetitionSid_pkey" PRIMARY KEY ("competitionId");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionSid_competitionId_key" ON "CompetitionSid"("competitionId");
