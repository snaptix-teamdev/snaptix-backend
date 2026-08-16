/*
  Warnings:

  - The `city_id` column on the `user_profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `country_id` column on the `user_profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `region_id` column on the `user_profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "user_profile" DROP COLUMN "city_id",
ADD COLUMN     "city_id" INTEGER,
DROP COLUMN "country_id",
ADD COLUMN     "country_id" INTEGER,
DROP COLUMN "region_id",
ADD COLUMN     "region_id" INTEGER;
