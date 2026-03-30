# Frontend Specification

## VERIFY:EM-FE-001 — Next.js App Router
Web app uses Next.js 15 with App Router. Pages under app/ directory.

## VERIFY:EM-FE-002 — Server Actions
lib/actions.ts provides server actions that call the API with JWT from cookies.
getToken() helper retrieves session token.

## VERIFY:EM-FE-003 — Route Protection
middleware.ts redirects unauthenticated users to /login for protected routes.

## Pages

| Route | Description | Auth |
|-------|-------------|------|
| / | Redirects to /events | - |
| /login | Login form | Public |
| /register | Registration form | Public |
| /events | Event list with pagination | Protected |
| /events/[id] | Event detail with tickets/attendees | Protected |
| /events/new | Create event form | Protected (ADMIN/ORGANIZER) |
| /venues | Venue list | Protected |
| /attendees | Attendee list | Protected |
| /settings | User settings | Protected |

## Components

- Button, Card, Input, Table, Dialog from shadcn/ui pattern
- EventCard, EventForm for event-specific UI
- Navigation with role-based menu items

## Data Flow

1. Server actions call API with Authorization header
2. Token stored in httpOnly cookie
3. Middleware checks cookie presence for route protection
4. Server components fetch data via server actions
