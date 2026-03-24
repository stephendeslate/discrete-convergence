# Data Model Specification

## VERIFY:EM-DATA-001 — Prisma Service
PrismaService extends PrismaClient with onModuleInit/onModuleDestroy lifecycle hooks.

## Schema Overview

### Tenant
- id (UUID, PK)
- name, subscriptionTier (FREE|PRO|ENTERPRISE), brandColor, logoUrl
- Has many: users, events, venues, auditLogs

### User
- id (UUID, PK), email (unique), passwordHash, name
- role (ADMIN|ORGANIZER|VIEWER)
- tenantId (FK) — multi-tenant scoping
- Has many: auditLogs

### Event
- id (UUID, PK), title, description, status (DRAFT|PUBLISHED|CANCELLED|COMPLETED)
- startDate, endDate
- tenantId (FK), venueId (FK, optional)
- Has many: tickets, attendees

### Venue
- id (UUID, PK), name, address, capacity
- tenantId (FK)
- Has many: events

### Ticket
- id (UUID, PK), type (GENERAL|VIP|EARLY_BIRD)
- price (Decimal 12,2), quantity, sold
- eventId (FK)
- Has many: attendees

### Attendee
- id (UUID, PK), name, email
- checkInStatus (REGISTERED|CHECKED_IN|NO_SHOW)
- eventId (FK), ticketId (FK)

### AuditLog
- id (UUID, PK), action, entity, entityId, details
- userId (FK), tenantId (FK)
- Read-only (no update/delete in application layer)

## Indexes

- tenantId on all tenant-scoped models
- email on User
- status on Event
- Composite: (tenantId, status) on Event
- Composite: (eventId, checkInStatus) on Attendee
- Composite: (tenantId, entity) on AuditLog
