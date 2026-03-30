# Performance Spec

## EM-PERF-001 — Pagination Constants
- **TRACED**: `packages/shared/src/index.ts` — MAX_PAGE_SIZE = 100, DEFAULT_PAGE_SIZE = 20
- Prevents unbounded queries.

## EM-PERF-002 — Pagination Clamping
- **TRACED**: `packages/shared/src/index.ts` — clampPagination()
- **VERIFY**: `test/event.integration.spec.ts` — List events returns paginated results
- Clamps page/pageSize to valid ranges; never rejects.

## Verification Tags
- VERIFY: EM-PERF-001
- VERIFY: EM-PERF-002
- VERIFY: EM-PERF-003
