# Frontend Specification

## Overview
The Event Management frontend is a Next.js 15 application with React 19.
Uses server actions for API communication and cookie-based auth.
See [authentication.md](authentication.md) for auth flow.

## Pages

### / — Home Page
- Public landing page
- Links to login, register, browse events

### /login — Login Page
- Login form with email and password
- Sets auth cookie via server action (cookies().set)
- Redirects to dashboard on success

### /register — Registration Page
- Registration form with name, email, password
- Sets auth cookie on success

### /dashboard — Admin Dashboard
- Displays event summary
- Links to event management

### /events — Event List and Builder
- Table of events with status, dates
- Create/edit event forms

### /attendees — Attendee Management
- View registered attendees per event

### /check-in — Check-in Dashboard
- QR code scanner interface
- Real-time check-in statistics

### /notifications — Notification Composer
- Form with subject and body
- Send to selected user groups

### /public-events — Public Event Discovery
- Browsable list of published events
- Links to registration form

### /register-event/[slug] — Registration Form
- Dynamic route for event registration
- Ticket type selection

### /my-registrations — My Registrations
- User's registration history
- Cancel functionality

### /settings — Admin Settings
- Organization name and tier management

## Authentication Integration
- Login: cookies().set('token', data.access_token)
- Protected actions: cookies().get('token'), Authorization: Bearer
- Route strings match API controllers exactly
- See [api-endpoints.md](api-endpoints.md) for endpoint routes

## Accessibility
- html lang="en" on root layout
- Page titles via metadata
- Semantic headings (h1, h2)
- Form labels with htmlFor
- aria-required on required inputs
- role="alert" on error messages
- aria-label on navigation

## Cross-References
- [authentication.md](authentication.md) — Auth flow
- [api-endpoints.md](api-endpoints.md) — Route matching
- [security.md](security.md) — Cookie security

## VERIFY Tags
VERIFY: EM-FE-001 — Server action: login sets auth cookie
VERIFY: EM-FE-002 — Server action: register
VERIFY: EM-FE-003 — Helper to make authenticated API requests
VERIFY: EM-FE-004 — Fetch events
VERIFY: EM-FE-005 — Root layout with html lang, title, semantic structure
VERIFY: EM-FE-006 — Login page
VERIFY: EM-FE-007 — Admin dashboard
VERIFY: EM-FE-008 — Event list and builder page
VERIFY: EM-FE-009 — Attendee management page
VERIFY: EM-FE-010 — Check-in dashboard
VERIFY: EM-FE-011 — Notification composer
VERIFY: EM-FE-012 — Public event discovery page
VERIFY: EM-FE-013 — Registration form page
VERIFY: EM-FE-014 — My registrations page
VERIFY: EM-FE-015 — Admin settings page
VERIFY: EM-FE-016 — Login form component
