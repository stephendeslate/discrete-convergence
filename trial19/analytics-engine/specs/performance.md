# Performance Specification

## Overview

Response timing, pagination, caching, and load handling requirements.

## Requirements

### AE-PERF-001: Pagination
- **VERIFY**: parsePagination() clamps page size to MAX_PAGE_SIZE from shared constants
- Default page size applied when not specified
- Page and limit parameters validated as positive integers

### AE-PERF-002: Response Time Header
- **VERIFY**: ResponseTimeInterceptor sets X-Response-Time header on every response
- Value is in milliseconds with decimal precision

### AE-PERF-003: Cache Control
- **VERIFY**: All list GET endpoints set Cache-Control: no-store header
- Prevents stale data in multi-tenant environment
