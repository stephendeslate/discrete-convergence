# Data Model Specification

## Overview

The Analytics Engine data layer uses Prisma 6 (>=6.0.0 <7.0.0) with
PostgreSQL. The schema defines 15 entities supporting multi-tenant
analytics with row-level security (RLS).

## Entity List

1. Tenant — Organization/workspace container
2. User — Authenticated user with role and tenant association
3. Dashboard — Collection of widgets, tenant-scoped
4. Widget — Visualization component within a dashboard
5. DataSource — External data connection configuration
6. DataPoint — Individual data records from data sources
7. AuditLog — Immutable record of system actions
8. EmbedToken — Tokens for embedding dashboards externally
9. RefreshToken — JWT refresh tokens for auth flow
10. Alert — Triggered notifications based on alert rules
11. AlertRule — Configurable thresholds for alerts
12. Schedule — Automated report generation schedules
13. ScheduleRun — Individual execution records of schedules
14. Notification — User-facing notification messages
15. ApiKey — API keys for programmatic access

VERIFY: AE-DATA-001 — PrismaService implements OnModuleInit and OnModuleDestroy
VERIFY: AE-DATA-002 — PrismaService extends PrismaClient

## Row-Level Security

All 15 tables have RLS enabled with:
- ALTER TABLE ... ENABLE ROW LEVEL SECURITY
- ALTER TABLE ... FORCE ROW LEVEL SECURITY
- CREATE POLICY for tenant isolation using current_setting('app.current_tenant_id')

VERIFY: AE-SEC-004 — RLS policies enforce tenant isolation at database level
VERIFY: AE-SEC-010 — setTenantContext uses parameterized SQL via Prisma.sql template

## Indexes

- All tenant-scoped tables have @@index on tenantId
- Composite indexes on frequently queried combinations
- Status fields indexed for alert and schedule queries

## Schema Conventions

- Models use @map for snake_case column names
- Enums use @map for snake_case database values
- UUIDs generated with @default(uuid())
- Timestamps with @default(now()) and @updatedAt
- Decimal type used for monetary values

## Seed Data

The seed script (prisma/seed.ts) creates:
- Admin user (ADMIN role) with bcryptjs-hashed password
- Viewer user (VIEWER role)
- Sample data source, dashboard, alert, and schedule
- Uses BCRYPT_SALT_ROUNDS from @repo/shared
- Includes main() function with proper disconnect in finally block
