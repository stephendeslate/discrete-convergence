# Security Spec

## EM-SEC-001 — Authentication Guard
- **TRACED**: `apps/api/src/auth/jwt-auth.guard.ts`
- **VERIFY**: `test/security.spec.ts` — Protected endpoints require authentication (401)
- JwtAuthGuard checks @Public() decorator; blocks unauthenticated otherwise.

## EM-SEC-002 — Unauthenticated Request Handling
- **VERIFY**: `test/auth.integration.spec.ts` — Unauthenticated request returns 401
- **VERIFY**: `test/security.spec.ts` — Invalid token format returns 401

## EM-SEC-003 — Role Guard
- **VERIFY**: `test/event.integration.spec.ts` — Regular user cannot create events (403)
- **VERIFY**: `test/security.spec.ts` — Insufficient role returns 403
- RolesGuard checks @Roles() metadata.

## EM-SEC-004 — Ticket Role Guard
- **VERIFY**: `test/ticket.integration.spec.ts` — Regular user cannot create tickets

## EM-SEC-005 — Expired/Forged Token Rejection
- **VERIFY**: `test/security.spec.ts` — Expired/forged token returns 401

## EM-SEC-006 — Validation Pipeline Rejects Extra Fields
- **VERIFY**: `test/security.spec.ts` — Non-whitelisted fields return 400
- whitelist: true, forbidNonWhitelisted: true in ValidationPipe.

## Verification Tags
- VERIFY: EM-SEC-001
