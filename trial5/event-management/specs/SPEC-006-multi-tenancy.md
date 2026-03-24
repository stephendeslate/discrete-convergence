# SPEC-006: Multi-Tenancy

**Status:** APPROVED
**Priority:** P0
**Cross-References:** SPEC-001 (Authentication), SPEC-008 (Security)

## Overview

Multi-tenant isolation enforced at the application service layer via tenantId
from JWT payload, with supplementary Row Level Security policies in PostgreSQL.

## Requirements

### VERIFY:EM-TENANT-001 — Service-Layer Isolation
All tenant-scoped services (Event, Venue, AuditLog) filter queries by tenantId
extracted from the authenticated user's JWT payload. TenantId is never accepted
from request body for scoped queries.

### VERIFY:EM-TENANT-002 — RLS Policies
All tables have ROW LEVEL SECURITY enabled with FORCE ROW LEVEL SECURITY.
Policies are defined in the initial migration SQL as a defense-in-depth measure.

### VERIFY:EM-TENANT-003 — Subscription Tiers
Tenants have subscription tiers: FREE, PRO, ENTERPRISE. Managed by ADMIN users
via the TenantController (SPEC-009).

## Architecture

### Application Layer
- JWT payload includes tenantId
- Controllers extract tenantId from req.user
- Services accept tenantId parameter and include in WHERE clauses
- Create operations override tenantId from JWT (ignore body value)

### Database Layer
- RLS enabled on all tables as defense-in-depth
- Current policies use USING (true) — application-layer enforcement primary
- Future: row-level policies with session variables for direct DB access

## Tenant Management

TenantController restricted to ADMIN role at class level:
- CRUD operations for tenant entities
- Subscription tier management
- Brand customization (color, logo URL)
