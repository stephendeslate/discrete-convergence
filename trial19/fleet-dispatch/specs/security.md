# Security Specification

## Overview

Fleet Dispatch implements defense-in-depth security: JWT authentication, role-based access control, tenant isolation via RLS, rate limiting, input validation, and security headers.

## JWT Authentication Guard

JwtAuthGuard extends AuthGuard('jwt') and checks for @Public() decorator via IS_PUBLIC_KEY reflector. Non-public routes without valid JWT receive 401 Unauthorized.

<!-- VERIFY: FD-SEC-001 — JwtAuthGuard validates JWT on non-public routes -->

## Role-Based Access Control

RolesGuard reads @Roles() decorator metadata. If no roles required, access is granted. Otherwise, user.role must be in the required roles array.

<!-- VERIFY: FD-SEC-002 — RolesGuard enforces role-based access via @Roles decorator -->

## Security Headers

Helmet middleware applies Content-Security-Policy with frame-ancestors 'none', preventing clickjacking. X-Powered-By is explicitly disabled before Helmet is applied.

<!-- VERIFY: FD-SEC-003 — Helmet CSP with frame-ancestors 'none' prevents clickjacking -->

## Placeholder Controllers

Dashboard controller (GET /dashboards) requires JWT authentication — no @Public() decorator. Returns tenant-scoped placeholder data.

<!-- VERIFY: FD-SEC-004 — Dashboard controller requires JWT auth (not @Public) -->

Data source controller (GET /data-sources) requires JWT authentication — no @Public() decorator. Returns tenant-scoped placeholder data.

<!-- VERIFY: FD-SEC-005 — Data source controller requires JWT auth (not @Public) -->
