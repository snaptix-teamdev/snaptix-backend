-- AlterTable
ALTER TABLE "user_recovery_password" ADD COLUMN     "is_code_already_used" BOOLEAN NOT NULL DEFAULT false;
