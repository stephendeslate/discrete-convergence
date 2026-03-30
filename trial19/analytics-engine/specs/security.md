# Security Specification

## Overview

Multi-layered security with JWT auth, RBAC, rate limiting, CSP, and sanitized error responses.

## Requirements

### AE-SEC-001: JWT Expiry
- **VERIFY**: JWT tokens expire in 1 hour (expiresIn: '1h')
- No refresh token rotation in initial implementation

### AE-SEC-002: RBAC Guard
- **VERIFY**: RolesGuard checks JWT role against @Roles() metadata on controller methods
- Routes without @Roles allow any authenticated user

### AE-SEC-003: Helmet CSP
- **VERIFY**: Helmet configured with frame-ancestors: 'none' and x-powered-by disabled
- CSP restricts script, style, and image sources to self

### AE-SEC-004: Error Sanitization
- **VERIFY**: GlobalExceptionFilter excludes stack traces from error responses
- Responses include correlationId for debugging without exposing internals

### AE-SEC-005: Startup Validation
- **VERIFY**: Application validates required env vars at startup before accepting requests
- Missing DATABASE_URL, JWT_SECRET, or JWT_REFRESH_SECRET causes immediate exit

### AE-SEC-006: CORS Configuration
- **VERIFY**: CORS origin loaded from CORS_ORIGIN env var with localhost fallback
- Credentials enabled, allowed headers include Authorization and X-Correlation-ID
