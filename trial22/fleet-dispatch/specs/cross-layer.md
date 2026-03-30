# Cross-Layer Specification

## Overview

This document describes end-to-end flows that span multiple layers of the
Fleet Dispatch architecture (frontend, API, database).

## Authentication Flow

1. Frontend login form submits credentials via server action
2. Server action POSTs to /auth/login API endpoint
3. API validates credentials, generates JWT tokens
4. Server action stores access_token in httpOnly cookie
5. Subsequent API calls include Authorization header from cookie

<!-- VERIFY: FD-CROSS-001 — Login flow stores token in httpOnly cookie -->

## Data Listing Flow

1. Frontend page calls server action (e.g., fetchVehicles)
2. Server action reads access_token from cookie
3. API validates JWT, extracts tenantId
4. Service queries database with tenantId filter
5. Pagination applied via parsePagination from shared
6. Response includes Cache-Control and X-Response-Time headers

<!-- VERIFY: FD-CROSS-002 — List endpoints include response headers from interceptors -->

## Error Propagation Flow

1. Database error caught by service or Prisma
2. Service throws appropriate NestJS HttpException
3. GlobalExceptionFilter catches, sanitizes, and logs
4. Error response includes correlationId for tracing
5. Frontend error.tsx component catches and displays user-friendly message

<!-- VERIFY: FD-CROSS-003 — Error responses include correlationId for tracing -->

## Tenant Isolation Flow

1. User authenticates, JWT contains tenantId
2. All controllers extract tenantId from req.user
3. All services pass tenantId to Prisma queries
4. Database RLS policies enforce isolation at the row level
5. PrismaService.setTenantContext sets session variable

<!-- VERIFY: FD-CROSS-004 — Multi-layer tenant isolation from JWT to RLS -->
