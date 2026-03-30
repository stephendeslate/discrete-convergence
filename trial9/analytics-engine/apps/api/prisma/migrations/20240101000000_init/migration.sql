-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'user', 'viewer');
CREATE TYPE "dashboard_status" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "data_source_type" AS ENUM ('postgresql', 'mysql', 'rest_api', 'csv');
CREATE TYPE "widget_type" AS ENUM ('bar_chart', 'line_chart', 'pie_chart', 'table', 'kpi', 'metric_card');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'user',
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dashboards" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "dashboard_status" NOT NULL DEFAULT 'draft',
    "tenantId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "widgets" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "widget_type" NOT NULL,
    "config" TEXT NOT NULL DEFAULT '{}',
    "dashboardId" TEXT NOT NULL,
    "dataSourceId" TEXT,
    "tenantId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "widgets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "data_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "data_source_type" NOT NULL,
    "connectionString" TEXT,
    "config" TEXT NOT NULL DEFAULT '{}',
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "metrics" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DECIMAL(12,2) NOT NULL,
    "unit" TEXT,
    "tenantId" TEXT NOT NULL,
    "dashboardId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "dashboards_tenantId_idx" ON "dashboards"("tenantId");
CREATE INDEX "dashboards_status_idx" ON "dashboards"("status");
CREATE INDEX "dashboards_tenantId_status_idx" ON "dashboards"("tenantId", "status");
CREATE INDEX "dashboards_createdById_idx" ON "dashboards"("createdById");
CREATE INDEX "widgets_tenantId_idx" ON "widgets"("tenantId");
CREATE INDEX "widgets_dashboardId_idx" ON "widgets"("dashboardId");
CREATE INDEX "widgets_dataSourceId_idx" ON "widgets"("dataSourceId");
CREATE INDEX "widgets_tenantId_dashboardId_idx" ON "widgets"("tenantId", "dashboardId");
CREATE INDEX "data_sources_tenantId_idx" ON "data_sources"("tenantId");
CREATE INDEX "data_sources_type_idx" ON "data_sources"("type");
CREATE INDEX "data_sources_tenantId_type_idx" ON "data_sources"("tenantId", "type");
CREATE INDEX "metrics_tenantId_idx" ON "metrics"("tenantId");
CREATE INDEX "metrics_dashboardId_idx" ON "metrics"("dashboardId");
CREATE INDEX "metrics_tenantId_dashboardId_idx" ON "metrics"("tenantId", "dashboardId");

-- AddForeignKey
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "dashboards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "data_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Row Level Security
-- Set dummy value during migration so policies can be created
SET LOCAL app.current_tenant_id = '00000000-0000-0000-0000-000000000000';

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_users" ON "users"
  USING ("tenantId" = current_setting('app.current_tenant_id'));

ALTER TABLE "dashboards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dashboards" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_dashboards" ON "dashboards"
  USING ("tenantId" = current_setting('app.current_tenant_id'));

ALTER TABLE "widgets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "widgets" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_widgets" ON "widgets"
  USING ("tenantId" = current_setting('app.current_tenant_id'));

ALTER TABLE "data_sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "data_sources" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_data_sources" ON "data_sources"
  USING ("tenantId" = current_setting('app.current_tenant_id'));

ALTER TABLE "metrics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "metrics" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_metrics" ON "metrics"
  USING ("tenantId" = current_setting('app.current_tenant_id'));
