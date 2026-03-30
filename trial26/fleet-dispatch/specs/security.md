# Security Specification

## Overview

The Fleet Dispatch platform implements multiple layers of security including
authentication, authorization, input validation, rate limiting, HTTP security
headers, CORS, and database-level Row-Level Security.

## Authentication

- JWT-based authentication with access and refresh tokens
- Access token: 15 minute expiry, signed with JWT_SECRET
- Refresh token: 7 day expiry, signed with JWT_REFRESH_SECRET
- bcryptjs with 12 salt rounds for password hashing
- Passport JWT strategy for token extraction and validation

## Authorization

- Role-based access control: ADMIN, OPERATOR, VIEWER
- TenantGuard ensures all requests have valid tenantId
- JwtAuthGuard validates JWT tokens on protected routes
- Health endpoints exempt from authentication

## Rate Limiting

- Global rate limiting via ThrottlerModule
- ThrottlerGuard registered as APP_GUARD
- Default limit: 100000 requests per 60 seconds (high for load testing)
- Login endpoint: @Throttle({ short: { ttl: 1000, limit: 10 } })
- Register endpoint: @Throttle({ default: { ttl: 60000, limit: 10 } })

## HTTP Security Headers

### Helmet Middleware
- Content-Security-Policy with strict directives
  - defaultSrc: ['self']
  - scriptSrc: ['self']
  - styleSrc: ['self', 'unsafe-inline']
  - imgSrc: ['self', 'data:']
  - connectSrc: ['self']
  - fontSrc: ['self']
  - objectSrc: ['none']
  - frameSrc: ['none']
- X-Frame-Options, X-Content-Type-Options, etc.

### CORS Configuration
- Origin: process.env.CORS_ORIGIN ?? '*'
- Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization, x-correlation-id
- Credentials: true

## Input Validation

- Global ValidationPipe with:
  - whitelist: true (strips unknown properties)
  - forbidNonWhitelisted: true (rejects unknown properties)
  - transform: true (auto-transforms types)
- @MaxLength() on all string DTO fields
- @MaxLength(36) on all UUID DTO fields
- @IsEmail() on email fields
- @MinLength(8) on password fields

## Database Security

### Row-Level Security (RLS)
- ENABLE ROW LEVEL SECURITY on all tenanted tables
- FORCE ROW LEVEL SECURITY to prevent superuser bypass
- Policies use current_setting('app.tenant_id', true)
- PrismaService.setTenantContext() sets tenant context per request
- All findFirst() calls annotated with // tenant-scoped query

### SQL Injection Prevention
- Prisma ORM parameterizes all queries
- No raw SQL in application code (except RLS setup)
- Input validation prevents malicious payloads

## Code Quality Rules

- Zero `as any` casts in API source code
- Zero `console.log` in API source code
- Logger service used for all logging (nestjs-pino)

## Cross-References

- See [Authentication](authentication.md) for JWT flow and password hashing details
- See [Infrastructure](infrastructure.md) for Docker security and environment configuration
- See [Monitoring](monitoring.md) for health check endpoints and metrics
- See [Data Model](data-model.md) for RLS-enabled table definitions
