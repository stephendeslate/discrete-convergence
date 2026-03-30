# Infrastructure Spec

## EM-INFRA-001 — Environment Variable Validator
- **TRACED**: `packages/shared/src/index.ts` — validateEnvVars()
- Throws if required env vars are missing at boot.
- Called in main.ts with DATABASE_URL, JWT_SECRET, CORS_ORIGIN.

## Verification Tags
- VERIFY: EM-INFRA-001
