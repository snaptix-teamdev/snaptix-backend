/*
  Warnings:

  - A unique constraint covering the columns `[user_id,device_id]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "sessions_device_id_key";

-- DropIndex
DROP INDEX "sessions_user_id_key";

-- AlterTable
ALTER TABLE "sessions" ALTER COLUMN "ip" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "sessions_user_id_device_id_key" ON "sessions"("user_id", "device_id");
