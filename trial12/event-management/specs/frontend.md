# Frontend Specification

## Overview

The Event Management frontend is built with Next.js 15, React 19, and Tailwind CSS 4. It uses shadcn/ui-style components with the cn() utility from clsx + tailwind-merge.

See also: [API Endpoints](api-endpoints.md) for backend integration.

## UI Components

VERIFY: EM-UI-001
cn() utility function combines clsx and tailwind-merge for conditional class merging.

VERIFY: EM-UI-002
Button component with variant (default, destructive, outline, ghost) and size (default, sm, lg) props. Includes focus ring and disabled states.

VERIFY: EM-UI-003
Nav component in root layout with links to all routes. Uses proper aria-label for navigation landmark.

VERIFY: EM-UI-004
Root layout includes Nav component, metadata, and globals.css with dark mode support.

VERIFY: EM-UI-005
Dashboard page displays summary cards with event, venue, ticket, and attendee counts using Card and Badge components.

VERIFY: EM-UI-006
Login page with form using Input components and loginAction server action.

## Dark Mode

Dark mode is implemented via CSS media query `@media (prefers-color-scheme: dark)` in globals.css. Components use dark: variant classes for consistent theming.

## Component Library

8+ shadcn/ui-style components:
1. Button - with variants and sizes
2. Input - with label support
3. Card (+ CardHeader, CardTitle, CardContent, CardFooter)
4. Badge - with status variants
5. Table (+ TableHeader, TableBody, TableRow, TableHead, TableCell)
6. Skeleton - for loading states
7. Alert (+ AlertTitle, AlertDescription)
8. Select - with label and options

## Route Structure

- `/` - Home page with feature cards
- `/dashboard` - Overview dashboard
- `/events` - Event list
- `/venues` - Venue list
- `/schedules` - Schedule list
- `/tickets` - Ticket list
- `/attendees` - Attendee list
- `/login` - Login form
- `/register` - Registration form
- `/settings` - Application settings

## Loading States

Every route includes a loading.tsx with:
- `role="status"` on outer container
- `aria-busy="true"` for accessibility
- Skeleton components for content placeholders

## Error States

Every route includes an error.tsx with:
- `role="alert"` on outer container
- `useRef<HTMLDivElement>` with focus management
- `tabIndex={-1}` for programmatic focus
- Alert component displaying error message
- Retry button to reset the error boundary
