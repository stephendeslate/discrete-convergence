# Analytics Engine — Build Plan

## Overview

A multi-tenant embeddable analytics platform that lets SaaS companies configure data sources, build dashboards via UI, and embed branded analytics into their products with a single script tag. Data ingestion pipeline with connectors (REST API, PostgreSQL, CSV, webhook), schema mapping, transform steps, and sync scheduling. Chart builder, real-time updates via SSE, white-label theming, and an embed API via iframe.

## Legal Caveats

- All charting libraries are MIT/BSD/ISC — zero licensing risk
- No data privacy concerns with synthetic analytics data
- Position as "I built the infrastructure" not "competing with Metabase"
- No disclaimers legally required, but include one for professionalism

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11 + Prisma 6 + PostgreSQL 16 (RLS) |
| Frontend | Next.js 15 App Router + shadcn/ui + Tailwind CSS 4 |
| Charts | Recharts 3 + D3.js |
| Embed | iframe with postMessage API |
| Real-time | Server-Sent Events (SSE) via Redis pub/sub |
| Queue | BullMQ 5 + Redis 7 |
| Testing | Vitest |
| Monorepo | Turborepo 2 + pnpm workspaces |

## Architecture

### Monorepo Structure

```
analytics-engine/
  apps/
    api/           # NestJS 11 backend (port 3001)
    web/           # Next.js 15 admin portal (port 3000)
    embed/         # Next.js 15 embed renderer (port 3002)
  packages/
    shared/        # Shared types, Zod schemas, enums
  specs/           # Specification documents
```

### Multi-Tenant Data Isolation

```
Request → JWT auth middleware → extract tenantId
  → Prisma middleware: SET LOCAL app.current_tenant_id
  → RLS policies enforce row-level isolation
  → Response scoped to tenant data only
```

### Data Ingestion Pipeline

```
Tenant configures connector (API, PostgreSQL, CSV upload, webhook)
  → Pipeline validates schema + maps fields to dimensions/metrics
  → BullMQ job runs on schedule (or on webhook receipt)
  → Raw data extracted → transformed (flatten, cast, derive fields)
  → Loaded into DataPoint table (tenant-scoped via RLS)
  → Aggregation jobs roll up into time-bucketed summaries
  → Dashboard widgets query aggregated data
```

### Embed Flow

```
Tenant admin → Configure dashboard in builder
  → Set charts, data sources, filters, theme
  → Publish dashboard → Generate embed code (iframe + API key)
  → End users see branded dashboard with live data via SSE
```

### Data Model

| Entity | Purpose |
|--------|---------|
| Tenant | Organization with theme, tier (FREE/PRO/ENTERPRISE), and billing |
| Dashboard | Container for widgets. Status: DRAFT → PUBLISHED → ARCHIVED |
| Widget | Chart/table/KPI bound to a DataSource, positioned via CSS Grid |
| DataSource | External data connection (REST, PostgreSQL, CSV, Webhook) |
| DataSourceConfig | Encrypted connector credentials (AES-256-GCM) and transform steps |
| FieldMapping | Maps source fields to internal dimension/metric fields |
| SyncRun | Record of a single data sync attempt (IDLE → RUNNING → COMPLETED/FAILED) |
| DataPoint | Ingested data row with JSONB dimensions and metrics |
| AggregatedDataPoint | Pre-aggregated time buckets for query performance |
| EmbedConfig | Per-dashboard embed settings (allowed origins, enabled flag) |
| QueryCache | Cached widget query results with TTL (5min/1min/30s by tier) |
| DeadLetterEvent | Failed ingestion rows for debugging and retry |
| ApiKey | ADMIN or EMBED key with hash, prefix, expiry |
| AuditLog | Immutable event log for all tenant actions |

### Connector Types

- **REST API** — poll external endpoint on cron schedule, JSONPath field mapping
- **PostgreSQL** — read-only connection string, SQL query per sync, column-to-dimension mapping
- **CSV upload** — manual file upload, column mapping UI, import as batch
- **Webhook** — tenant receives a unique ingest URL, POST events in real-time

### Widget Types

- **Line Chart** — time series trends
- **Bar Chart** — categorical comparison
- **Pie/Donut** — distribution
- **Area Chart** — stacked trends
- **KPI Card** — single metric with trend arrow
- **Table** — sortable data grid with pagination
- **Funnel** — conversion steps with drop-off percentages

## Feature Inventory

### API Endpoints (apps/api)

- **Auth**: POST /auth/login, POST /auth/register, POST /auth/refresh
- **Tenants**: GET/PATCH /tenants/me, GET /tenants/me/usage
- **Dashboards**: CRUD /dashboards, PATCH /dashboards/:id/publish, PATCH /dashboards/:id/archive
- **Widgets**: CRUD /dashboards/:id/widgets, PATCH /widgets/:id/position
- **DataSources**: CRUD /data-sources, POST /data-sources/:id/sync, GET /data-sources/:id/sync-history
- **Data**: GET /data-sources/:id/preview, GET /widgets/:id/data
- **Embed**: GET /embed/:dashboardId/config, SSE /embed/:dashboardId/stream
- **API Keys**: POST /api-keys, GET /api-keys, DELETE /api-keys/:id
- **Audit**: GET /audit-log

### Frontend Pages (apps/web)

- Login/Register
- Dashboard list, Dashboard builder (grid layout + widget config)
- Data source list, Connector config wizard, Sync history
- Embed settings (allowed origins, theme overrides, code snippet)
- API key management
- Tenant settings (branding, tier info)

### Key Business Rules

- Widget count per dashboard capped at 20
- DataSource count per tenant capped by tier: 3 (Free), 20 (Pro), unlimited (Enterprise)
- Sync schedule options restricted by tier: MANUAL only (Free), all schedules (Pro/Enterprise)
- Sync auto-pauses after 5 consecutive failures; requires explicit resume
- Dashboard must be PUBLISHED before embed is functional
- EmbedConfig.allowedOrigins uses exact origin matching, not wildcard
- DataSourceConfig.configEncrypted is never logged, never in API responses, never in QueryCache
- sourceHash on DataPoint ensures idempotent sync — duplicate rows silently skipped

## Key Dependencies

```json
{
  "recharts": "^3.x",
  "d3-scale": "^4.x",
  "d3-shape": "^3.x",
  "@prisma/client": "^6.x",
  "@nestjs/bullmq": "^11.x",
  "bullmq": "^5.x",
  "date-fns": "^4.x",
  "zod": "^3.x"
}
```

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Chart builder scope creep | Dropdown-based config only, NO drag-and-drop for widgets |
| Dashboard layout complexity | CSS Grid with fixed column count, not free-form |
| Real-time performance | SSE at 10-second intervals against pre-aggregated data |
| Embed security | API key + allowedOrigins whitelist + CSP frame-ancestors |
| SSE connection limit | Browsers limit 6 SSE per domain on HTTP/1.1; use HTTP/2 |
| Seed data quality | Invest in realistic distributions (seasonality, correlated metrics) |
| Recharts v3 API changes | Verify component APIs against v3 docs; v2 tutorials may not apply |
| Pipeline scope creep | 4 connector types max — no Kafka, no S3, no custom protocols |
| External DB credentials | Encrypt at rest (AES-256-GCM), never log, never return in API |
| Sync job failures | Dead letter queue + sync history UI for inspection and retry |
| Webhook abuse | Rate limit per tenant ingest URL, validate payload size (max 1MB) |
