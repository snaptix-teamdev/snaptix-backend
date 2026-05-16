/*
  Warnings:

  - You are about to drop the column `media` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "media";

-- CreateTable
CREATE TABLE "post_media" (
    "id" UUID NOT NULL,
    "file_id" UUID NOT NULL,
    "storage_key" TEXT NOT NULL,
    "order" SMALLINT NOT NULL,
    "post_id" UUID NOT NULL,

    CONSTRAINT "post_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_media_post_id_order_key" ON "post_media"("post_id", "order");

-- AddForeignKey
ALTER TABLE "post_media" ADD CONSTRAINT "post_media_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
