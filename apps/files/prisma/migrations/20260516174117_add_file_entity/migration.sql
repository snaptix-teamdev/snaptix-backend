-- CreateEnum
CREATE TYPE "FileEntityType" AS ENUM ('POST_PHOTO', 'USER_AVATAR');

-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('PENDING', 'INVALID', 'CONFIRMED', 'READY');

-- CreateTable
CREATE TABLE "files" (
    "id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "entity_type" "FileEntityType" NOT NULL,
    "entity_id" UUID,
    "storage_key" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "byte_size" INTEGER NOT NULL,
    "status" "FileStatus" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_variants" (
    "id" UUID NOT NULL,
    "storage_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "byte_size" BIGINT,
    "width" INTEGER,
    "height" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "original_file_id" UUID NOT NULL,

    CONSTRAINT "file_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "files_storage_key_key" ON "files"("storage_key");

-- CreateIndex
CREATE INDEX "files_owner_id_idx" ON "files"("owner_id");

-- CreateIndex
CREATE INDEX "files_entity_type_entity_id_idx" ON "files"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "files_status_idx" ON "files"("status");

-- CreateIndex
CREATE UNIQUE INDEX "file_variants_storage_key_key" ON "file_variants"("storage_key");

-- CreateIndex
CREATE INDEX "file_variants_original_file_id_idx" ON "file_variants"("original_file_id");

-- AddForeignKey
ALTER TABLE "file_variants" ADD CONSTRAINT "file_variants_original_file_id_fkey" FOREIGN KEY ("original_file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
