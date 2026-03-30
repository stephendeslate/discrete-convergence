# Specification Index

## Overview
This document indexes all specifications for the Fleet Dispatch project.
Each specification covers a distinct concern of the application.

## Specifications

### 1. [Authentication](authentication.md)
- JWT-based authentication with bcrypt password hashing
- Login and registration endpoints
- Token structure and expiry
- Frontend cookie-based auth flow
- VERIFY tags: FD-AUTH-001 through FD-AUTH-015

### 2. [Data Model](data-model.md)
- PostgreSQL schema with Prisma ORM
- Entity definitions: User, Vehicle, Driver, Route, Trip, Maintenance
- Multi-tenancy via tenantId
- Row Level Security policies
- VERIFY tags: FD-VEH-007/008/010, FD-DRV-001/002/004, FD-RTE-001, FD-TRP-001, FD-MNT-001

### 3. [API Endpoints](api-endpoints.md)
- RESTful API with NestJS controllers
- CRUD operations for all domain entities
- Health and monitoring endpoints
- Input validation with class-validator
- VERIFY tags: FD-VEH-001 through FD-VEH-006/015, FD-DRV-008

### 4. [Frontend](frontend.md)
- Next.js 15 with React 19 and Tailwind CSS 4
- shadcn/ui component library (8+ components)
- Server actions for API communication
- Loading and error states for all routes
- VERIFY tags: FD-A11Y-001, FD-KBD-001

### 5. [Infrastructure](infrastructure.md)
- Docker multi-stage build with node:20-alpine
- Docker Compose with PostgreSQL 16
- GitHub Actions CI pipeline
- Environment variables and seed data

### 6. [Security](security.md)
- Helmet CSP, CORS, rate limiting
- Global guards: ThrottlerGuard, JwtAuthGuard, RolesGuard
- Input validation and tenant isolation
- Row Level Security policies
- VERIFY tags: FD-SEC-001 through FD-SEC-007, FD-VEH-009/011/013

### 7. [Monitoring](monitoring.md)
- Pino structured logging
- Correlation ID tracking
- Health endpoints and metrics
- Global exception filter
- VERIFY tags: FD-MON-001 through FD-MON-008, FD-PERF-001

### 8. [Cross-Layer](cross-layer.md)
- Global provider registration
- Full request pipeline
- Shared package integration
- Performance pagination
- VERIFY tags: FD-XL-001 through FD-XL-006, FD-PERF-002 through FD-PERF-005, FD-DRV-003/005/006/007

## VERIFY Tag Summary

| Domain | Tag Prefix | Count |
|--------|-----------|-------|
| Auth   | FD-AUTH   | 15    |
| Vehicle| FD-VEH   | 15    |
| Driver | FD-DRV   | 8     |
| Route  | FD-RTE   | 1     |
| Trip   | FD-TRP   | 1     |
| Maint  | FD-MNT   | 1     |
| Security| FD-SEC  | 7     |
| Monitor| FD-MON   | 8     |
| Perf   | FD-PERF  | 5     |
| Cross  | FD-XL    | 6     |
| A11Y   | FD-A11Y  | 1     |
| KBD    | FD-KBD   | 1     |
| **Total** |        | **69**|

## Bidirectional Parity
All VERIFY tags in specs have corresponding TRACED tags in .ts/.tsx source files.
All TRACED tags in source files have corresponding VERIFY tags in specs.
