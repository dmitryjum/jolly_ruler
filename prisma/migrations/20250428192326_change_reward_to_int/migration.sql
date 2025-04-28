/*
  Warnings:

  - The `reward` column on the `Rule` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Rule" DROP COLUMN "reward",
ADD COLUMN     "reward" INTEGER;
