# Frontend Specification

## Overview

The Fleet Dispatch web application is built with Next.js 15 and uses shadcn/ui
components. It provides pages for managing vehicles, drivers, dispatches, and
routes, plus authentication pages (login, register) and system pages (dashboard,
settings). All pages include loading states and error boundaries.

## UI Component Library

<!-- VERIFY: FD-UI-001 -->
The `cn()` utility function in `lib/utils.ts` combines `clsx` and `tailwind-merge`
to provide conditional class name composition with Tailwind CSS conflict resolution.
This utility is used by all shadcn/ui components (Button, Card, Input, Label,
Table, Badge, Separator, Skeleton, Dialog) for consistent styling.

## Page Structure

<!-- VERIFY: FD-UI-002 -->
The application provides dedicated pages for each domain entity:
- `/vehicles` — Vehicle list with status badges
- `/drivers` — Driver list with license info
- `/dispatches` — Dispatch list with related entity details
- `/routes` — Route list with distance and duration
- `/dashboard` — Overview with summary cards
- `/login` — Authentication form
- `/register` — Registration form with role selection
- `/settings` — Application settings

Each page directory contains a `page.tsx`, `loading.tsx` (with `role="status"`
and `aria-busy="true"`), and `error.tsx` (with `role="alert"`, `useRef`,
`useEffect` for focus management, and `tabIndex={-1}`).

## Navigation

<!-- VERIFY: FD-UI-003 -->
The `Nav` component renders a navigation bar with links to all major sections.
It is included in the root `layout.tsx` and provides consistent navigation
across the application. Links use Next.js `Link` component for client-side
routing.

## Frontend Integration — Token Storage

<!-- VERIFY: FD-FI-001 -->
The `lib/routes.ts` module exports `API_ROUTES` with route constants using
single-quoted string values. These constants centralize all API endpoint URLs
used by the server actions, preventing typos and enabling easy refactoring.

## Frontend Integration — Auth Headers

<!-- VERIFY: FD-FI-002 -->
The `authenticatedFetch()` function in `lib/actions.ts` reads the JWT token
from cookies and attaches it as a `Bearer` token in the `Authorization` header.
All domain-specific server actions (vehicles, drivers, dispatches, routes) use
this function to make authenticated API calls.

## Frontend Integration — Token Storage After Login

<!-- VERIFY: FD-FI-003 -->
The `loginAction()` server action calls the API login endpoint and stores the
returned JWT token in an HTTP-only cookie using `cookies().set()`. The token
is then available for subsequent authenticated requests via `authenticatedFetch()`.
Similarly, `registerAction()` stores the token after successful registration.

## Accessibility — Axe Testing

<!-- VERIFY: FD-AX-001 -->
The `accessibility.spec.tsx` test file imports real page components (not inline
fixtures) and runs `jest-axe` against rendered output. Tests verify zero
accessibility violations for all major pages including dashboard, vehicles,
drivers, dispatches, and routes.

## Accessibility — Keyboard Navigation

<!-- VERIFY: FD-AX-002 -->
The `keyboard.spec.tsx` test file verifies keyboard navigation works correctly
across the application. Tests use `@testing-library/user-event` to simulate
Tab and Enter key presses, verifying that interactive elements receive focus
in the correct order and that buttons/links are activatable via keyboard.

## Cross-References

- Server actions call API endpoints defined in [api-endpoints.md](api-endpoints.md)
- Authentication flow for token acquisition: see [authentication.md](authentication.md)
- Loading/error state patterns follow monitoring principles: see [monitoring.md](monitoring.md)
- Component styling uses CSS variables compatible with dark mode: see globals.css

## Dark Mode Support

The application supports dark mode via `@media (prefers-color-scheme: dark)` in
`globals.css`. CSS custom properties (variables) switch between light and dark
color palettes automatically. All shadcn/ui components reference these variables
(e.g., `var(--background)`, `var(--foreground)`) rather than hardcoded colors.

## Testing Strategy

Frontend tests are split into two categories:
1. **Accessibility tests**: Use jest-axe to verify WCAG compliance
2. **Keyboard tests**: Use userEvent to verify keyboard navigability

Both test files import real page components from the app source directory,
avoiding inline fixture components that could mask real accessibility issues.
Test configuration includes type augmentations for `@types/jest-axe` and
`@testing-library/jest-dom` in `tsconfig.json`.
