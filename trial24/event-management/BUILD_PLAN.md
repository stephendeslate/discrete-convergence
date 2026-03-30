# Event Management — Build Plan

## Domain Research

Multi-tenant event management platform. Organizations create events with venues, sessions, speakers, sponsors, tickets, and attendee registration.

### Entities
- **Organization**: Tenant container. All domain entities scoped by `organizationId`.
- **User**: Authenticated user. Roles: ADMIN, ORGANIZER, VIEWER.
- **Event**: Core entity. Lifecycle: DRAFT → PUBLISHED → CANCELLED / COMPLETED.
- **Venue**: Physical location for events. Has capacity, address.
- **Session**: Time slot within an event. Has speaker, room, status.
- **Speaker**: Person presenting at sessions.
- **Sponsor**: Organization sponsoring an event. Tiers: PLATINUM, GOLD, SILVER, BRONZE.
- **Ticket**: Ticket type for an event. Has price, quantity, status.
- **Attendee**: Person registered for an event via a ticket. Check-in status.

### Relationships
- Organization 1→N Users, Events, Venues, Speakers, Sponsors
- Event 1→N Sessions, Tickets, Attendees
- Event N→1 Venue (optional)
- Session N→1 Speaker (optional)
- Attendee N→1 Ticket

### Constraints
- Event can only be published if it has a venue
- Session can only be confirmed if event is published
- Attendee check-in only for published events
- Ticket quantity tracks remaining count
- Cancelled events cannot accept new registrations

## Data Model

### Prisma Models

| Model | Fields | Constraints |
|-------|--------|-------------|
| Organization | id, name, slug, plan, createdAt, updatedAt | @@map("organizations") |
| User | id, organizationId, email, passwordHash, name, role, createdAt, updatedAt | @@map("users"), @@index([organizationId]), unique email |
| Event | id, organizationId, venueId?, title, description, startDate, endDate, status, maxAttendees, publishedAt, createdAt, updatedAt | @@map("events"), @@index([organizationId]), @@index([organizationId, status]) |
| Venue | id, organizationId, name, address, city, capacity, createdAt, updatedAt | @@map("venues"), @@index([organizationId]) |
| Session | id, organizationId, eventId, speakerId?, title, description, room, startTime, endTime, status, createdAt, updatedAt | @@map("sessions"), @@index([organizationId]), @@index([eventId]) |
| Speaker | id, organizationId, name, email, bio, company, createdAt, updatedAt | @@map("speakers"), @@index([organizationId]) |
| Sponsor | id, organizationId, eventId, name, tier, amount, logoUrl, createdAt, updatedAt | @@map("sponsors"), @@index([organizationId]), @@index([eventId]) |
| Ticket | id, organizationId, eventId, name, price, quantity, sold, status, createdAt, updatedAt | @@map("tickets"), @@index([organizationId]), @@index([eventId]) |
| Attendee | id, organizationId, eventId, ticketId, name, email, checkedInAt, status, createdAt, updatedAt | @@map("attendees"), @@index([organizationId]), @@index([eventId]), @@index([ticketId]) |

### Enums
- Role: ADMIN, ORGANIZER, VIEWER (each @map)
- EventStatus: DRAFT, PUBLISHED, CANCELLED, COMPLETED (each @map)
- SessionStatus: PROPOSED, CONFIRMED, CANCELLED (each @map)
- SponsorTier: PLATINUM, GOLD, SILVER, BRONZE (each @map)
- TicketStatus: AVAILABLE, SOLD_OUT, CLOSED (each @map)
- AttendeeStatus: REGISTERED, CHECKED_IN, CANCELLED (each @map)

### RLS Plan
Tables: users, events, venues, sessions, speakers, sponsors, tickets, attendees
Each: ENABLE + FORCE + CREATE POLICY

## Endpoint Manifest

