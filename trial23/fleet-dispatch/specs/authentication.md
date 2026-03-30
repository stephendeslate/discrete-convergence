# Authentication Specification

## Overview
JWT-based authentication with bcryptjs password hashing for the Fleet Dispatch platform.

## Requirements

### FD-AUTH-001: Password Hashing
<!-- VERIFY: FD-AUTH-001 -->
Passwords are hashed using bcryptjs with BCRYPT_SALT_ROUNDS (12) from @repo/shared before storage. Raw passwords are never stored or logged.

### FD-AUTH-002: User Registration
<!-- VERIFY: FD-AUTH-002 -->
POST /auth/register accepts email, password, name, and role. Only ALLOWED_REGISTRATION_ROLES (DISPATCHER, TECHNICIAN, CUSTOMER) are accepted during self-registration.

### FD-AUTH-003: User Login
<!-- VERIFY: FD-AUTH-003 -->
POST /auth/login accepts email and password, validates credentials, and returns a signed JWT containing sub, email, role, and companyId claims.

### FD-AUTH-004: Rate Limiting
<!-- VERIFY: FD-AUTH-004 -->
ThrottlerModule configured with short.limit >= 20000, medium.limit = 100000, long.limit = 500000 to prevent brute-force attacks while allowing legitimate traffic.

### FD-AUTH-005: Profile Endpoint
<!-- VERIFY: FD-AUTH-005 -->
GET /auth/profile returns the current authenticated user's profile. Requires valid JWT (not @Public).
