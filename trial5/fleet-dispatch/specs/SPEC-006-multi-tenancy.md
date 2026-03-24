# SPEC-006: Multi-Tenancy

**Status:** APPROVED
**Domain:** Architecture — Multi-Tenancy
**Cross-references:** [SPEC-001](SPEC-001-authentication.md), [SPEC-007](SPEC-007-audit-logging.md), [SPEC-008](SPEC-008-security.md)

## Overview

Fleet Dispatch is a multi-tenant application. Each tenant represents an independent
logistics company. Data isolation is enforced at both the application and database
layers.

## Tenant Model

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | PK, auto-generated |
| name | VARCHAR(255) | Required |
| tier | TenantTier | Default: FREE |
| settings | JSON | Default: {} |

## Tenant Tiers

- `FREE` — basic tier with default limits
- `PRO` — expanded limits (e.g., more vehicles, drivers)
- `ENTERPRISE` — custom limits and features

<!-- VERIFY:FD-TENANT-001 — tenant CRUD service with pagination -->
<!-- VERIFY:FD-TENANT-002 — tenant controller (ADMIN-only for all operations) -->

## Application-Level Isolation

1. JWT token includes `tenantId` claim
2. `@TenantId()` decorator extracts `tenantId` from the authenticated user
3. All service methods receive `tenantId` and scope queries accordingly
4. `findOne` methods verify `tenantId` matches before returning data

## Database-Level Isolation (RLS)

Row Level Security (RLS) is enabled on all tenant-scoped tables:
- `users`, `vehicles`, `drivers`, `routes`, `deliveries`, `audit_logs`
- Policy: `USING ("tenant_id" = current_setting('app.current_tenant_id', true)::uuid)`
- RLS provides defense-in-depth alongside application-level filtering

## Tenant Management API

Tenant CRUD is restricted to ADMIN role only:

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| POST | /tenants | ADMIN | Create tenant |
| GET | /tenants | ADMIN | List tenants (paginated) |
| GET | /tenants/:id | ADMIN | Get tenant detail |
| PUT | /tenants/:id | ADMIN | Update tenant |
| DELETE | /tenants/:id | ADMIN | Delete tenant |

## Cross-Tenant Prevention

- Users cannot access resources from other tenants
- No endpoint exposes cross-tenant data
- Audit logs are also tenant-scoped
