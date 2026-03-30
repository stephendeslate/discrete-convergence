# Data Layer Specification

## Overview

Data persistence and access patterns for the Event Management platform.
Uses Prisma ORM with PostgreSQL and Row Level Security for tenant isolation.

## ORM Configuration

- Prisma ORM with PostgreSQL provider
- Schema defines User, Event, Venue, Attendee, Registration models
- All models include tenantId for multi-tenant isolation
- VERIFY: EM-DATA-001 — Event service uses Prisma for all CRUD operations
- VERIFY: EM-DATA-004 — PrismaService extends PrismaClient with onModuleInit

## Row Level Security

- RLS enabled and forced on all domain tables
- Policies use current_setting('app.tenant_id') for filtering
- Tenant ID column compared as TEXT (no ::uuid cast)
- SET LOCAL used for session-scoped tenant context

## Tenant Context

- Before each query, tenant context is set via SET LOCAL
- Uses $executeRaw with parameterized template literals
- VERIFY: EM-DATA-005 — setTenantContext uses $executeRaw with SET LOCAL

## Query Patterns

- findMany with skip/take for paginated queries
- findFirst with justification comment for single-record lookups
- create/update/delete with tenantId filter
- VERIFY: EM-DATA-003 — Registration service filters by tenantId on all queries

## Database Migrations

- Initial migration creates all tables with proper types
- Enums created as PostgreSQL types with @map for snake_case
- @@map on models for snake_case table names
- @map on fields for snake_case column names
- RLS policies created in same migration

## Seed Data

- Admin user (admin@example.com) with hashed password
- Viewer user (viewer@example.com) with hashed password
- Sample venue, events (3 different statuses), attendee, registrations
- Uses BCRYPT_SALT_ROUNDS from shared constants
- Error handling with process.exit(1) on failure

## Connection Health

- GET /health/ready verifies database connectivity
- Uses $queryRaw to execute SELECT 1
- Returns database status in health check response
