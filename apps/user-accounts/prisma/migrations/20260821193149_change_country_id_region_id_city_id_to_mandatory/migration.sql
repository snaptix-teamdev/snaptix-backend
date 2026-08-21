/*
  Warnings:

  - Made the column `city_id` on table `user_profile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country_id` on table `user_profile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `region_id` on table `user_profile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user_profile" ALTER COLUMN "city_id" SET NOT NULL,
ALTER COLUMN "country_id" SET NOT NULL,
ALTER COLUMN "region_id" SET NOT NULL;
