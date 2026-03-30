# Frontend Specification

> **Project:** Event Management
> **Domain:** FE
> **VERIFY Tags:** EM-FE-001 – EM-FE-004

---

## Overview

Next.js 15 App Router frontend with React 19 Server Components and Server
Actions. Authentication tokens are stored in httpOnly cookies for security.
All data mutations go through server actions that include Authorization headers.
Loading and error states follow accessibility best practices.

---

## Requirements

### EM-FE-001: Token in httpOnly Cookie

<!-- VERIFY: EM-FE-001 -->

- After successful login, the access_token is stored in an httpOnly cookie.
- Cookie is set with `secure: true` in production and `sameSite: 'lax'`.
- Refresh token is also stored in a separate httpOnly cookie.
- Cookies are cleared on logout.
- No tokens stored in localStorage or sessionStorage.

### EM-FE-002: Server Actions with Authorization Header

<!-- VERIFY: EM-FE-002 -->

- All authenticated server actions read the access_token from cookies.
- Authorization header is set as `Bearer ${token}` on API requests.
- Server actions are defined in `lib/actions.ts` with `'use server'` directive.
- Actions cover: events, venues, registrations, dashboards, data sources.

### EM-FE-003: Loading States with Accessibility

<!-- VERIFY: EM-FE-003 -->

- Every route has a `loading.tsx` file for Suspense boundaries.
- Loading components use `role="status"` and `aria-busy="true"`.
- Skeleton components provide visual loading indicators.
- At least 6 route directories have loading.tsx files.

### EM-FE-004: Error States with Focus Management

<!-- VERIFY: EM-FE-004 -->

- Every route has an `error.tsx` file for error boundaries.
- Error components use `role="alert"` for screen reader announcement.
- Focus is programmatically moved to the error heading via `useRef` + `useEffect`.
- Error headings have `tabIndex={-1}` for programmatic focus.
- Each error component includes a "Try again" button that calls `reset()`.

---

## Pages

| Route             | Purpose                                    |
|-------------------|--------------------------------------------|
| /                 | Home page with overview cards              |
| /login            | Login form with email/password             |
| /register         | Registration form with role selection      |
| /events           | Event list with status badges              |
| /venues           | Venue list with capacity display           |
| /registrations    | Registration management                    |
| /dashboard        | Analytics dashboard with metrics cards     |
| /data-sources     | Data source connection management          |
| /settings         | Organization settings                      |

---

## Components

- **UI Components**: Button, Card, Input, Label, Badge, Skeleton, Table, Alert
- **Domain Components**: EventList, VenueList, Nav
- **Dynamic Loading**: `next/dynamic` with Skeleton fallbacks
- **Accessibility**: All interactive elements are keyboard navigable
