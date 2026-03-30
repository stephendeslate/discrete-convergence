# Infrastructure Specification

## Overview
Containerized deployment with Docker multi-stage builds, graceful shutdown, and environment-based configuration.

## Requirements

### FD-INFRA-001: Graceful Shutdown
<!-- VERIFY: FD-INFRA-001 -->
Application calls enableShutdownHooks() to handle SIGTERM/SIGINT gracefully, closing database connections and completing in-flight requests.

### FD-INFRA-002: Environment Configuration
<!-- VERIFY: FD-INFRA-002 -->
Required environment variables (DATABASE_URL, JWT_SECRET) are validated at startup via validateEnvVars. Missing variables cause immediate failure with clear error messages.

### FD-INFRA-003: Port Configuration
<!-- VERIFY: FD-INFRA-003 -->
Server port is configurable via PORT environment variable with a fallback to 4000.

### FD-INFRA-004: Startup Health Log
<!-- VERIFY: FD-INFRA-004 -->
Application logs a startup message including the port number after successfully binding.
