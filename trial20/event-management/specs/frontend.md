# Frontend Specification

## Overview

The Event Management frontend is a Next.js 15 application using the App Router,
React 19, Tailwind CSS, and shadcn/ui component patterns. It communicates with
the API via server actions that store JWT tokens in httpOnly cookies.

## Technology Stack

- Next.js 15 with App Router
- React 19
- Tailwind CSS with CSS custom properties for theming
- shadcn/ui component patterns (Button, Input, Card, Label, Badge, Table, Select, Skeleton)
- clsx + tailwind-merge for class name composition

VERIFY: EM-FE-001 — cn() utility uses clsx and tailwind-merge

## Server Actions

VERIFY: EM-FE-002 — loginAction stores JWT in httpOnly cookie
VERIFY: EM-FE-003 — registerAction calls API with email, password, role, tenantId
VERIFY: EM-FE-004 — authenticatedFetch reads token from cookies

Server actions handle all API communication:
- loginAction: POST /auth/login, stores accessToken in httpOnly cookie
- registerAction: POST /auth/register
- authenticatedFetch: generic helper that reads token from cookies
- fetchEvents, fetchVenues, fetchAttendees, fetchRegistrations: data fetchers
- logoutAction: deletes the token cookie

See: authentication.md for token lifecycle
See: security.md for httpOnly cookie rationale

## Layout and Navigation

VERIFY: EM-FE-005 — Root layout uses semantic HTML with lang attribute
VERIFY: EM-FE-006 — Navigation component uses aria-current for active state

The root layout provides:
- html lang="en" for accessibility
- Semantic structure with header, main, footer
- Navigation with active link highlighting via aria-current="page"
- Dark mode via @media (prefers-color-scheme: dark) CSS variables

## Route Structure

| Route | Type | Description |
|-------|------|-------------|
| / | Static | Landing page with feature cards |
| /login | Client | Login form with error handling |
| /register | Client | Registration form |
| /dashboard | Server | Dashboard with summary cards |
| /events | Server | Events table with badges |
| /venues | Server | Venues table |
| /attendees | Server | Attendees table |
| /registrations | Server | Registrations table with status badges |
| /settings | Client | Account settings and logout |
| /data-sources | Server | Data source management |

## Loading and Error States

Every route includes:
- loading.tsx with role="status" and aria-busy="true"
- error.tsx with role="alert", useRef, and focus management

See: edge-cases.md for error state patterns

## Accessibility

VERIFY: EM-FE-007 — Accessibility tests verify ARIA roles on components
VERIFY: EM-FE-008 — Keyboard tests verify focus management and interaction

All components follow WAI-ARIA patterns:
- Buttons are focusable and keyboard-operable
- Inputs associate with Labels via htmlFor
- Error messages use role="alert"
- Loading states use role="status" with aria-busy
- Navigation uses aria-label and aria-current

See: cross-layer.md for end-to-end accessibility
See: monitoring.md for client-side error tracking
