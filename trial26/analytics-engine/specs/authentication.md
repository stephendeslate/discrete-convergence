# Authentication Specification

## Overview

The Analytics Engine uses JWT-based authentication with bcryptjs password hashing. All protected endpoints require a valid Bearer token in the Authorization header.

## Auth Flow

1. User registers with email, password, name, and tenant name
2. Password is hashed with bcryptjs (12 salt rounds)
3. JWT token is issued containing userId, email, tenantId, and role
4. Token is sent in Authorization header for all subsequent requests
5. JwtAuthGuard validates token on every protected request
6. TenantId is extracted from token payload for data scoping

## Endpoints

### POST /auth/register

Creates a new user and tenant (or joins existing tenant).

**Request Body:**
- email: string (valid email format, max 255 chars)
- password: string (min 8 chars, max 128 chars)
- name: string (min 1 char, max 255 chars)
- tenantName: string (min 1 char, max 255 chars)

**Response:** `{ access_token: string }`

**Error Cases:**
- 409 Conflict: Email already registered
- 400 Bad Request: Invalid input (missing fields, invalid email format)

### POST /auth/login

Authenticates user and returns JWT token.

**Request Body:**
- email: string (valid email)
- password: string

**Response:** `{ access_token: string }`

**Error Cases:**
- 401 Unauthorized: Invalid credentials (wrong email or password)
- 400 Bad Request: Missing required fields

## Security Requirements

- Passwords stored as bcryptjs hashes with 12 salt rounds
- JWT secret loaded from environment variable (never hardcoded)
- Token expiry: 24 hours
- Login endpoint rate-limited: 10 requests per second (See specs/security.md)
- No password in JWT payload or API responses

## Verification

<!-- VERIFY: AE-AUTH-001 — Registration with valid data creates user and returns token -->
<!-- VERIFY: AE-AUTH-002 — Registration with duplicate email returns 409 conflict -->
<!-- VERIFY: AE-AUTH-003 — Login with valid credentials returns token -->
<!-- VERIFY: AE-AUTH-004 — Login with invalid password returns 401 unauthorized -->
