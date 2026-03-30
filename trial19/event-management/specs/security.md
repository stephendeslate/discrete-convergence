# Security Specification

## Overview

Security architecture for the Event Management platform.
Defense-in-depth approach with multiple security layers applied globally.

## Authentication Guards

- JwtAuthGuard applied as APP_GUARD (global)
- Public routes bypass via @Public() decorator and IS_PUBLIC_KEY metadata
- VERIFY: EM-SEC-001 — @Public() decorator sets IS_PUBLIC_KEY metadata
- VERIFY: EM-SEC-005 — JwtAuthGuard checks IS_PUBLIC_KEY via Reflector

## Role-Based Access Control

- RolesGuard applied as APP_GUARD after JwtAuthGuard
- Controllers annotate methods with @Roles('ADMIN') to restrict access
- If no roles required, access is granted to any authenticated user
- VERIFY: EM-SEC-002 — @Roles() decorator sets ROLES_KEY metadata
- VERIFY: EM-SEC-003 — RolesGuard denies access when user role not in required roles

## JWT Strategy

- Extracts JWT from Authorization header as Bearer token
- Validates signature using JWT_SECRET from environment
- Returns user payload (sub, email, role, tenantId) to request context
- VERIFY: EM-SEC-004 — JwtStrategy uses ExtractJwt.fromAuthHeaderAsBearerToken()

## HTTP Security Headers

- X-Powered-By header disabled before any middleware
- Helmet middleware applies Content-Security-Policy with frame-ancestors:'none'
- CORS configured via CORS_ORIGIN environment variable

## Input Validation

- ValidationPipe applied globally with whitelist and forbidNonWhitelisted
- transform enabled to auto-convert types
- Extra properties in request body are stripped and rejected

## Tenant Isolation

- All domain controllers extract tenantId from req.user
- Prisma queries filter by tenantId on every operation
- Row Level Security enforced at database level as additional safeguard

## SQL Injection Prevention

- Prisma parameterizes all queries
- $executeRaw uses tagged template literals only
- No string concatenation in database queries
