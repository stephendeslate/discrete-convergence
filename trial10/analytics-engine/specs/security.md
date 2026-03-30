# Security Specification

## Overview

The Analytics Engine implements defense-in-depth security with JWT authentication,
role-based access control, input validation, rate limiting, CSP headers, and CORS.

See also: [Authentication](authentication.md) for JWT implementation details.
See also: [API Endpoints](api-endpoints.md) for protected routes.

## Authentication Layer

VERIFY: AE-SEC-001
RolesGuard implements RBAC by checking @Roles() metadata against JWT payload.
Guards are registered as APP_GUARD for global enforcement.

VERIFY: AE-SEC-002
JwtAuthGuard extends Passport AuthGuard('jwt') with @Public() decorator
support. Routes marked @Public() bypass authentication.

## Security Middleware

VERIFY: AE-SEC-003
Application startup validates required environment variables via
validateEnvVars() from shared package. Missing variables cause startup failure.

VERIFY: AE-SEC-004
Helmet.js CSP configuration:
- default-src: 'self'
- script-src: 'self'
- style-src: 'self' 'unsafe-inline'
- img-src: 'self' data:
- frame-ancestors: 'none'

VERIFY: AE-SEC-005
CORS configuration:
- Origin from CORS_ORIGIN environment variable (no fallback)
- Credentials: true
- Explicit methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Explicit headers: Content-Type, Authorization, X-Correlation-ID

VERIFY: AE-SEC-006
ValidationPipe configuration:
- whitelist: true (strips unknown properties)
- forbidNonWhitelisted: true (rejects unknown properties)
- transform: true (auto-transforms payload types)

## Security Tests

VERIFY: AE-SEC-007
Security integration tests verify:
- Unauthenticated request rejection
- Malformed token rejection
- RBAC enforcement (non-admin denied admin endpoints)
- Input validation (unexpected fields rejected)
- SQL injection prevention
- Public endpoint accessibility (health, metrics)
- Error response sanitization (no stack traces)
- Correlation ID in error responses

## Rate Limiting

ThrottlerModule configured with dual rate limits:
- default: 100 requests per 60 seconds
- auth: 5 requests per 60 seconds
ThrottlerGuard registered as APP_GUARD.
Health endpoints exempt via @SkipThrottle().

## Data Protection

Row Level Security on all tables ensures tenant isolation at database level.
All controller methods extract tenantId from JWT and pass to service layer.
No cross-tenant data access is possible through the API.

## Error Handling

GlobalExceptionFilter registered as APP_FILTER:
- Sanitizes error responses (no stack traces in production)
- Includes correlationId in response body
- Sanitizes request body via sanitizeLogContext from shared
- Logs full error details internally for debugging
