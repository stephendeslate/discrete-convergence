# Data Model Specification

## Overview
PostgreSQL 16 with Prisma 6 ORM, row-level security, and multi-tenant data isolation via companyId.

## Requirements

### FD-DATA-001: Database Connection
<!-- VERIFY: FD-DATA-001 -->
PrismaService manages database connections with pooling, connects on module init, and disconnects on module destroy.

### FD-DATA-002: Row-Level Security
<!-- VERIFY: FD-DATA-002 -->
All tenant-scoped queries are preceded by SET app.current_company_id via $executeRaw. RLS policies enforce data isolation at the database level.

### FD-DATA-003: Transaction Support
<!-- VERIFY: FD-DATA-003 -->
Multi-step operations use Prisma $transaction to ensure atomicity. Failed transactions roll back completely.

### FD-DATA-004: Connection Health Check
<!-- VERIFY: FD-DATA-004 -->
PrismaService.healthCheck() verifies database connectivity via SELECT 1 query, returning boolean status.

### FD-DATA-005: Unique Email Index
<!-- VERIFY: FD-DATA-005 -->
User email has a unique index ensuring no duplicate registrations. Lookup by email uses this index for performance.

### FD-DATA-006: Connection String Validation
<!-- VERIFY: FD-DATA-006 -->
Data source connection configurations are validated and sanitized before storage to prevent injection attacks.
