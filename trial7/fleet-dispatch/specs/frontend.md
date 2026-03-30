# Frontend Specification

## Overview

Fleet Dispatch frontend is built with Next.js 15 App Router, React 19,
Tailwind CSS 4, and shadcn/ui components. The web app communicates with the
NestJS API via server actions. See [authentication.md](authentication.md)
for auth flow details.

## UI Components

- VERIFY: FD-UI-001 — cn() utility using clsx + tailwind-merge for class merging
- VERIFY: FD-UI-002 — Login server action validates credentials via API, redirects on success
- VERIFY: FD-UI-003 — Register server action creates user via API, redirects to login
- VERIFY: FD-UI-004 — getSession() helper for token-based session management
- VERIFY: FD-UI-005 — reportFrontendError sends sanitized error reports to POST /errors
- VERIFY: FD-UI-006 — Nav component in root layout with navigation links

## Layout and Routing

- VERIFY: FD-FE-001 — RootLayout includes Nav component and global styles
- VERIFY: FD-FE-002 — Login page with email/password form using server action
- VERIFY: FD-FE-003 — Register page with full registration form using server action

## Routes

All routes include loading.tsx and error.tsx:

| Route | Description |
|-------|-------------|
| / | Home page with CTA links |
| /dashboard | Dashboard with stats cards (next/dynamic loaded) |
| /vehicles | Vehicle list and management |
| /drivers | Driver list and management |
| /routes | Route list and management |
| /dispatches | Dispatch list and management |
| /login | Login form |
| /register | Registration form |
| /settings | Account settings |

## Loading States

All loading.tsx files include:
- `role="status"` on outer container
- `aria-busy="true"` attribute
- Spinner animation with sr-only text

## Error Boundaries

All error.tsx files include:
- `role="alert"` on outer container
- `useRef<HTMLDivElement>` for focus management
- `useEffect` to focus error container on mount
- `tabIndex={-1}` for programmatic focus
- Reset button to retry

## Accessibility

- VERIFY: FD-AX-001 — jest-axe tests for Button, Input, Label, Badge components
- VERIFY: FD-AX-002 — Keyboard navigation tests with userEvent tab/enter/space

## Dark Mode

- Implemented via `@media (prefers-color-scheme: dark)` in globals.css
- CSS custom properties for background and foreground colors
- No .dark class toggle

## Component Library (shadcn/ui)

8+ components in components/ui/:
1. Button — variants: default, outline, ghost, destructive
2. Input — text input with focus ring
3. Label — form label
4. Card — card container with header, content, footer
5. Badge — status badge with variants
6. Table — data table with header, body, row, cell
7. Skeleton — loading placeholder
8. Dialog — modal dialog with focus trap
9. Select — dropdown select

## Code Splitting

Dashboard content loaded via next/dynamic with Skeleton loading state.
