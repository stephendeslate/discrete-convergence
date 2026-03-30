-- CreateEnum
CREATE TYPE "role" AS ENUM ('admin', 'user', 'viewer');
CREATE TYPE "tenant_tier" AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE "dashboard_status" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "widget_type" AS ENUM ('line_chart', 'bar_chart', 'pie_chart', 'area_chart', 'kpi_card', 'table', 'funnel');
CREATE TYPE "connector_type" AS ENUM ('rest_api', 'postgresql', 'csv', 'webhook');
CREATE TYPE "sync_status" AS ENUM ('idle', 'running', 'completed', 'failed');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "tenant_tier" NOT NULL DEFAULT 'free',
    "theme" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "role" NOT NULL DEFAULT 'user',
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dashboards" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "dashboard_status" NOT NULL DEFAULT 'draft',
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "widgets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "widget_type" NOT NULL,
    "config" JSONB NOT NULL,
    "position" JSONB NOT NULL,
    "dashboardId" TEXT NOT NULL,
    "dataSourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "widgets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "data_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "connector_type" NOT NULL,
    "configEncrypted" TEXT NOT NULL,
    "scheduleMinutes" INTEGER,
    "tenantId" TEXT NOT NULL,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "paused" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "field_mappings" (
    "id" TEXT NOT NULL,
    "sourceField" TEXT NOT NULL,
    "targetField" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
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
    CONSTRAINT "sync_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "data_points" (
    "id" TEXT NOT NULL,
    "dimensions" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataSourceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    CONSTRAINT "data_points_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "aggregated_data_points" (
    "id" TEXT NOT NULL,
    "bucket" TIMESTAMP(3) NOT NULL,
    "granularity" TEXT NOT NULL,
    "dimensions" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "aggregated_data_points_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "embed_configs" (
    "id" TEXT NOT NULL,
    "dashboardId" TEXT NOT NULL,
    "allowedOrigins" TEXT[],
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "themeOverrides" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "embed_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "query_cache" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "ttlSeconds" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "query_cache_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dead_letter_events" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "errorMessage" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dead_letter_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB,
    "userId" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "dashboards_tenantId_idx" ON "dashboards"("tenantId");
CREATE INDEX "dashboards_status_idx" ON "dashboards"("status");
CREATE INDEX "dashboards_tenantId_status_idx" ON "dashboards"("tenantId", "status");
CREATE INDEX "widgets_dashboardId_idx" ON "widgets"("dashboardId");
CREATE INDEX "data_sources_tenantId_idx" ON "data_sources"("tenantId");
CREATE INDEX "data_sources_tenantId_type_idx" ON "data_sources"("tenantId", "type");
CREATE INDEX "field_mappings_dataSourceId_idx" ON "field_mappings"("dataSourceId");
CREATE INDEX "sync_runs_dataSourceId_idx" ON "sync_runs"("dataSourceId");
CREATE INDEX "sync_runs_status_idx" ON "sync_runs"("status");
CREATE INDEX "sync_runs_dataSourceId_status_idx" ON "sync_runs"("dataSourceId", "status");
CREATE UNIQUE INDEX "data_points_dataSourceId_sourceHash_key" ON "data_points"("dataSourceId", "sourceHash");
CREATE INDEX "data_points_tenantId_idx" ON "data_points"("tenantId");
CREATE INDEX "data_points_dataSourceId_idx" ON "data_points"("dataSourceId");
CREATE INDEX "aggregated_data_points_tenantId_idx" ON "aggregated_data_points"("tenantId");
CREATE INDEX "aggregated_data_points_dataSourceId_bucket_idx" ON "aggregated_data_points"("dataSourceId", "bucket");
CREATE UNIQUE INDEX "embed_configs_dashboardId_key" ON "embed_configs"("dashboardId");
CREATE UNIQUE INDEX "query_cache_key_key" ON "query_cache"("key");
CREATE INDEX "query_cache_expiresAt_idx" ON "query_cache"("expiresAt");
CREATE INDEX "dead_letter_events_tenantId_idx" ON "dead_letter_events"("tenantId");
CREATE INDEX "dead_letter_events_dataSourceId_idx" ON "dead_letter_events"("dataSourceId");
CREATE INDEX "api_keys_tenantId_idx" ON "api_keys"("tenantId");
CREATE INDEX "api_keys_prefix_idx" ON "api_keys"("prefix");
CREATE INDEX "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");
CREATE INDEX "audit_logs_tenantId_action_idx" ON "audit_logs"("tenantId", "action");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "dashboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "data_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "data_sources" ADD CONSTRAINT "data_sources_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "field_mappings" ADD CONSTRAINT "field_mappings_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "data_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sync_runs" ADD CONSTRAINT "sync_runs_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "data_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "embed_configs" ADD CONSTRAINT "embed_configs_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "dashboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "sync_runs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sync_runs" FORCE ROW LEVEL SECURITY;
ALTER TABLE "data_points" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "data_points" FORCE ROW LEVEL SECURITY;
ALTER TABLE "aggregated_data_points" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "aggregated_data_points" FORCE ROW LEVEL SECURITY;
ALTER TABLE "embed_configs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "embed_configs" FORCE ROW LEVEL SECURITY;
ALTER TABLE "query_cache" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "query_cache" FORCE ROW LEVEL SECURITY;
ALTER TABLE "dead_letter_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dead_letter_events" FORCE ROW LEVEL SECURITY;
ALTER TABLE "api_keys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "api_keys" FORCE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;
