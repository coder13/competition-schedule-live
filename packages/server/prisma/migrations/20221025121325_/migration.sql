/*
  Warnings:

  - The `endTime` column on the `ActivityHistory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `startTime` on the `ActivityHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ActivityHistory" DROP COLUMN "startTime",
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
DROP COLUMN "endTime",
ADD COLUMN     "endTime" TIMESTAMP(3);
