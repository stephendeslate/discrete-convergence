-- Initial migration for Analytics Engine

-- Enums
CREATE TYPE "role" AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE "sync_status" AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE "audit_action" AS ENUM ('create', 'update', 'delete', 'login', 'export');

-- Users
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "role" NOT NULL DEFAULT 'viewer',
    "tenant_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE INDEX "users_email_idx" ON "users"("email");

-- Dashboards
CREATE TABLE "dashboards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "dashboards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "dashboards_tenant_id_idx" ON "dashboards"("tenant_id");
CREATE INDEX "dashboards_user_id_idx" ON "dashboards"("user_id");

-- Widgets
CREATE TABLE "widgets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "position" INTEGER NOT NULL DEFAULT 0,
    "dashboard_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "widgets_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "widgets_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "dashboards"("id") ON DELETE CASCADE
);
CREATE INDEX "widgets_dashboard_id_idx" ON "widgets"("dashboard_id");
CREATE INDEX "widgets_tenant_id_idx" ON "widgets"("tenant_id");

-- Data Sources
CREATE TABLE "data_sources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "connection_string" TEXT NOT NULL,
    "tenant_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "data_sources_tenant_id_idx" ON "data_sources"("tenant_id");

-- Sync Histories
CREATE TABLE "sync_histories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "data_source_id" UUID NOT NULL,
    "status" "sync_status" NOT NULL DEFAULT 'pending',
    "record_count" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "tenant_id" UUID NOT NULL,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "completed_at" TIMESTAMPTZ,
    CONSTRAINT "sync_histories_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sync_histories_data_source_id_fkey" FOREIGN KEY ("data_source_id") REFERENCES "data_sources"("id") ON DELETE CASCADE
);
CREATE INDEX "sync_histories_data_source_id_idx" ON "sync_histories"("data_source_id");
CREATE INDEX "sync_histories_tenant_id_idx" ON "sync_histories"("tenant_id");

-- Audit Logs
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "action" "audit_action" NOT NULL,
    "entity" VARCHAR(100) NOT NULL,
    "entity_id" UUID NOT NULL,
    "details" JSONB,
    "user_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs"("tenant_id");
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");

-- Row Level Security
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dashboards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "widgets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "data_sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sync_histories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_users" ON "users"
    USING ("tenant_id" = current_setting('app.tenant_id', true)::uuid);
CREATE POLICY "tenant_isolation_dashboards" ON "dashboards"
    USING ("tenant_id" = current_setting('app.tenant_id', true)::uuid);
CREATE POLICY "tenant_isolation_widgets" ON "widgets"
    USING ("tenant_id" = current_setting('app.tenant_id', true)::uuid);
CREATE POLICY "tenant_isolation_data_sources" ON "data_sources"
    USING ("tenant_id" = current_setting('app.tenant_id', true)::uuid);
CREATE POLICY "tenant_isolation_sync_histories" ON "sync_histories"
    USING ("tenant_id" = current_setting('app.tenant_id', true)::uuid);
CREATE POLICY "tenant_isolation_audit_logs" ON "audit_logs"
    USING ("tenant_id" = current_setting('app.tenant_id', true)::uuid);
