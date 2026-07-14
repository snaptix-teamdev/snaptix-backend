-- CreateEnum
CREATE TYPE "OAuthProvider" AS ENUM ('GOOGLE', 'YANDEX', 'VK', 'GITHUB');

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "user_providers" (
    "id" UUID NOT NULL,
    "provider" "OAuthProvider" NOT NULL,
    "externalProviderId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "user_providers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_providers_provider_externalProviderId_key" ON "user_providers"("provider", "externalProviderId");

-- AddForeignKey
ALTER TABLE "user_providers" ADD CONSTRAINT "user_providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
