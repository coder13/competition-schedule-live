-- CreateTable
CREATE TABLE "CompetitionSid" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "competitionId" TEXT NOT NULL,
    "sid" TEXT NOT NULL,

    CONSTRAINT "CompetitionSid_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionSid_competitionId_sid_key" ON "CompetitionSid"("competitionId", "sid");
