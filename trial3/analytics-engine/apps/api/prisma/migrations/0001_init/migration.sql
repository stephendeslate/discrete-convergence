-- CreateEnum
CREATE TYPE "tenant_tier" AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE "user_role" AS ENUM ('admin', 'user', 'viewer');
CREATE TYPE "dashboard_status" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "widget_type" AS ENUM ('line_chart', 'bar_chart', 'pie_chart', 'area_chart', 'kpi_card', 'table', 'funnel');
CREATE TYPE "data_source_type" AS ENUM ('rest_api', 'postgresql', 'csv', 'webhook');
CREATE TYPE "sync_status" AS ENUM ('idle', 'running', 'completed', 'failed');
CREATE TYPE "sync_schedule" AS ENUM ('manual', 'hourly', 'daily', 'weekly', 'realtime');
CREATE TYPE "api_key_type" AS ENUM ('admin', 'embed');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "tier" "tenant_tier" NOT NULL DEFAULT 'free',
    "domain" VARCHAR(255),
    "logoUrl" VARCHAR(512),
    "primaryColor" VARCHAR(7),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'user',
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dashboards" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "dashboard_status" NOT NULL DEFAULT 'draft',
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "widgets" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "type" "widget_type" NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "gridColumn" INTEGER NOT NULL DEFAULT 1,
    "gridRow" INTEGER NOT NULL DEFAULT 1,
    "gridWidth" INTEGER NOT NULL DEFAULT 6,
    "gridHeight" INTEGER NOT NULL DEFAULT 4,
    "dashboardId" TEXT NOT NULL,
    "dataSourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "widgets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "data_sources" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "data_source_type" NOT NULL,
    "configEncrypted" TEXT NOT NULL,
    "schedule" "sync_schedule" NOT NULL DEFAULT 'manual',
    "paused" BOOLEAN NOT NULL DEFAULT false,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "field_mappings" (
    "id" TEXT NOT NULL,
    "sourceField" VARCHAR(255) NOT NULL,
    "targetField" VARCHAR(255) NOT NULL,
    "fieldType" VARCHAR(50) NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "field_mappings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sync_runs" (
    "id" TEXT NOT NULL,
    "status" "sync_status" NOT NULL DEFAULT 'idle',
    "rowsIngested" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "dataSourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sync_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "data_points" (
    "id" TEXT NOT NULL,
    "dimensions" JSONB NOT NULL DEFAULT '{}',
    "metrics" JSONB NOT NULL DEFAULT '{}',
    "sourceHash" VARCHAR(64) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataSourceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "data_points_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "embed_configs" (
    "id" TEXT NOT NULL,
    "allowedOrigins" TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "themeOverrides" JSONB NOT NULL DEFAULT '{}',
    "dashboardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "embed_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "query_caches" (
    "id" TEXT NOT NULL,
    "queryHash" VARCHAR(64) NOT NULL,
    "result" JSONB NOT NULL,
    "ttlSeconds" INTEGER NOT NULL,
    "tenantId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "query_caches_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dead_letter_events" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "dataSourceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dead_letter_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "keyHash" VARCHAR(255) NOT NULL,
    "prefix" VARCHAR(10) NOT NULL,
    "type" "api_key_type" NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" VARCHAR(255) NOT NULL,
    "entity" VARCHAR(255) NOT NULL,
    "entityId" VARCHAR(36),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "userId" VARCHAR(36),
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "aggregated_data_points" (
    "id" TEXT NOT NULL,
    "bucket" TIMESTAMP(3) NOT NULL,
    "granularity" VARCHAR(20) NOT NULL,
    "dimensions" JSONB NOT NULL DEFAULT '{}',
    "metrics" JSONB NOT NULL DEFAULT '{}',
    "dataSourceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "aggregated_data_points_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_tenantId_key" ON "users"("email", "tenantId");
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");
CREATE INDEX "dashboards_tenantId_idx" ON "dashboards"("tenantId");
CREATE INDEX "dashboards_status_idx" ON "dashboards"("status");
CREATE INDEX "dashboards_tenantId_status_idx" ON "dashboards"("tenantId", "status");
CREATE INDEX "widgets_dashboardId_idx" ON "widgets"("dashboardId");
CREATE INDEX "widgets_dataSourceId_idx" ON "widgets"("dataSourceId");
CREATE INDEX "data_sources_tenantId_idx" ON "data_sources"("tenantId");
CREATE INDEX "data_sources_tenantId_type_idx" ON "data_sources"("tenantId", "type");
CREATE INDEX "field_mappings_dataSourceId_idx" ON "field_mappings"("dataSourceId");
CREATE INDEX "sync_runs_dataSourceId_idx" ON "sync_runs"("dataSourceId");
CREATE INDEX "sync_runs_status_idx" ON "sync_runs"("status");
CREATE INDEX "sync_runs_dataSourceId_status_idx" ON "sync_runs"("dataSourceId", "status");
CREATE UNIQUE INDEX "data_points_dataSourceId_sourceHash_key" ON "data_points"("dataSourceId", "sourceHash");
CREATE INDEX "data_points_dataSourceId_idx" ON "data_points"("dataSourceId");
CREATE INDEX "data_points_tenantId_idx" ON "data_points"("tenantId");
CREATE INDEX "data_points_timestamp_idx" ON "data_points"("timestamp");
CREATE UNIQUE INDEX "embed_configs_dashboardId_key" ON "embed_configs"("dashboardId");
CREATE UNIQUE INDEX "query_caches_queryHash_tenantId_key" ON "query_caches"("queryHash", "tenantId");
CREATE INDEX "query_caches_tenantId_idx" ON "query_caches"("tenantId");
CREATE INDEX "query_caches_expiresAt_idx" ON "query_caches"("expiresAt");
CREATE INDEX "dead_letter_events_tenantId_idx" ON "dead_letter_events"("tenantId");
CREATE INDEX "dead_letter_events_dataSourceId_idx" ON "dead_letter_events"("dataSourceId");
CREATE INDEX "api_keys_tenantId_idx" ON "api_keys"("tenantId");
CREATE INDEX "api_keys_prefix_idx" ON "api_keys"("prefix");
CREATE INDEX "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");
CREATE INDEX "audit_logs_tenantId_action_idx" ON "audit_logs"("tenantId", "action");
CREATE INDEX "aggregated_data_points_dataSourceId_idx" ON "aggregated_data_points"("dataSourceId");
CREATE INDEX "aggregated_data_points_tenantId_idx" ON "aggregated_data_points"("tenantId");
CREATE INDEX "aggregated_data_points_bucket_idx" ON "aggregated_data_points"("bucket");
CREATE INDEX "aggregated_data_points_dataSourceId_bucket_idx" ON "aggregated_data_points"("dataSourceId", "bucket");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "dashboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "data_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "data_sources" ADD CONSTRAINT "data_sources_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "field_mappings" ADD CONSTRAINT "field_mappings_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "data_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sync_runs" ADD CONSTRAINT "sync_runs_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "data_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "data_points" ADD CONSTRAINT "data_points_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "data_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "embed_configs" ADD CONSTRAINT "embed_configs_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "dashboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "field_mappings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "field_mappings" FORCE ROW LEVEL SECURITY;
ALTER TABLE "sync_runs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sync_runs" FORCE ROW LEVEL SECURITY;
ALTER TABLE "data_points" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "data_points" FORCE ROW LEVEL SECURITY;
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
ALTER TABLE "aggregated_data_points" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "aggregated_data_points" FORCE ROW LEVEL SECURITY;
