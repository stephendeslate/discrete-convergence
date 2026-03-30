-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'user', 'viewer');
CREATE TYPE "widget_type" AS ENUM ('bar_chart', 'line_chart', 'pie_chart', 'table', 'kpi', 'scatter_plot');
CREATE TYPE "data_source_type" AS ENUM ('postgresql', 'mysql', 'rest_api', 'csv');
CREATE TYPE "data_source_status" AS ENUM ('active', 'inactive', 'error', 'connecting');
CREATE TYPE "dashboard_status" AS ENUM ('draft', 'published', 'archived');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'user',
    "tenantId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dashboards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "dashboard_status" NOT NULL DEFAULT 'draft',
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboards_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "widgets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "widget_type" NOT NULL,
    "config" TEXT NOT NULL DEFAULT '{}',
    "dashboardId" TEXT NOT NULL,
    "dataSourceId" TEXT,
    "position_x" INTEGER NOT NULL DEFAULT 0,
    "position_y" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER NOT NULL DEFAULT 4,
    "height" INTEGER NOT NULL DEFAULT 3,
    "tenantId" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "widgets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "data_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "data_source_type" NOT NULL,
    "connection_string" TEXT,
    "status" "data_source_status" NOT NULL DEFAULT 'active',
    "tenantId" TEXT NOT NULL,
    "last_sync_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "query_executions" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "data_source_id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "execution_time" INTEGER NOT NULL,
    "row_count" INTEGER NOT NULL DEFAULT 0,
    "cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "query_executions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");
CREATE INDEX "users_email_idx" ON "users"("email");

CREATE INDEX "dashboards_tenantId_idx" ON "dashboards"("tenantId");
CREATE INDEX "dashboards_status_idx" ON "dashboards"("status");
CREATE INDEX "dashboards_tenantId_status_idx" ON "dashboards"("tenantId", "status");
CREATE INDEX "dashboards_userId_idx" ON "dashboards"("userId");

CREATE INDEX "widgets_tenantId_idx" ON "widgets"("tenantId");
CREATE INDEX "widgets_dashboardId_idx" ON "widgets"("dashboardId");
CREATE INDEX "widgets_dataSourceId_idx" ON "widgets"("dataSourceId");

CREATE INDEX "data_sources_tenantId_idx" ON "data_sources"("tenantId");
CREATE INDEX "data_sources_status_idx" ON "data_sources"("status");
CREATE INDEX "data_sources_tenantId_status_idx" ON "data_sources"("tenantId", "status");

CREATE INDEX "query_executions_tenantId_idx" ON "query_executions"("tenantId");
CREATE INDEX "query_executions_data_source_id_idx" ON "query_executions"("data_source_id");
CREATE INDEX "query_executions_tenantId_status_idx" ON "query_executions"("tenantId", "status");

-- AddForeignKey
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "dashboards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "widgets" ADD CONSTRAINT "widgets_dataSourceId_fkey" FOREIGN KEY ("dataSourceId") REFERENCES "data_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Row Level Security
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

ALTER TABLE "query_executions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "query_executions" FORCE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_query_executions" ON "query_executions"
  USING ("tenantId" = current_setting('app.current_tenant_id'));
