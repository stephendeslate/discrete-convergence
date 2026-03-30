# Cross-Layer Specification

## Overview
Cross-cutting concerns that span multiple architectural layers.

## Requirements

### FD-CROSS-001: Correlation ID Middleware
<!-- VERIFY: FD-CROSS-001 -->
CorrelationIdMiddleware applied globally via AppModule.configure(). Reads X-Correlation-ID from incoming request or generates new UUID.

### FD-CROSS-002: Response Time Header
<!-- VERIFY: FD-CROSS-002 -->
ResponseTimeInterceptor adds X-Response-Time header to every response, measuring request processing duration in milliseconds.

### FD-CROSS-003: Shared Package
<!-- VERIFY: FD-CROSS-003 -->
@repo/shared package exports constants (APP_VERSION, BCRYPT_SALT_ROUNDS, pagination limits, status enums) and utilities (createCorrelationId, formatLogEntry, sanitizeLogContext, validateEnvVars, clampPagination) consumed by >= 3 modules per app.

### FD-CROSS-004: Seed Data Isolation
<!-- VERIFY: FD-CROSS-004 -->
Prisma seed populates all entity types with cross-company isolation, ensuring multi-tenant test data covers both companies with distinct records.
