-- CreateEnum
CREATE TYPE "PushSubscriptionSource" AS ENUM ('competitiongroups');

-- CreateEnum
CREATE TYPE "PushDeliveryStatus" AS ENUM ('pending', 'sent', 'failed', 'skipped');

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "source" "PushSubscriptionSource" NOT NULL,
    "externalSubject" TEXT NOT NULL,
    "disabledAt" TIMESTAMP(3),

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentWatch" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pushSubscriptionId" INTEGER NOT NULL,
    "competitionId" TEXT NOT NULL,
    "wcaUserId" INTEGER NOT NULL,

    CONSTRAINT "AssignmentWatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignmentSnapshot" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "competitionId" TEXT NOT NULL,
    "wcaUserId" INTEGER NOT NULL,
    "assignmentsHash" TEXT NOT NULL,

    CONSTRAINT "AssignmentSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushDelivery" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pushSubscriptionId" INTEGER NOT NULL,
    "competitionId" TEXT NOT NULL,
    "wcaUserId" INTEGER NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "status" "PushDeliveryStatus" NOT NULL,
    "error" JSONB,

    CONSTRAINT "PushDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_source_externalSubject_idx" ON "PushSubscription"("source", "externalSubject");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentWatch_pushSubscriptionId_competitionId_wcaUserId_key" ON "AssignmentWatch"("pushSubscriptionId", "competitionId", "wcaUserId");

-- CreateIndex
CREATE INDEX "AssignmentWatch_competitionId_wcaUserId_idx" ON "AssignmentWatch"("competitionId", "wcaUserId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignmentSnapshot_competitionId_wcaUserId_key" ON "AssignmentSnapshot"("competitionId", "wcaUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PushDelivery_pushSubscriptionId_dedupeKey_key" ON "PushDelivery"("pushSubscriptionId", "dedupeKey");

-- CreateIndex
CREATE INDEX "PushDelivery_competitionId_wcaUserId_idx" ON "PushDelivery"("competitionId", "wcaUserId");

-- AddForeignKey
ALTER TABLE "AssignmentWatch" ADD CONSTRAINT "AssignmentWatch_pushSubscriptionId_fkey" FOREIGN KEY ("pushSubscriptionId") REFERENCES "PushSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushDelivery" ADD CONSTRAINT "PushDelivery_pushSubscriptionId_fkey" FOREIGN KEY ("pushSubscriptionId") REFERENCES "PushSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
