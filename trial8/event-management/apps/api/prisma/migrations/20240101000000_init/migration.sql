-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'user', 'organizer');
CREATE TYPE "event_status" AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE "ticket_type" AS ENUM ('general', 'vip', 'early_bird');
CREATE TYPE "ticket_status" AS ENUM ('available', 'reserved', 'sold', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'user',
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "event_status" NOT NULL DEFAULT 'draft',
    "venue_id" TEXT,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "tenant_id" TEXT NOT NULL,
    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "type" "ticket_type" NOT NULL DEFAULT 'general',
    "price" DECIMAL(12,2) NOT NULL,
    "status" "ticket_status" NOT NULL DEFAULT 'available',
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendees" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ticket_id" TEXT,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenant_id" TEXT NOT NULL,
    CONSTRAINT "attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "room" TEXT,
    "speaker" TEXT,
    "tenant_id" TEXT NOT NULL,
    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "events_tenant_id_idx" ON "events"("tenant_id");
CREATE INDEX "events_status_idx" ON "events"("status");
CREATE INDEX "events_tenant_id_status_idx" ON "events"("tenant_id", "status");
CREATE INDEX "events_venue_id_idx" ON "events"("venue_id");
CREATE INDEX "venues_tenant_id_idx" ON "venues"("tenant_id");
CREATE INDEX "venues_tenant_id_city_idx" ON "venues"("tenant_id", "city");
CREATE INDEX "tickets_tenant_id_idx" ON "tickets"("tenant_id");
CREATE INDEX "tickets_status_idx" ON "tickets"("status");
CREATE INDEX "tickets_tenant_id_status_idx" ON "tickets"("tenant_id", "status");
CREATE INDEX "tickets_event_id_idx" ON "tickets"("event_id");
CREATE UNIQUE INDEX "attendees_ticket_id_key" ON "attendees"("ticket_id");
CREATE UNIQUE INDEX "attendees_event_id_user_id_key" ON "attendees"("event_id", "user_id");
CREATE INDEX "attendees_tenant_id_idx" ON "attendees"("tenant_id");
CREATE INDEX "attendees_event_id_idx" ON "attendees"("event_id");
CREATE INDEX "attendees_user_id_idx" ON "attendees"("user_id");
CREATE INDEX "schedules_tenant_id_idx" ON "schedules"("tenant_id");
CREATE INDEX "schedules_event_id_idx" ON "schedules"("event_id");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "attendees" ADD CONSTRAINT "attendees_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "attendees" ADD CONSTRAINT "attendees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "attendees" ADD CONSTRAINT "attendees_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Row Level Security
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_users" ON "users"
  USING ("tenant_id" = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "events" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_events" ON "events"
  USING ("tenant_id" = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE "venues" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "venues" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_venues" ON "venues"
  USING ("tenant_id" = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE "tickets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tickets" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_tickets" ON "tickets"
  USING ("tenant_id" = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE "attendees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attendees" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_attendees" ON "attendees"
  USING ("tenant_id" = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE "schedules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "schedules" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_schedules" ON "schedules"
  USING ("tenant_id" = current_setting('app.current_tenant_id')::uuid);
