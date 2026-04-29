-- AlterTable
ALTER TABLE "file_records" ADD COLUMN     "file_size" BIGINT,
ADD COLUMN     "is_download" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_uploaded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_valid" BOOLEAN;

-- CreateTable
CREATE TABLE "file_variants" (
    "id" UUID NOT NULL,
    "file_record_id" UUID NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,

    CONSTRAINT "file_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "file_variants_storage_key_key" ON "file_variants"("storage_key");

-- AddForeignKey
ALTER TABLE "file_variants" ADD CONSTRAINT "file_variants_file_record_id_fkey" FOREIGN KEY ("file_record_id") REFERENCES "file_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
