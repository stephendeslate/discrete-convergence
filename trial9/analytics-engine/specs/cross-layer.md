# Cross-Layer Integration Specification

## Overview

Cross-layer integration tests validate that the Analytics Engine layers work
correctly together end-to-end. These tests exercise the full request pipeline
from HTTP request through authentication, authorization, service logic,
database access, and response formatting.

See also: [API Endpoints Specification](api-endpoints.md) for individual endpoint contracts.
See also: [Authentication Specification](authentication.md) for auth flow details.
See also: [Security Specification](security.md) for security middleware details.

## Requirements

### Integration Pipeline

- VERIFY: AE-CROSS-001 — Cross-layer integration tests verify full request pipeline including auth, service, and DB layers

### Test Coverage

The cross-layer integration test suite validates:

1. **Full Authentication Pipeline**
   - Register → Login → Access protected resource → Verify response
   - Token propagation through Authorization header
   - Tenant context extraction from JWT payload

2. **Error Propagation**
   - Service-level errors propagate through GlobalExceptionFilter
   - Error responses include correlationId from middleware
   - Stack traces are stripped in production mode

3. **Health Check Pipeline**
   - Health endpoint bypasses auth (via @Public decorator)
   - Health endpoint bypasses rate limiting (via @SkipThrottle)
   - Ready endpoint verifies DB connectivity via $queryRaw

4. **Tenant Isolation**
   - Requests scoped to tenant from JWT payload
   - Service queries always include tenantId WHERE clause
   - Cross-tenant data access prevented at service level

5. **Response Headers**
   - X-Correlation-Id present on all responses
   - X-Response-Time present on all responses
   - CSP headers from Helmet middleware
   - CORS headers for allowed origins

## Test Architecture

Cross-layer tests use NestJS Testing module to create a complete
application instance with all modules, guards, filters, and interceptors
registered. This ensures tests exercise the same middleware pipeline
as production.

Test utilities provide:
- JWT token generation for authenticated requests
- Request helpers with automatic header attachment
- Response assertion helpers for common patterns

## Validation Criteria

- Minimum 7 cross-layer test cases
- Tests cover both success and failure paths
- Tests verify header propagation (correlation ID, response time)
- Tests verify tenant isolation enforcement
- Tests verify error sanitization in responses
