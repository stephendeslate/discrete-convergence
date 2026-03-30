# Data Model Specification

## Overview

Fleet Dispatch uses Prisma ORM (>=6.0.0 <7.0.0) with PostgreSQL. The schema defines 5 models (User, Vehicle, Driver, Route, Dispatch) and 4 enums, with Row Level Security at the database level for tenant isolation.

## Prisma Schema

All models include tenantId (String) for multi-tenant isolation. Models use @@map for snake_case table names and @map for enum value mapping. Database indexes are defined on tenantId, status fields, and composite keys for query performance.

<!-- VERIFY: FD-DATA-001 — PrismaService manages database connections with onModuleInit lifecycle -->

## Row Level Security

Migration SQL enables RLS (ENABLE ROW LEVEL SECURITY + FORCE ROW LEVEL SECURITY) on all 5 tables. CREATE POLICY uses TEXT comparison (no ::uuid cast) against current_setting('app.tenant_id'). SET LOCAL ensures migration safety.

<!-- VERIFY: FD-DATA-003 — AuthService.setTenantContext uses $executeRaw with Prisma.sql for tenant context -->

## Entity Relationships

- Dispatch references Vehicle, Driver, and Route via foreign keys
- All entities are scoped to a tenant via tenantId
- Decimal type used for Route.distanceKm for precision
