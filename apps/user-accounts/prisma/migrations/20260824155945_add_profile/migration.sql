-- CreateTable
CREATE TABLE "user_profile" (
    "id" UUID NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "birth_date" DATE,
    "country_id" INTEGER,
    "region_id" INTEGER,
    "city_id" INTEGER,
    "about_me" TEXT,
    "avatar_url" TEXT,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_user_id_key" ON "user_profile"("user_id");

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
