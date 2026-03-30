# Cross-Layer Integration Specification

## Overview

Fleet Dispatch uses a layered architecture where middleware, guards, interceptors, and pipes compose a request processing pipeline. This spec covers cross-cutting integration points.

## Module Composition

AppModule imports all domain modules and configures global guards (ThrottlerGuard, JwtAuthGuard, RolesGuard), global filters (GlobalExceptionFilter), global interceptors (ResponseTimeInterceptor), and middleware (CorrelationId, RequestLogging) for all routes.

<!-- VERIFY: FD-CROSS-001 — AppModule composes all guards, filters, interceptors, and middleware -->

## Response Time Tracking

ResponseTimeInterceptor measures request processing time and sets X-Response-Time header on every response. This enables performance monitoring and SLA verification.

<!-- VERIFY: FD-PERF-001 — ResponseTimeInterceptor sets X-Response-Time header -->

## Pagination Validation

PaginatedQueryDto validates page and limit query parameters using class-validator. Limit is capped at MAX_PAGE_SIZE from shared constants to prevent unbounded queries.

<!-- VERIFY: FD-PERF-002 — PaginatedQueryDto validates and caps pagination parameters -->

## Pagination Utilities

clampPagination and buildPaginatedResult from shared package are re-exported for service-level pagination logic. All list endpoints use these utilities for consistent pagination behavior.

<!-- VERIFY: FD-PERF-003 — Pagination utilities from shared enforce consistent pagination -->
