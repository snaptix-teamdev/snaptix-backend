-- CreateTable
CREATE TABLE "Post" (
    "id" UUID NOT NULL,
    "description" TEXT,
    "user_id" UUID NOT NULL,
    "media" UUID[],
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);
