// TRACED: EM-INFRA-001 — Dockerfile multi-stage build with node:20-alpine, USER node, HEALTHCHECK
// This file documents the Docker infrastructure configuration.
// The actual Dockerfile is at the project root.

export const DOCKER_CONFIG = {
  baseImage: 'node:20-alpine',
  stages: ['deps', 'build', 'production'],
  user: 'node',
  healthcheck: 'wget -q --spider http://localhost:3001/health',
  exposedPort: 3001,
} as const;
