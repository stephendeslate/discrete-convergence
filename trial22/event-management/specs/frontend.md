# Frontend Specification

## Overview

Next.js 15 application with App Router, server actions for data fetching,
Tailwind CSS for styling, and custom UI components.

## Architecture

### App Router Structure
- `/` — Home page with navigation cards
- `/dashboard` — Dashboard with stats
- `/events` — Event listing
- `/venues` — Venue listing
- `/tickets` — Ticket listing
- `/attendees` — Attendee listing
- `/login` — Login form
- `/register` — Registration form
- `/settings` — Account settings
- `/data-sources` — Data source management

### Server Actions
All data fetching uses server actions in `lib/actions.ts`.
Actions use `cookies()` for token storage and pass `Authorization: Bearer`
headers in fetch requests to the API.

### Authentication Flow
1. Login form calls `login()` server action
2. Server action calls API `/auth/login`
3. On success, token stored via `cookies().set('token', ...)`
4. Protected actions call `cookies().get('token')` for auth
5. 401 responses redirect to `/login`

## UI Components (8+ in components/ui/)

1. Button — Primary, secondary, destructive, outline variants
2. Input — With label association
3. Card — Container with header, title, content sections
4. Badge — Status indicators with color variants
5. Table — Semantic table components
6. Select — Dropdown with label
7. Textarea — Multi-line input with label
8. Alert — Status/error messages with variants

## Accessibility

### Loading States
- `loading.tsx` in 4+ route directories
- Uses `role="status"` and `aria-busy="true"`
- Screen reader text via `sr-only` class

### Error States
- `error.tsx` in 4+ route directories
- Uses `role="alert"` for screen readers
- `useRef` + `focus()` for focus management
- `'use client'` directive (required by Next.js)

### HTML Semantics
- `<html lang="en">` in root layout
- `<title>` via Next.js metadata
- Heading hierarchy: h1 on every page
- All inputs have associated labels

## Styling

- Dark mode via `@media (prefers-color-scheme: dark)` in globals.css
- CSS custom properties for theming
- `cn()` utility using `clsx` + `tailwind-merge`

## Shared Package Integration

- `APP_VERSION` displayed in layout header
- `DEFAULT_PAGE_SIZE` used in pagination actions

## Related Specs

See [authentication.md](authentication.md) for auth flow details.
See [api-endpoints.md](api-endpoints.md) for API routes used by actions.
