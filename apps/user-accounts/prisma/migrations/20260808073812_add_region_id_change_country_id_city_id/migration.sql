/*
  Warnings:

  - You are about to drop the column `city` on the `user_profile` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `user_profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_profile" DROP COLUMN "city",
DROP COLUMN "country",
ADD COLUMN     "city_id" TEXT,
ADD COLUMN     "country_id" TEXT,
ADD COLUMN     "region_id" TEXT;
