# SPEC-008: Security

> **Status:** APPROVED
> **Priority:** P0
> **Cross-references:** SPEC-001 (authentication), SPEC-006 (multi-tenancy)

## Overview

Security is enforced at multiple layers: authentication, authorization, input
validation, rate limiting, HTTP security headers, and database-level policies.

## Requirements

### Authentication Guards
<!-- VERIFY: security-guards -->
- JwtAuthGuard is applied globally via APP_GUARD in AppModule
- RolesGuard is applied globally via APP_GUARD in AppModule
- ThrottlerGuard is applied globally via APP_GUARD for rate limiting
- Protected controller methods use @UseGuards(JwtAuthGuard, RolesGuard) and @Roles(Role.X)
- @Public() decorator exempts routes from JWT authentication

### RBAC Authorization
<!-- VERIFY: security-rbac -->
- Three roles: ADMIN, USER, VIEWER
- ADMIN: full CRUD access including delete operations
- USER: create, read, update operations
- VIEWER: read-only access
- Role is checked via RolesGuard against @Roles() decorator values
- Self-registration restricted to USER and VIEWER roles only

### Input Validation
<!-- VERIFY: security-validation -->
- Global ValidationPipe with whitelist: true, forbidNonWhitelisted: true, transform: true
- All DTOs use class-validator decorators (@IsString, @IsEmail, @MaxLength, etc.)
- Request body fields not in the DTO are stripped (whitelist)
- Unknown fields cause 400 Bad Request (forbidNonWhitelisted)

### Rate Limiting
<!-- VERIFY: security-rate-limit -->
- ThrottlerModule configured with 100 requests per 60 seconds per IP
- Applied globally via APP_GUARD

### HTTP Security Headers
<!-- VERIFY: security-headers -->
- Helmet middleware applied in main.ts bootstrap
- Sets security headers: X-Frame-Options, X-Content-Type-Options, etc.
- CORS configured with explicit origin from CORS_ORIGIN env var

### Password Security
<!-- VERIFY: security-password -->
- Passwords hashed with bcrypt at 12 salt rounds (BCRYPT_SALT_ROUNDS from shared)
- Minimum 8 characters enforced via @MinLength(8) on RegisterDto
- Password fields redacted in logs via sanitizeLogContext

### Environment Variables
<!-- VERIFY: security-env -->
- Required env vars validated at bootstrap: DATABASE_URL, JWT_SECRET
- JWT_SECRET used for both access and refresh token signing
- No secrets in source code; all via environment configuration
