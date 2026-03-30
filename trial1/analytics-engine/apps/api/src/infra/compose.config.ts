// TRACED:AE-INFRA-003 — Docker Compose with PostgreSQL 16, pg_isready healthcheck, named volume, .env.example
// This module exports compose-related constants for environment documentation.

export const COMPOSE_POSTGRES_IMAGE = 'postgres:16-alpine';
export const COMPOSE_DB_NAME = 'analytics_engine';
export const COMPOSE_VOLUME_NAME = 'pgdata';
