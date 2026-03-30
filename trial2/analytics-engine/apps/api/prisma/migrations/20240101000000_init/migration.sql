-- CreateEnum
CREATE TYPE "tenant_tier" AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE "user_role" AS ENUM ('admin', 'user', 'viewer');
CREATE TYPE "dashboard_status" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "widget_type" AS ENUM ('line_chart', 'bar_chart', 'pie_chart', 'area_chart', 'kpi_card', 'table', 'funnel');
CREATE TYPE "data_source_type" AS ENUM ('rest_api', 'postgresql', 'csv', 'webhook');
CREATE TYPE "sync_status" AS ENUM ('idle', 'running', 'completed', 'failed');
CREATE TYPE "api_key_type" AS ENUM ('admin', 'embed');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "tenant_tier" NOT NULL DEFAULT 'free',
    "theme" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'user',
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dashboards" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "dashboard_status" NOT NULL DEFAULT 'draft',
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "widgets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "widget_type" NOT NULL,
    "config" JSONB,
    "position_x" INTEGER NOT NULL DEFAULT 0,
    "position_y" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER NOT NULL DEFAULT 1,
    "height" INTEGER NOT NULL DEFAULT 1,
    "dashboard_id" TEXT NOT NULL,
    "data_source_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "widgets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "data_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "data_source_type" NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "data_source_configs" (
    "id" TEXT NOT NULL,
    "config_encrypted" TEXT NOT NULL,
    "transform_steps" JSONB,
    "schedule" TEXT,
    "data_source_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "data_source_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "field_mappings" (
    "id" TEXT NOT NULL,
    "source_field" TEXT NOT NULL,
    "target_field" TEXT NOT NULL,
    "field_type" TEXT NOT NULL,
    "data_source_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "field_mappings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sync_runs" (
    "id" TEXT NOT NULL,
    "status" "sync_status" NOT NULL DEFAULT 'idle',
    "rows_ingested" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "data_source_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sync_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "data_points" (
    "id" TEXT NOT NULL,
    "dimensions" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "source_hash" TEXT NOT NULL,
    "data_source_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "ingested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "data_points_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "aggregated_data_points" (
    "id" TEXT NOT NULL,
    "bucket" TIMESTAMP(3) NOT NULL,
    "granularity" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "data_source_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "aggregated_data_points_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "embed_configs" (
    "id" TEXT NOT NULL,
    "allowed_origins" TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "theme_overrides" JSONB,
    "dashboard_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "embed_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "query_caches" (
    "id" TEXT NOT NULL,
    "query_hash" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "ttl_seconds" INTEGER NOT NULL,
    "cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "data_source_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "query_caches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dead_letter_events" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "error_message" TEXT NOT NULL,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "data_source_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dead_letter_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key_hash" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "type" "api_key_type" NOT NULL,
    "expires_at" TIMESTAMP(3),
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "details" JSONB,
    "user_id" TEXT,
    "tenant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "dashboards_tenant_id_idx" ON "dashboards"("tenant_id");
CREATE INDEX "dashboards_status_idx" ON "dashboards"("status");
CREATE INDEX "dashboards_tenant_id_status_idx" ON "dashboards"("tenant_id", "status");
CREATE INDEX "widgets_dashboard_id_idx" ON "widgets"("dashboard_id");
CREATE INDEX "widgets_data_source_id_idx" ON "widgets"("data_source_id");
CREATE INDEX "data_sources_tenant_id_idx" ON "data_sources"("tenant_id");
CREATE INDEX "data_sources_type_idx" ON "data_sources"("type");
CREATE INDEX "data_sources_tenant_id_type_idx" ON "data_sources"("tenant_id", "type");
CREATE UNIQUE INDEX "data_source_configs_data_source_id_key" ON "data_source_configs"("data_source_id");
CREATE INDEX "field_mappings_data_source_id_idx" ON "field_mappings"("data_source_id");
CREATE INDEX "sync_runs_data_source_id_idx" ON "sync_runs"("data_source_id");
CREATE INDEX "sync_runs_status_idx" ON "sync_runs"("status");
CREATE INDEX "sync_runs_data_source_id_status_idx" ON "sync_runs"("data_source_id", "status");
CREATE INDEX "data_points_data_source_id_idx" ON "data_points"("data_source_id");
CREATE INDEX "data_points_tenant_id_idx" ON "data_points"("tenant_id");
CREATE INDEX "data_points_source_hash_idx" ON "data_points"("source_hash");
CREATE INDEX "aggregated_data_points_data_source_id_idx" ON "aggregated_data_points"("data_source_id");
CREATE INDEX "aggregated_data_points_bucket_idx" ON "aggregated_data_points"("bucket");
CREATE INDEX "aggregated_data_points_data_source_id_granularity_idx" ON "aggregated_data_points"("data_source_id", "granularity");
CREATE UNIQUE INDEX "embed_configs_dashboard_id_key" ON "embed_configs"("dashboard_id");
CREATE INDEX "query_caches_query_hash_idx" ON "query_caches"("query_hash");
CREATE INDEX "query_caches_data_source_id_idx" ON "query_caches"("data_source_id");
CREATE INDEX "query_caches_expires_at_idx" ON "query_caches"("expires_at");
CREATE INDEX "dead_letter_events_data_source_id_idx" ON "dead_letter_events"("data_source_id");
CREATE INDEX "dead_letter_events_tenant_id_idx" ON "dead_letter_events"("tenant_id");
CREATE INDEX "api_keys_tenant_id_idx" ON "api_keys"("tenant_id");
CREATE INDEX "api_keys_prefix_idx" ON "api_keys"("prefix");
CREATE INDEX "api_keys_tenant_id_type_idx" ON "api_keys"("tenant_id", "type");
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs"("tenant_id");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_tenant_id_action_idx" ON "audit_logs"("tenant_id", "action");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "dashboards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_data_source_id_fkey" FOREIGN KEY ("data_source_id") REFERENCES "data_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "data_sources" ADD CONSTRAINT "data_sources_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "data_source_configs" ADD CONSTRAINT "data_source_configs_data_source_id_fkey" FOREIGN KEY ("data_source_id") REFERENCES "data_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "field_mappings" ADD CONSTRAINT "field_mappings_data_source_id_fkey" FOREIGN KEY ("data_source_id") REFERENCES "data_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "sync_runs" ADD CONSTRAINT "sync_runs_data_source_id_fkey" FOREIGN KEY ("data_source_id") REFERENCES "data_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "data_points" ADD CONSTRAINT "data_points_data_source_id_fkey" FOREIGN KEY ("data_source_id") REFERENCES "data_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "aggregated_data_points" ADD CONSTRAINT "aggregated_data_points_data_source_id_fkey" FOREIGN KEY ("data_source_id") REFERENCES "data_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "embed_configs" ADD CONSTRAINT "embed_configs_dashboard_id_fkey" FOREIGN KEY ("dashboard_id") REFERENCES "dashboards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "query_caches" ADD CONSTRAINT "query_caches_data_source_id_fkey" FOREIGN KEY ("data_source_id") REFERENCES "data_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Row Level Security
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
ALTER TABLE "dashboards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dashboards" FORCE ROW LEVEL SECURITY;
ALTER TABLE "widgets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "widgets" FORCE ROW LEVEL SECURITY;
ALTER TABLE "data_sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "data_sources" FORCE ROW LEVEL SECURITY;
ALTER TABLE "data_source_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "data_source_configs" FORCE ROW LEVEL SECURITY;
ALTER TABLE "field_mappings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "field_mappings" FORCE ROW LEVEL SECURITY;
ALTER TABLE "sync_runs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sync_runs" FORCE ROW LEVEL SECURITY;
ALTER TABLE "data_points" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "data_points" FORCE ROW LEVEL SECURITY;
ALTER TABLE "aggregated_data_points" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "aggregated_data_points" FORCE ROW LEVEL SECURITY;
ALTER TABLE "embed_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "embed_configs" FORCE ROW LEVEL SECURITY;
ALTER TABLE "query_caches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "query_caches" FORCE ROW LEVEL SECURITY;
ALTER TABLE "dead_letter_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dead_letter_events" FORCE ROW LEVEL SECURITY;
ALTER TABLE "api_keys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "api_keys" FORCE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;
