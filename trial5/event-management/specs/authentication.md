# Authentication Specification

## VERIFY:EM-AUTH-001 — Bcrypt Salt Rounds
BCRYPT_SALT_ROUNDS is a shared constant (12) used consistently across auth service and seed.

## VERIFY:EM-AUTH-002 — Registration Role Restriction
ALLOWED_REGISTRATION_ROLES excludes ADMIN. Only ORGANIZER and VIEWER can self-register.

## VERIFY:EM-AUTH-003 — Public Decorator
@Public() decorator sets metadata to bypass JwtAuthGuard for login/register/health endpoints.

## VERIFY:EM-AUTH-004 — Auth Service
AuthService handles register and login. Uses bcrypt for hashing, JwtService for token generation.
Returns AuthResponse with accessToken and user profile.

## VERIFY:EM-AUTH-005 — Auth Controller
AuthController exposes POST /auth/register and POST /auth/login, both marked @Public().

## VERIFY:EM-AUTH-006 — JWT Strategy
JwtStrategy extracts Bearer token, validates expiration, maps payload to user object
with id, email, role, tenantId.

## VERIFY:EM-AUTH-007 — JWT Auth Guard
JwtAuthGuard registered as APP_GUARD. Respects @Public() metadata to skip auth.

## Token Format

JWT payload contains:
- sub: user ID
- email: user email
- role: user role (ADMIN | ORGANIZER | VIEWER)
- tenantId: tenant scope

Token expires in 15 minutes.

## Registration Flow

1. Validate role is in ALLOWED_REGISTRATION_ROLES
2. Check email uniqueness (globally unique)
3. Hash password with BCRYPT_SALT_ROUNDS
4. Create user record
5. Generate and return JWT

## Login Flow

1. Lookup user by email
2. Compare password with bcrypt
3. Generate and return JWT
