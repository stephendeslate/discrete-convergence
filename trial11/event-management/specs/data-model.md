# Data Model Specification

## Overview

The event-management data model uses Prisma ORM with PostgreSQL. All models
include a tenantId field for multi-tenant isolation, enforced at both the
application layer and the database layer via Row Level Security (RLS).

## Models

### User
- Fields: id (UUID), email (unique), password, name, role (UserRole enum),
  tenantId, createdAt, updatedAt
- Enum UserRole: ADMIN, ORGANIZER, USER
- Index: tenantId, [tenantId, email]

### Event
- Fields: id, title, description, startDate, endDate, status (EventStatus),
  tenantId, createdAt, updatedAt
- Enum EventStatus: DRAFT, PUBLISHED, CANCELLED
- Index: tenantId, [tenantId, status]

### Venue
- Fields: id, name, address, capacity (Int), tenantId, createdAt, updatedAt
- Index: tenantId

### Ticket
- Fields: id, eventId (FK), attendeeId (FK nullable), price (Decimal),
  status (TicketStatus), tenantId, createdAt, updatedAt
- Enum TicketStatus: AVAILABLE, RESERVED, SOLD, CANCELLED
- Index: tenantId, [tenantId, eventId, status]

### Schedule
- Fields: id, eventId (FK), title, description, startTime, endTime,
  tenantId, createdAt, updatedAt
- Index: tenantId, [tenantId, eventId]

### Attendee
- Fields: id, userId (FK), eventId (FK), tenantId, createdAt, updatedAt
- Index: tenantId, [tenantId, eventId]

## Requirements

### DATA-001: Prisma Service

- VERIFY: EM-DATA-001 — PrismaService extends PrismaClient and implements
  OnModuleInit for connection lifecycle management.

### DATA-002: Raw SQL for Tenant Operations

- VERIFY: EM-DATA-002 — Event service uses $executeRaw with parameterized
  queries for tenant-scoped operations that require raw SQL (RLS context).

### SHARED-001: Shared Package Exports

- VERIFY: EM-SHARED-001 — The shared package exports APP_VERSION constant
  used across the application for version identification.

## Row Level Security

- All 6 tables have RLS ENABLE + FORCE policies.
- Policies use TEXT comparison on tenant_id (no ::uuid cast).
- RLS context is set via SET LOCAL at the start of each request.

## Seed Data

- VERIFY: EM-INFRA-001 — Seed script creates admin/organizer/user accounts,
  a venue, events in various statuses, tickets, schedules, and an attendee
  record using BCRYPT_SALT_ROUNDS from the shared package.

## Migration

- Single init migration creates all tables, indexes, enums, and RLS policies.
- All Prisma models use @@map for snake_case table names.
- All fields use @map for snake_case column names.
