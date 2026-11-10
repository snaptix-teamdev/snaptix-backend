/*
  Warnings:

  - You are about to drop the column `avatar_url` on the `user_profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_profile" DROP COLUMN "avatar_url",
ADD COLUMN     "storage_key" TEXT;
