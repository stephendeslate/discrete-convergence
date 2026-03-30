# Authentication Specification

## Overview

JWT-based authentication with bcryptjs password hashing, role-based access control, and tenant isolation.

## Requirements

### AE-AUTH-001: Password Hashing
- **VERIFY**: Passwords are hashed using bcryptjs with BCRYPT_SALT_ROUNDS from shared constants
- Registration stores only the hash; raw passwords are never persisted
- Duplicate email registration returns 409 Conflict

### AE-AUTH-002: JWT Strategy
- **VERIFY**: JWT strategy extracts token from Authorization Bearer header
- Secret loaded from `process.env.JWT_SECRET!` with no fallback
- Payload includes userId, email, role, tenantId

### AE-AUTH-003: Registration DTO Validation
- **VERIFY**: RegisterDto validates email format, string fields, max lengths, and allowed roles
- ADMIN role is excluded from self-registration via ALLOWED_REGISTRATION_ROLES
- forbidNonWhitelisted rejects unknown properties

### AE-AUTH-004: JWT Auth Guard
- **VERIFY**: JwtAuthGuard skips authentication for routes decorated with @Public()
- All non-public routes require valid JWT token
- Expired tokens return 401 Unauthorized

### AE-AUTH-005: Auth Rate Limiting
- **VERIFY**: Login and register endpoints have tight rate limit (3 req/sec) via @Throttle
- Rate limiting prevents brute-force attacks on auth endpoints
- ThrottlerGuard applied globally; auth endpoints override with stricter limits
