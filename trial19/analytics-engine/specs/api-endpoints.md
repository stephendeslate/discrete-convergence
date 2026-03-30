# API Endpoints Specification

## Overview

RESTful CRUD endpoints for dashboards, data sources, and widgets with tenant-scoped access control.

## Requirements

### AE-API-001: Dashboard Controller
- **VERIFY**: Dashboard controller provides GET (list/detail), POST, PATCH, DELETE endpoints
- All operations extract tenantId from JWT payload via req.user
- Cache-Control: no-store header set on all GET responses

### AE-API-002: Dashboard Service
- **VERIFY**: Dashboard service filters all queries by tenantId for tenant isolation
- List endpoint uses parsePagination from shared for consistent pagination
- Service uses Prisma findFirst with justification comments for non-PK lookups

### AE-API-003: DataSource Controller
- **VERIFY**: DataSource controller provides full CRUD with tenant-scoped operations
- DELETE operations restricted to ADMIN role via @Roles decorator
- Cache-Control: no-store on GET responses

### AE-API-004: DataSource Service
- **VERIFY**: DataSource service scopes all queries to tenantId from request context
- Create operations associate data source with caller's tenant

### AE-API-005: Widget Controller
- **VERIFY**: Widget controller provides CRUD with tenant scope and RBAC
- @Roles('ADMIN') on delete prevents non-admin widget removal

### AE-API-006: Widget Service
- **VERIFY**: Widget service enforces tenant isolation on all operations
- Widgets link to both dashboard and optionally to data source

### AE-API-007: Login Endpoint
- **VERIFY**: POST /auth/login returns JWT access token on valid credentials
- Invalid credentials return 401 without revealing which field is wrong
