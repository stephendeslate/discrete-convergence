# Frontend Specification

## Overview

The event management frontend is a Next.js 15 application using the App Router pattern.
It provides a dashboard, event management, venue management, attendee management,
authentication pages, and settings. The UI uses shadcn/ui components with Tailwind CSS.

## Architecture

- **Framework:** Next.js 15 with App Router
- **UI Library:** shadcn/ui (8+ components)
- **Styling:** Tailwind CSS with CSS variables for theming
- **Dark Mode:** Implemented via `@media (prefers-color-scheme: dark)` in globals.css
- **Server Actions:** All data fetching uses server actions with `'use server'`

## Components

### shadcn/ui Components
- Button — primary action component with variants
- Card — content container with header, content, footer
- Input — form input field
- Label — form label
- Badge — status indicator
- Table — data display with header, body, rows, cells
- Skeleton — loading placeholder
- Alert — error/info messages
- Separator — visual divider

- VERIFY: EM-UI-001 — cn() utility using clsx + tailwind-merge
- VERIFY: EM-UI-002 — Root layout with Nav component and metadata
- VERIFY: EM-UI-003 — Button component with variant and size props

## Routes

| Path | Description | Auth Required |
|------|-------------|---------------|
| / | Home page | No |
| /login | Sign in form | No |
| /register | Registration form | No |
| /dashboard | Overview with counts | Yes |
| /events | Event list | Yes |
| /venues | Venue list | Yes |
| /attendees | Attendee list | Yes |
| /settings | Account settings | Yes |

## Loading and Error States

- Every route has `loading.tsx` with `role="status"` and `aria-busy="true"`
- Every route has `error.tsx` with `role="alert"`, `useRef`, and focus management
- Loading states use Skeleton components for placeholder content

## Server Actions

- VERIFY: EM-FI-001 — Server actions store auth token, send Authorization headers, use route constants

## Cross-References

- See [authentication.md](authentication.md) for auth flow integration
- See [api-endpoints.md](api-endpoints.md) for backend routes matched by frontend
- See [security.md](security.md) for CORS and CSP configuration
