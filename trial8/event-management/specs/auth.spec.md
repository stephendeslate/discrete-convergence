# Auth Spec

## EM-AUTH-001 — Bcrypt Salt Rounds
- **TRACED**: `packages/shared/src/index.ts` — BCRYPT_SALT_ROUNDS = 12
- **VERIFY**: `test/auth.integration.spec.ts` — Registration succeeds with valid data
- Uses shared constant for consistent hashing across services.

## EM-AUTH-002 — Allowed Registration Roles
- **TRACED**: `packages/shared/src/index.ts` — ALLOWED_REGISTRATION_ROLES = ['USER', 'ORGANIZER']
- **VERIFY**: `test/auth.integration.spec.ts` — ADMIN role rejected at registration
- Self-registration cannot escalate to ADMIN.

## EM-AUTH-003 — Login Server Action (Cookie Token Storage)
- **TRACED**: `apps/web/lib/actions.ts` — loginAction sets httpOnly cookie
- **VERIFY**: `test/auth.integration.spec.ts` — Login succeeds and returns JWT
- Token stored as httpOnly, secure, sameSite=lax cookie.

## EM-AUTH-004 — Register Server Action
- **TRACED**: `apps/web/lib/actions.ts` — registerAction calls /auth/register
- **VERIFY**: `test/auth.integration.spec.ts` — Registration rejects duplicate email

## EM-AUTH-005 — Protected Fetch Helper (Bearer Token)
- **TRACED**: `apps/web/lib/actions.ts` — protectedFetch reads token from cookie, sends Authorization header
- **VERIFY**: `test/auth.integration.spec.ts` — Authenticated request with valid token succeeds

## EM-AUTH-006 — Logout Action
- **TRACED**: `apps/web/lib/actions.ts` — logoutAction deletes token cookie
- **VERIFY**: `test/auth.integration.spec.ts` — Unauthenticated request returns 401

## Verification Tags
- VERIFY: EM-AUTH-001
- VERIFY: EM-AUTH-002
- VERIFY: EM-AUTH-003
- VERIFY: EM-AUTH-004
- VERIFY: EM-AUTH-005
- VERIFY: EM-AUTH-006
