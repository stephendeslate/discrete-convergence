# Test Spec

## EM-TEST-001 — Test Setup Utilities
- **TRACED**: `apps/api/test/helpers/test-setup.ts`
- Shared app creation, user registration, token acquisition, cleanup.

## EM-TEST-002 — Auth Integration Tests
- **TRACED**: `apps/api/test/auth.integration.spec.ts`
- 10 tests covering register, login, validation, auth failure scenarios.

## EM-TEST-003 — Event Integration Tests
- **TRACED**: `apps/api/test/event.integration.spec.ts`
- 9 tests covering CRUD, roles, pagination, validation.

## EM-TEST-004 — Ticket Integration Tests
- **TRACED**: `apps/api/test/ticket.integration.spec.ts`
- 8 tests covering CRUD, roles, validation, 404.

## EM-TEST-005 — Security Tests
- **TRACED**: `apps/api/test/security.spec.ts`
- 9 tests covering auth guard, role guard, validation pipeline, correlation ID.

## EM-TEST-006 — Cross-Layer Integration Tests
- **TRACED**: `apps/api/test/cross-layer.integration.spec.ts`
- 4 tests covering multi-entity flows and duplicate detection.

## Verification Tags
- VERIFY: EM-TEST-001
- VERIFY: EM-TEST-002
- VERIFY: EM-TEST-003
- VERIFY: EM-TEST-004
- VERIFY: EM-TEST-005
- VERIFY: EM-TEST-006
- VERIFY: EM-TEST-010
- VERIFY: EM-TEST-011
- VERIFY: EM-TEST-012
- VERIFY: EM-TEST-013
