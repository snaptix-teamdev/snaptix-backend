-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" VARCHAR NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_email_confirmation" (
    "id" UUID NOT NULL,
    "code" UUID NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "user_email_confirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_recovery_password" (
    "id" UUID NOT NULL,
    "code" UUID NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "user_recovery_password_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_confirmation_code_key" ON "user_email_confirmation"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_confirmation_user_id_key" ON "user_email_confirmation"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_recovery_password_code_key" ON "user_recovery_password"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_recovery_password_user_id_key" ON "user_recovery_password"("user_id");

-- AddForeignKey
ALTER TABLE "user_email_confirmation" ADD CONSTRAINT "user_email_confirmation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_recovery_password" ADD CONSTRAINT "user_recovery_password_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
