-- CreateEnum
CREATE TYPE "Method" AS ENUM ('GET', 'POST', 'PATCH', 'PUT', 'DELETE');

-- CreateTable
CREATE TABLE "CompetitionAccess" (
    "competitionId" VARCHAR(255) NOT NULL,
    "userId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "ActivityHistory" (
    "competitionId" VARCHAR(255) NOT NULL,
    "activityId" INTEGER NOT NULL,
    "startTime" INTEGER NOT NULL,
    "endTime" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Webhooks" (
    "id" SERIAL NOT NULL,
    "competitionId" VARCHAR(255) NOT NULL,
    "URL" VARCHAR(255) NOT NULL,
    "method" "Method" NOT NULL,
    "headers" JSON NOT NULL,

    CONSTRAINT "Webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompetitionAccess_competitionId_userId_key" ON "CompetitionAccess"("competitionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityHistory_competitionId_activityId_key" ON "ActivityHistory"("competitionId", "activityId");

-- CreateIndex
CREATE UNIQUE INDEX "Webhooks_competitionId_URL_key" ON "Webhooks"("competitionId", "URL");
