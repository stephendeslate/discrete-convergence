# FD-SPEC-002: Authentication

## Overview
Fleet Dispatch uses JWT-based authentication with bcrypt password hashing.
Passport.js handles token extraction and validation.

## Password Hashing
- Algorithm: bcrypt
- Salt rounds: 12 (configurable via shared constant)
- Passwords are never stored in plaintext

<!-- VERIFY:FD-AUTH-001 — bcrypt salt rounds = 12 -->

## Registration
- Self-registration supports DISPATCHER and DRIVER roles only
- ADMIN accounts must be created via seed or direct DB access
- Duplicate email+tenantId combinations are rejected with 409 Conflict

<!-- VERIFY:FD-AUTH-002 — ADMIN excluded from self-registration -->
<!-- VERIFY:FD-AUTH-003 — registration DTO validates role against allowed list -->

## JWT Token Structure
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "DISPATCHER",
  "tenantId": "tenant-uuid",
  "iat": 1234567890,
  "exp": 1234654290
}
```
- Expiration: 24 hours
- Extracted from Authorization: Bearer header

<!-- VERIFY:FD-AUTH-004 — JWT strategy extracts sub, email, role, tenantId -->
<!-- VERIFY:FD-AUTH-005 — auth service signs JWT with user payload -->

## Login Flow
1. Client sends POST /auth/login with {email, password}
2. Service looks up user by email (findFirst for multi-tenant)
3. bcrypt.compare validates password
4. JWT signed and returned as {accessToken}

<!-- VERIFY:FD-AUTH-006 — auth controller @Public() on login/register -->
