// TRACED: EM-INFRA-002 — Docker Compose with PostgreSQL 16 healthcheck and named volume
// This file documents the Docker Compose infrastructure configuration.
// The actual docker-compose.yml is at the project root.

export const COMPOSE_CONFIG = {
  database: {
    image: 'postgres:16-alpine',
    healthcheck: 'pg_isready',
    volume: 'pgdata',
  },
  api: {
    port: 3001,
    dependsOn: 'postgres',
  },
} as const;
