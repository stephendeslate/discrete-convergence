# Security Specification

## Overview

Fleet Dispatch implements defense-in-depth security including Helmet.js CSP headers,
rate limiting via ThrottlerModule, CORS with explicit configuration, input validation
via ValidationPipe, and JWT authentication with global guard enforcement.

## Requirements

### VERIFY:FD-SEC-001 — JWT strategy extracts user from token

The JwtStrategy must extend PassportStrategy and extract user information from the JWT
payload. It must return userId (from sub), email, role, and companyId. The secret key
comes from process.env.JWT_SECRET with no fallback value.

### VERIFY:FD-SEC-002 — JwtAuthGuard as APP_GUARD with @Public() support

The JwtAuthGuard must be registered as APP_GUARD in AppModule providers. It must check
for the IS_PUBLIC_KEY metadata to allow unauthenticated access to @Public() routes.
Domain controllers must NOT use @UseGuards(JwtAuthGuard) directly.

### VERIFY:FD-SEC-003 — @Public() decorator to exempt routes from auth

The @Public() decorator must use SetMetadata to set IS_PUBLIC_KEY. It is applied to
health endpoints, metrics endpoint, and auth endpoints (login, register).

### VERIFY:FD-SEC-004 — ThrottlerGuard with default + auth rate limit configs

ThrottlerModule must be configured with two named configs:
- default: { name: 'default', ttl: 60000, limit: 100 }
- auth: { name: 'auth', ttl: 60000, limit: 5 }
ThrottlerGuard must be registered as APP_GUARD in AppModule.

### VERIFY:FD-SEC-005 — Helmet CSP, CORS, ValidationPipe in main.ts

main.ts must configure:
- Helmet with CSP: default-src 'self', script-src 'self', style-src 'self' 'unsafe-inline',
  img-src 'self' data:, frame-ancestors 'none'
- CORS from CORS_ORIGIN env (no fallback), credentials true, explicit headers + methods
- ValidationPipe with whitelist + forbidNonWhitelisted + transform

### VERIFY:FD-SEC-006 — Security integration tests

Security tests must use supertest with real AppModule. Tests must verify: CSP headers
present, X-Content-Type-Options nosniff, unauthenticated request rejection, ADMIN role
rejection on registration, extra field rejection (forbidNonWhitelisted).

## Input Validation

All DTOs use class-validator decorators:
- String fields: @IsString() + @MaxLength()
- UUID fields: @MaxLength(36)
- Email fields: @IsEmail() + @IsString() + @MaxLength()
- Enum fields: @IsIn() with constants from shared package

## Environment Variables

No environment variable may use fallback patterns like `|| 'default'`.
All required env vars are validated at startup via validateEnvVars() from shared.

## Related Specifications

- See [authentication.md](authentication.md) for auth flow details
- See [monitoring.md](monitoring.md) for error sanitization
- See [cross-layer.md](cross-layer.md) for guard chain verification