| Method | Path | Auth | Controller | Service Method |
|--------|------|------|------------|----------------|
| POST | /auth/register | Public | AuthController | register() |
| POST | /auth/login | Public | AuthController | login() |
| GET | /auth/profile | JWT | AuthController | getProfile() |
| GET | /events | JWT | EventController | findAll() |
| POST | /events | JWT | EventController | create() |
| GET | /events/:id | JWT | EventController | findOne() |
| PATCH | /events/:id | JWT | EventController | update() |
| DELETE | /events/:id | JWT | EventController | remove() |
| POST | /events/:id/publish | JWT | EventController | publish() |
| POST | /events/:id/cancel | JWT | EventController | cancel() |
| GET | /venues | JWT | VenueController | findAll() |
| POST | /venues | JWT | VenueController | create() |
| GET | /venues/:id | JWT | VenueController | findOne() |
| PATCH | /venues/:id | JWT | VenueController | update() |
| DELETE | /venues/:id | JWT | VenueController | remove() |
| GET | /sessions | JWT | SessionController | findAll() |
| POST | /sessions | JWT | SessionController | create() |
| GET | /sessions/:id | JWT | SessionController | findOne() |
| PATCH | /sessions/:id | JWT | SessionController | update() |
| POST | /sessions/:id/confirm | JWT | SessionController | confirm() |
| GET | /speakers | JWT | SpeakerController | findAll() |
| POST | /speakers | JWT | SpeakerController | create() |
| GET | /speakers/:id | JWT | SpeakerController | findOne() |
| PATCH | /speakers/:id | JWT | SpeakerController | update() |
| GET | /sponsors | JWT | SponsorController | findAll() |
| POST | /sponsors | JWT | SponsorController | create() |
| GET | /sponsors/:id | JWT | SponsorController | findOne() |
| GET | /tickets | JWT | TicketController | findAll() |
| POST | /tickets | JWT | TicketController | create() |
| PATCH | /tickets/:id | JWT | TicketController | update() |
| GET | /attendees | JWT | AttendeeController | findAll() |
| POST | /attendees/register | JWT | AttendeeController | registerAttendee() |
| POST | /attendees/:id/check-in | JWT | AttendeeController | checkIn() |
| GET | /dashboards | JWT | DashboardController | getData() |
| GET | /data-sources | JWT | DataSourceController | findAll() |
| GET | /metrics | JWT | MonitoringController | getMetrics() |
| GET | /health | Public | HealthController | check() |
| GET | /health/ready | Public | HealthController | ready() |

## Service Logic

### EventService
```
publish(id, orgId):
  - Find by id + orgId → NotFoundException
  - If status !== DRAFT → BadRequestException('Only draft events can be published')
  - If no venueId → BadRequestException('Event must have a venue before publishing')
  - Update status=PUBLISHED, publishedAt=now
  - Return updated

cancel(id, orgId):
  - Find by id + orgId → NotFoundException
  - If status === CANCELLED → BadRequestException('Event already cancelled')
  - If status === COMPLETED → BadRequestException('Cannot cancel completed event')
  - Update status=CANCELLED
  - Cancel all REGISTERED attendees
  - Return updated
```

### SessionService
```
confirm(id, orgId):
  - Find session by id + orgId with event → NotFoundException
  - If event.status !== PUBLISHED → BadRequestException('Event must be published')
  - If session.status !== PROPOSED → BadRequestException('Only proposed sessions can be confirmed')
  - Update status=CONFIRMED
  - Return updated
```

### AttendeeService
```
registerAttendee(dto, orgId):
  - Find event by eventId + orgId → NotFoundException
  - If event.status !== PUBLISHED → BadRequestException('Cannot register for unpublished event')
  - Find ticket by ticketId → NotFoundException
  - If ticket.sold >= ticket.quantity → BadRequestException('Ticket sold out')
  - Check no duplicate email for event → ConflictException
  - Create attendee, increment ticket.sold
  - Return attendee

checkIn(id, orgId):
  - Find attendee by id + orgId with event → NotFoundException
  - If event.status !== PUBLISHED → BadRequestException('Event not active')
  - If attendee.status === CHECKED_IN → BadRequestException('Already checked in')
  - If attendee.status === CANCELLED → BadRequestException('Registration was cancelled')
  - Update status=CHECKED_IN, checkedInAt=now
  - Return updated
```

