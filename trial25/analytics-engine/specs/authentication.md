# Authentication Specification

## Overview

The Analytics Engine uses JWT-based authentication with passport-jwt strategy.
Users register with email/password, receive JWT tokens, and use them for API access.

## Registration Flow

1. User submits email and password to POST /auth/register
2. Server validates input with ValidationPipe (forbidNonWhitelisted: true)
3. Server checks for existing user with findFirst (justified: unique email lookup)
4. Password is hashed with bcryptjs using BCRYPT_SALT_ROUNDS (12)
5. User record is created with tenantId assignment
6. JWT access and refresh tokens are returned

<!-- VERIFY:AUTH-REGISTER-FLOW — Registration creates user and returns tokens -->
<!-- VERIFY:AUTH-BCRYPT-SALT — bcryptjs uses salt rounds >= 12 -->

## Login Flow

1. User submits email and password to POST /auth/login
2. Server looks up user by email with findFirst (justified: login lookup by unique email)
3. Password is compared using bcryptjs.compare()
4. If valid, JWT access and refresh tokens are generated
5. If invalid, 401 Unauthorized is returned

<!-- VERIFY:AUTH-LOGIN-FLOW — Login validates credentials and returns tokens -->
<!-- VERIFY:AUTH-LOGIN-INVALID — Invalid credentials return 401 -->

## Token Refresh

1. Client submits refresh token to POST /auth/refresh
2. Server validates the refresh token
3. If valid, new access and refresh tokens are issued
4. If invalid or expired, 401 is returned

<!-- VERIFY:AUTH-REFRESH-FLOW — Refresh endpoint issues new token pair -->

## JWT Strategy

- Access token expiry: 15 minutes (JWT_ACCESS_EXPIRY)
- Refresh token expiry: 7 days (JWT_REFRESH_EXPIRY)
- Secret loaded from process.env['JWT_SECRET']
- Strategy registered via passport-jwt ExtractJwt.fromAuthHeaderAsBearerToken()

<!-- VERIFY:AUTH-JWT-STRATEGY — JWT strategy extracts token from Bearer header -->

## Security Considerations

- Passwords are never stored in plaintext
- Tokens contain userId, email, tenantId, and role
- Login endpoint has additional throttle: @Throttle({ default: { ttl: 60000, limit: 10 } })
- Registration rejects non-whitelisted fields (e.g., isAdmin) via ValidationPipe

<!-- VERIFY:AUTH-THROTTLE-LOGIN — Login endpoint has rate limiting -->

## DTOs

### RegisterDto
- email: @IsEmail(), @MaxLength(255)
- password: @IsString(), @MinLength(8), @MaxLength(128)

### LoginDto
- email: @IsEmail(), @MaxLength(255)
- password: @IsString(), @MaxLength(128)

### RefreshDto
- refreshToken: @IsString(), @MaxLength(2048)

<!-- VERIFY:AUTH-DTO-MAXLENGTH — All auth DTOs have @MaxLength validators -->

## Error Responses

| Status | Condition |
|--------|-----------|
| 400 | Invalid input, missing fields, non-whitelisted properties |
| 401 | Invalid credentials, expired token |
| 409 | Duplicate email registration |

## Module Structure

- AuthModule imports JwtModule.registerAsync with useFactory for async config
- AuthService handles business logic with branching (if user exists, if password valid)
- AuthController exposes register, login, refresh endpoints
- JwtStrategy validates tokens and attaches user to request

## Implementation Traceability

<!-- VERIFY:AE-AUTH-001 — AuthService register method with bcrypt hashing -->
<!-- VERIFY:AE-AUTH-002 — AuthService login method with credential validation -->
<!-- VERIFY:AE-AUTH-003 — AuthService refresh method with token rotation -->
<!-- VERIFY:AE-AUTH-004 — AuthService token generation with JWT signing -->
<!-- VERIFY:AE-AUTH-005 — JWT strategy with env-based secret -->
<!-- VERIFY:AE-AUTH-CTRL-001 — Auth controller with throttled login -->
<!-- VERIFY:AE-AUTH-DTO-001 — RegisterDto with email and password validation -->
<!-- VERIFY:AE-AUTH-DTO-002 — LoginDto with email and password fields -->
<!-- VERIFY:AE-AUTH-DTO-003 — RefreshDto with refreshToken field -->
<!-- VERIFY:AE-AUTH-MOD-001 — AuthModule with JwtModule.registerAsync -->
<!-- VERIFY:AE-AUTH-UTIL-001 — canEdit utility checks ADMIN or EDITOR role -->
<!-- VERIFY:AE-AUTH-UTIL-002 — isAdmin utility checks ADMIN role -->
<!-- VERIFY:AUTH-CTRL — Auth controller implementation -->
<!-- VERIFY:AUTH-CTRL-TEST — Auth controller unit tests -->
<!-- VERIFY:AUTH-DTO-LOGIN — LoginDto class definition -->
<!-- VERIFY:AUTH-DTO-REFRESH — RefreshDto class definition -->
<!-- VERIFY:AUTH-DTO-REGISTER — RegisterDto class definition -->
<!-- VERIFY:AUTH-INT-SUITE — Auth integration test suite -->
<!-- VERIFY:AUTH-SVC — Auth service implementation -->
<!-- VERIFY:AUTH-SVC-TEST — Auth service unit tests -->
<!-- VERIFY:AUTH-UTILS — Auth utility functions -->
<!-- VERIFY:AUTH-UTILS-TEST — Auth utils unit tests -->
<!-- VERIFY:JWT-STRAT — JWT strategy implementation -->
<!-- VERIFY:JWT-STRAT-TEST — JWT strategy unit tests -->

## Cross-References

- See also: [security.md](security.md) — bcrypt, helmet, throttling, and validation controls
- See also: [api-endpoints.md](api-endpoints.md) — auth endpoint paths and response shapes
