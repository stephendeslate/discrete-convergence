// TRACED:AE-INFRA-001 — Multi-stage Dockerfile with deps/build/production stages, USER node, HEALTHCHECK, LABEL
// This module exports Docker-related constants referenced by the Dockerfile and health endpoint.

export const DOCKER_HEALTH_PATH = '/health';
export const DOCKER_PORT = 3001;
export const DOCKER_IMAGE_LABEL = 'analytics-engine';
