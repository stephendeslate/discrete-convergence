# Authentication Specification

## Overview

JWT-based authentication with bcryptjs password hashing. The authentication system
provides user registration, login with credential verification, and token refresh
functionality. All auth endpoints are in the /auth route prefix.

## Endpoints

### POST /auth/register
- Accepts: email, password, tenantId, optional role
- Checks for duplicate email via findFirst (tenant-scoped query)
- Hashes password with bcryptjs at BCRYPT_SALT_ROUNDS (12)
- Creates user record with default role VIEWER
- Returns accessToken and refreshToken pair
- Logs audit event for user creation

### POST /auth/login
- Accepts: email, password
- Rate limited: @Throttle({ short: { ttl: 1000, limit: 10 } })
- Looks up user by email via findFirst (tenant-scoped query)
- Verifies password with bcryptjs.compare
- Returns accessToken and refreshToken pair
- Logs audit event for login

### POST /auth/refresh
- Accepts: refreshToken
- Verifies refresh token using JWT_REFRESH_SECRET
- Confirms user still exists via findFirst (tenant-scoped query)
- Returns new accessToken and refreshToken pair
- Throws UnauthorizedException on invalid token

## Token Configuration

- Access token expiry: JWT_ACCESS_EXPIRATION (15m)
- Refresh token expiry: JWT_REFRESH_EXPIRATION (7d)
- Token payload: { sub, email, role, tenantId }
- Access token signed with JWT_SECRET from environment
- Refresh token signed with JWT_REFRESH_SECRET from environment

## Password Security

- bcryptjs (not bcrypt native) for cross-platform compatibility
- Salt rounds: 12 (BCRYPT_SALT_ROUNDS constant from @repo/shared)
- Passwords never stored in plaintext, only passwordHash field
- Password comparison uses timing-safe bcryptjs.compare

## JWT Strategy

- Passport JWT strategy extracts token from Authorization header
- Bearer scheme: Authorization: Bearer <token>
- Strategy validates token and attaches user payload to request
- JwtModule registered with secret from process.env.JWT_SECRET

## DTOs and Validation

- RegisterDto: @IsEmail() email, @IsString() @MinLength(8) password, @IsString() @MaxLength(36) tenantId
- LoginDto: @IsEmail() email, @IsString() @MinLength(8) password
- RefreshDto: @IsString() refreshToken
- All DTOs validated by global ValidationPipe with forbidNonWhitelisted: true

## Error Handling

- Duplicate email: ConflictException (409)
- Invalid credentials: UnauthorizedException (401)
- Invalid refresh token: UnauthorizedException (401)
- Missing fields: BadRequestException (400) via ValidationPipe

## Cross-References

- See [Security](security.md) for rate limiting, CORS, and Helmet configuration
- See [Data Model](data-model.md) for User model schema and Role enum
- See [API Endpoints](api-endpoints.md) for full endpoint listing
- See [Edge Cases](edge-cases.md) for auth boundary conditions
