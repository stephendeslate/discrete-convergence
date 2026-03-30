// TRACED: EM-INFRA-003 — CI/CD pipeline with lint, test, build, typecheck, migration-check, audit
// This file documents the CI/CD infrastructure configuration.
// The actual workflow file is at .github/workflows/ci.yml.

export const CI_CONFIG = {
  steps: ['lint', 'test', 'build', 'typecheck', 'migration-check', 'audit'],
  database: {
    image: 'postgres:16',
    healthcheck: 'pg_isready',
  },
  runner: 'ubuntu-latest',
  nodeVersion: '20',
} as const;
