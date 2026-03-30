# Infrastructure Specification

## Overview

Fleet Dispatch uses a multi-stage Docker build with health checks, CI/CD via GitHub Actions, and environment variable validation at startup.

## Application Bootstrap

The main.ts bootstrap function validates required environment variables (DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET) using validateEnvVars from shared. Missing or empty variables cause immediate process termination.

<!-- VERIFY: FD-INFRA-001 — Bootstrap validates required env vars before starting -->

## Server Configuration

Express x-powered-by is disabled first, before Helmet middleware. Helmet CSP sets frameAncestors to 'none'. CORS origin reads from CORS_ORIGIN env var with ?? fallback. ValidationPipe uses whitelist + forbidNonWhitelisted + transform. Graceful shutdown hooks are enabled. Port reads from PORT env var with ?? fallback to '3001'.

<!-- VERIFY: FD-INFRA-002 — Server disables x-powered-by, enables Helmet, CORS, ValidationPipe, shutdown hooks -->