## Edge Cases

| Endpoint | Error Case | Response | VERIFY Tag |
|----------|-----------|----------|------------|
| POST /auth/register | Duplicate email | 409 Conflict | EM-EDGE-001 |
| POST /auth/login | Wrong password | 401 Unauthorized | EM-EDGE-002 |
| POST /events/:id/publish | No venue | 400 BadRequest | EM-EDGE-003 |
| POST /events/:id/publish | Not draft | 400 BadRequest | EM-EDGE-004 |
| POST /events/:id/cancel | Already cancelled | 400 BadRequest | EM-EDGE-005 |
| POST /attendees/register | Ticket sold out | 400 BadRequest | EM-EDGE-006 |
| POST /attendees/register | Event not published | 400 BadRequest | EM-EDGE-007 |
| POST /attendees/:id/check-in | Already checked in | 400 BadRequest | EM-EDGE-008 |
| POST /sessions/:id/confirm | Event not published | 400 BadRequest | EM-EDGE-009 |
| GET /events/:id | Not found | 404 NotFound | EM-EDGE-010 |
| POST /attendees/register | Duplicate email for event | 409 Conflict | EM-EDGE-011 |
| GET /events | Empty result set | 200 [] | EM-EDGE-012 |

## Spec Outline

```
specs/authentication.md (5 tags):
  EM-AUTH-001 through EM-AUTH-005

specs/data-model.md (5 tags):
  EM-DATA-001 through EM-DATA-005

specs/api-endpoints.md (6 tags):
  EM-API-001 through EM-API-006

specs/frontend.md (4 tags):
  EM-FE-001 through EM-FE-004

specs/infrastructure.md (4 tags):
  EM-INFRA-001 through EM-INFRA-004

specs/security.md (5 tags):
  EM-SEC-001 through EM-SEC-005

specs/monitoring.md (4 tags):
  EM-MON-001 through EM-MON-004

specs/edge-cases.md (12 tags):
  EM-EDGE-001 through EM-EDGE-012

Total VERIFY tags: 45
```

## Frontend Routes & Actions

| Route | Page File | Server Actions | Forms |
|-------|-----------|---------------|-------|
| /login | app/login/page.tsx | loginAction | LoginForm |
| /register | app/register/page.tsx | registerAction | RegisterForm |
| /dashboard | app/dashboard/page.tsx | getEventStats | — |
| /events | app/events/page.tsx | getEvents, createEvent, publishEvent | CreateEventForm |
| /venues | app/venues/page.tsx | getVenues, createVenue | CreateVenueForm |
| /speakers | app/speakers/page.tsx | getSpeakers, createSpeaker | CreateSpeakerForm |
| /attendees | app/attendees/page.tsx | getAttendees, registerAttendee | — |
| /data-sources | app/data-sources/page.tsx | getDataSources | — |
| /settings | app/settings/page.tsx | updateProfile | SettingsForm |

### UI Ceiling Alignment
- C8: Domain routes: /events, /venues, /speakers, /attendees (4 ✓)
- C9: Write actions: createEvent (POST), createVenue (POST), publishEvent (POST), registerAttendee (POST) (4 ✓)
- C10: Forms: CreateEventForm, CreateVenueForm, CreateSpeakerForm (3 ✓)

## Plan Validation
- [x] Every model with >= 2 fields has service: Event, Venue, Session, Speaker, Sponsor, Ticket, Attendee (7/7)
- [x] >= 35 VERIFY tags: 45
- [x] >= 10 edge-case tags: 12
- [x] >= 3 domain routes, 3 write actions, 2 forms
- [x] RLS complete
