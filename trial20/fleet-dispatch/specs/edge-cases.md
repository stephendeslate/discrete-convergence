# Edge Cases Specification

## Overview

This document catalogs boundary conditions, error scenarios, and edge cases
across the Fleet Dispatch system. Each entry identifies the scenario, expected
behavior, and mitigation strategy.

Cross-references: [security.md](security.md), [api-endpoints.md](api-endpoints.md)

## FD-EDGE-001: Expired JWT Token (boundary condition)

When a JWT access token expires mid-session, subsequent requests receive 401.
The frontend should detect this and redirect to login. The refresh token
endpoint allows obtaining new tokens without re-authentication.
Edge: tokens expiring exactly during a request are handled by passport-jwt
which checks exp claim before proceeding.

## FD-EDGE-002: Concurrent Dispatch Assignment (race condition, edge case)

Two dispatchers simultaneously assigning the same vehicle to different routes.
Prisma's default isolation level handles this at the database level.
Application code does not implement optimistic locking but relies on
database constraints. Edge scenario for high-concurrency environments.

## FD-EDGE-003: Empty Tenant Data (boundary condition)

A newly created tenant with no vehicles, routes, drivers, or dispatches.
All list endpoints return { data: [], total: 0, page: 1, limit: 20 }.
Frontend displays "No items found" placeholder text. This is the default
edge state after tenant creation.

## FD-EDGE-004: Maximum Pagination Limit (boundary value)

Client requests limit=999999. The clampPagination utility from shared package
caps limit at MAX_PAGE_SIZE (100). Page numbers below 1 are clamped to 1.
Edge: negative page or limit values are clamped to minimum bounds.

## FD-EDGE-005: SQL Injection via Parameterized Queries (edge security)

All raw SQL uses Prisma.sql tagged template literals which automatically
parameterize inputs. No $executeRawUnsafe calls exist in the codebase.
Edge: even tenantId values containing SQL special characters are safe.

## FD-EDGE-006: Malformed JSON Request Body (boundary condition)

Express middleware rejects malformed JSON before reaching NestJS validation.
Returns 400 Bad Request with parsing error. Edge: extremely large request
bodies are handled by default express body size limits.

## FD-EDGE-007: Cross-Tenant Data Access Attempt (edge security)

User with tenantId='A' requests vehicle belonging to tenantId='B'.
findOne method verifies vehicle.tenantId matches requesting user's tenantId.
Returns 404 Not Found (not 403) to avoid leaking existence information.
Edge boundary between authorization and information disclosure.

## FD-EDGE-008: Database Connection Failure (edge infrastructure)

PostgreSQL becomes unreachable during operation. Health/ready endpoint
returns { database: 'disconnected' }. Docker HEALTHCHECK detects failure
and triggers container restart. Prisma connection retry is handled by
the connection pool. Edge: partial connectivity or timeouts.

## FD-EDGE-009: Registration with ADMIN Role (boundary security)

Client attempts POST /auth/register with role='ADMIN'. The RegisterDto
uses @IsIn(ALLOWED_REGISTRATION_ROLES) which only permits VIEWER and
DISPATCHER. Request rejected with 400 Bad Request. Edge boundary
preventing privilege escalation.

## FD-EDGE-010: Decimal Precision for Cost Fields (boundary numeric)

Vehicle costPerMile and Dispatch cost use Decimal(12,2). Values with
more than 2 decimal places are rounded by PostgreSQL. Edge: very large
values (up to 9999999999.99) are supported by the 12-digit precision.

## FD-EDGE-011: Unicode in Text Fields (edge character handling)

Vehicle names, route origins/destinations may contain Unicode characters.
Prisma and PostgreSQL handle UTF-8 natively. Edge: emoji and multi-byte
characters in vehicle names are stored and retrieved correctly.

## FD-EDGE-012: Simultaneous Logout Across Tabs (edge session)

User logs out in one browser tab. Other tabs still have stale cookies.
Next request from other tabs fails with 401 (token already cleared).
Edge: server-side token revocation not implemented (stateless JWT).

Cross-references: [authentication.md](authentication.md), [monitoring.md](monitoring.md),
[data-model.md](data-model.md), [performance.md](performance.md)

## Summary

These edge cases cover boundary conditions at authentication, data, security,
infrastructure, and user interaction layers. All scenarios have defined
behavior and appropriate error handling.
