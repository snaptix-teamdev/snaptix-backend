-- CreateTable
CREATE TABLE "outbox_event" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ,

    CONSTRAINT "outbox_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "outbox_event_published_at_created_at_idx" ON "outbox_event"("published_at", "created_at");
