# Data Model Specification

## Overview

Fleet Dispatch uses Prisma ORM with PostgreSQL 16. The schema defines six core
models: Tenant, User, Vehicle, Driver, Dispatch, and Route. All models use
`@@map` for table name mapping. All enums use `@@map` with `@map` on values.
Row Level Security enforces tenant isolation at the database level.

## Prisma Service

<!-- VERIFY: FD-DATA-001 -->
The `PrismaService` extends `PrismaClient` and implements `OnModuleInit`. It
calls `$connect()` during module initialization. The service is provided via a
`@Global()` `PrismaModule` so all feature modules can inject it without
importing the module explicitly.

## Schema Design Principles

All models follow these conventions:
- Primary keys: `id String @id @default(cuid())`
- Timestamps: `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`
- Tenant foreign key: `tenantId String` with `@relation` to Tenant
- Table mapping: `@@map("table_name")` on every model
- Enum mapping: `@@map("enum_name")` on every enum, `@map("value")` on each value
- Indexes: `@@index([tenantId])`, `@@index([status])`, `@@index([tenantId, status])`

## Monetary Fields

All monetary fields (e.g., `estimatedCost` on Dispatch, `maxLoad` capacity values)
use `Decimal @db.Decimal(12,2)` — never `Float`. This prevents floating-point
rounding errors in financial calculations.

## Raw SQL for Aggregation

<!-- VERIFY: FD-DATA-003 -->
The `DispatchService` uses `$executeRaw` with `Prisma.sql` tagged template literals
for safe parameterized queries when performing bulk operations or aggregations
that cannot be expressed through the Prisma query API. This avoids SQL injection
while enabling complex database operations.

## Row Level Security

The initial migration creates RLS policies for all six tables. Each policy:
1. Enables RLS: `ALTER TABLE "table" ENABLE ROW LEVEL SECURITY`
2. Forces RLS: `ALTER TABLE "table" FORCE ROW LEVEL SECURITY`
3. Creates policy: `CREATE POLICY "table_tenant_isolation" ON "table"`
4. Uses TEXT comparison: `tenant_id = current_setting('app.tenant_id')` — no `::uuid` cast
   since `tenant_id` is a TEXT column (cuid format, not UUID)

The application sets the tenant context via `SET LOCAL "app.tenant_id" = $1`
before each query in a transaction block.

## Indexes

Every model with a `tenantId` field has three indexes:
- `@@index([tenantId])` — for tenant-scoped queries
- `@@index([status])` — for status filtering (where applicable)
- `@@index([tenantId, status])` — for combined tenant + status queries

Foreign key columns also have implicit indexes from the `@relation` directive.

## Cross-References

- Prisma version constraints: see [infrastructure.md](infrastructure.md) (FD-INFRA-001)
- Tenant isolation enforcement in application layer: see [security.md](security.md) (FD-SEC-001)
- N+1 query prevention with Prisma includes: see [cross-layer.md](cross-layer.md) (FD-PERF-003)
- Seed data for development: see prisma/seed.ts in the API package

## Entity Relationships

- Tenant → User (one-to-many)
- Tenant → Vehicle (one-to-many)
- Tenant → Driver (one-to-many)
- Tenant → Dispatch (one-to-many)
- Tenant → Route (one-to-many)
- Vehicle → Dispatch (one-to-many)
- Driver → Dispatch (one-to-many)
- Route → Dispatch (one-to-many)
