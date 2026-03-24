# Event Management — Build Plan

## Overview

A multi-tenant event management platform for organizations to create, schedule, and manage events with attendee registration, ticketing, and check-in. Features complex status workflows (event lifecycle + registration lifecycle), date/time handling across timezones, automated notifications (confirmations, reminders, updates), and a public event discovery page. Each organization (tenant) manages their own events, venues, and attendee data in isolation.

## Legal Caveats

- No real payment processing — ticket purchases are simulated (demo mode)
- Synthetic attendee data only — no PII concerns
- Standard demo disclaimer: "Demo application — no real transactions processed"
- No accessibility compliance claims (but build for it anyway — AX dimension)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11 + Prisma 6 + PostgreSQL 16 (RLS) |
| Frontend | Next.js 15 App Router + shadcn/ui + Tailwind CSS 4 |
| Calendar | date-fns 4 + date-fns-tz (timezone handling) |
| Email | Nodemailer + BullMQ (queued delivery) |
| QR Codes | qrcode (npm) for check-in tickets |
| Queue | BullMQ 5 + Redis 7 |
| Testing | Vitest |
| Monorepo | Turborepo 2 + pnpm workspaces |

## Architecture

### Monorepo Structure

```
event-management/
  apps/
    api/           # NestJS 11 backend (port 3001)
    web/           # Next.js 15 admin + public portal (port 3000)
  packages/
    shared/        # Shared types, Zod schemas, enums
  specs/           # Specification documents
```

### Multi-Tenant Data Isolation

```
Request → JWT auth middleware → extract organizationId
  → Prisma middleware: SET LOCAL app.current_organization_id
  → RLS policies enforce row-level isolation
  → Response scoped to organization data only
```

### Event Lifecycle

```
Organizer creates event (DRAFT)
  → Configures venue, sessions, ticket types, capacity
  → Publishes event (PUBLISHED) → visible on public discovery page
  → Registration opens → Attendees register + receive confirmation email
  → 24h before: automated reminder emails sent via BullMQ
  → Event day: check-in via QR code scan
  → Event starts (IN_PROGRESS)
  → Event ends (COMPLETED)
  → Post-event: attendee feedback collection
```

### Notification Pipeline

```
Event triggers notification rule (registration, reminder, update, cancellation)
  → BullMQ job created with template + recipient data
  → Worker renders email template with event/attendee context
  → Nodemailer sends (or logs in dev mode)
  → NotificationLog records delivery status
```

### Data Model

| Entity | Purpose |
|--------|---------|
| Organization | Tenant with name, branding, subscription tier |
| User | Authenticated user with role (ADMIN, ORGANIZER, ATTENDEE) |
| Event | Central entity with lifecycle status and scheduling |
| EventSession | Time slot within an event (for multi-track conferences) |
| Venue | Physical or virtual location with capacity and address |
| TicketType | Ticket tier (e.g., General, VIP, Early Bird) with price and quota |
| Registration | Attendee's registration for an event + ticket type |
| RegistrationField | Custom registration form fields per event |
| RegistrationFieldValue | Attendee's answers to custom fields |
| CheckIn | QR-scanned check-in record with timestamp |
| WaitlistEntry | Queue for sold-out ticket types with auto-promote |
| Notification | Queued email/SMS with template, status, and delivery log |
| NotificationTemplate | Reusable templates (confirmation, reminder, update, cancellation) |
| AuditLog | Immutable event log for all organization actions |

### Event Status Machine

```
DRAFT → PUBLISHED → REGISTRATION_OPEN → REGISTRATION_CLOSED → IN_PROGRESS → COMPLETED
                                                                              ↓
CANCELLED (from any state except COMPLETED)                               ARCHIVED
```

### Registration Status Machine

```
PENDING → CONFIRMED → CHECKED_IN
  ↓          ↓
CANCELLED  CANCELLED
  ↓
WAITLISTED → PROMOTED → CONFIRMED
```

## Feature Inventory

### API Endpoints (apps/api)

- **Auth**: POST /auth/login, POST /auth/register, POST /auth/refresh
- **Organizations**: GET/PATCH /organizations/me
- **Events**: CRUD /events, PATCH /events/:id/publish, PATCH /events/:id/cancel
- **Sessions**: CRUD /events/:id/sessions
- **Venues**: CRUD /venues
- **Ticket Types**: CRUD /events/:id/ticket-types
- **Registrations**: POST /events/:id/register, GET /events/:id/registrations, PATCH /registrations/:id/cancel
- **Check-in**: POST /check-in/:registrationId, GET /events/:id/check-in-stats
- **Waitlist**: GET /events/:id/waitlist, POST /waitlist/:id/promote
- **Notifications**: GET /notifications, POST /events/:id/notify (broadcast)
- **Public**: GET /public/events (discovery), GET /public/events/:slug (detail)
- **Audit**: GET /audit-log

### Frontend Pages (apps/web)

- **Admin**: Organization settings, user management
- **Organizer**: Event list, event builder (details + sessions + tickets + custom fields), attendee management, check-in dashboard (live counter), notification composer
- **Public**: Event discovery (filterable grid), event detail page, registration form
- **Attendee**: My registrations, ticket with QR code, event schedule view

### Key Business Rules

- Event capacity = sum of all ticket type quotas
- Registration closes automatically when capacity reached (or manual close)
- Waitlist auto-promotes when cancellation frees a slot (FIFO order)
- Reminder notifications sent 24h and 1h before event start (configurable)
- Check-in requires valid QR code with CONFIRMED registration status
- Each check-in is idempotent — scanning twice shows "already checked in"
- Event slug must be unique per organization (for public URLs)
- Ticket prices stored as integers (cents) — display as dollars in UI
- Custom registration fields support types: TEXT, EMAIL, PHONE, SELECT, CHECKBOX
- Events in COMPLETED status are immutable (no edits)
- All timestamps stored in UTC; displayed in event's configured timezone
- Organization tier limits: 5 events/month (Free), 50 (Pro), unlimited (Enterprise)
- Session times must fall within parent event's start/end window

## Key Dependencies

```json
{
  "@prisma/client": "^6.x",
  "@nestjs/bullmq": "^11.x",
  "bullmq": "^5.x",
  "date-fns": "^4.x",
  "date-fns-tz": "^3.x",
  "qrcode": "^1.x",
  "nodemailer": "^6.x",
  "zod": "^3.x",
  "slugify": "^1.x"
}
```

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Timezone complexity | Store everything UTC, convert only at display layer using date-fns-tz |
| Registration race conditions | Use database-level capacity check (SELECT ... FOR UPDATE) |
| Waitlist fairness | FIFO ordering via createdAt timestamp, promote oldest first |
| Email deliverability | Log all notifications; dev mode writes to console, not SMTP |
| QR code security | Registration ID + HMAC signature in QR payload, verify on scan |
| Session scheduling conflicts | Validate no overlap within same venue/track |
| Public page performance | Cache published event listings; invalidate on publish/unpublish |
| Custom field complexity | Limit to 10 custom fields per event, 5 field types only |
| Notification spam | Rate limit: max 1 broadcast per event per hour |
| Capacity overflow | Atomic decrement with CHECK constraint, not application-level count |
