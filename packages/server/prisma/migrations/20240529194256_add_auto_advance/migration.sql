-- CreateEnum
CREATE TYPE "Status" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'FINISHED');

-- AlterTable
ALTER TABLE "Competition" ADD COLUMN     "autoAdvance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "autoAdvanceDelay" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'NOT_STARTED';
