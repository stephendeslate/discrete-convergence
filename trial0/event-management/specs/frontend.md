# Frontend Specification

## Overview
Next.js 15 with App Router, React 19, Tailwind CSS 4, shadcn/ui components.
Server-side rendering with server actions for form submissions.

## Utility Layer
- VERIFY:EM-FE-002 — cn() utility using clsx + tailwind-merge for class merging
- VERIFY:EM-FE-003 — Server actions with response.ok validation and redirect
- VERIFY:EM-SHARED-001 — Barrel export from packages/shared with 8+ named exports

## Styling
- VERIFY:EM-FE-004 — CSS custom properties with @media (prefers-color-scheme: dark)
- Dark mode uses @media query, NOT .dark class toggle
- CSS variables: --background, --foreground, --card, --primary, --muted-foreground, etc.

## Layout & Navigation
- VERIFY:EM-FE-005 — Root layout with Nav component, semantic HTML
- Nav links: Events, Venues, Discover, Sign In

## Loading States
- VERIFY:EM-FE-006 — All loading.tsx files use role="status" + aria-busy="true"
- Skeleton components for progressive loading
- Every route has a dedicated loading.tsx

## Error States
- VERIFY:EM-FE-007 — All error.tsx files use role="alert" + useRef + useEffect focus
- tabIndex={-1} for programmatic focus management
- Reset button to retry failed operations

## Components (11 shadcn/ui)
- VERIFY:EM-FE-008 — 11+ shadcn/ui components: button, card, input, label, badge,
  skeleton, table, switch, dialog, nav, event-card
- All components use cn() for class merging
- Cross-reference: [security.md](./security.md) — No dangerouslySetInnerHTML

## Routes (7+)
- / — Home page with APP_VERSION display
- /login — Login form with server action
- /register — Registration with role selection
- /events — Event management dashboard with table
- /venues — Venue directory with CRUD
- /discover — Public event discovery grid
- /notifications — Notification history
- /settings — Organization settings with Switch toggle

## Accessibility
- VERIFY:EM-TEST-010 — jest-axe tests on all major components
- VERIFY:EM-TEST-011 — Keyboard navigation tests: Tab, Shift+Tab, Enter, Space
- Cross-reference: [api-endpoints.md](./api-endpoints.md) — API data fetching patterns
- Semantic HTML (nav, main, form, label+input associations)
- ARIA attributes on interactive elements

## Server Actions
- Login form submits via server action that POSTs to /auth/login and stores JWT
- Registration form validates role selection against allowed roles before submission
- Event creation and venue CRUD use server actions with response.ok validation
- On success, server actions call redirect() to navigate to the appropriate page
- On failure, error state is returned and displayed inline via the error.tsx boundary

## Data Fetching
- Server components fetch data directly from the API during SSR
- API base URL configured via environment variable (NEXT_PUBLIC_API_URL)
- Fetch calls include credentials and appropriate headers for authenticated routes
- Cross-reference: [api-endpoints.md](./api-endpoints.md) — Endpoint contracts consumed by frontend
- Cross-reference: [monitoring.md](./monitoring.md) — Frontend health display fetches /monitoring/health

## Convention Compliance
- VERIFY:EM-FE-009 — Zero dangerouslySetInnerHTML usage across all frontend components
- All conditional rendering uses nullish coalescing (??) instead of || for default values
- No inline styles; all styling via Tailwind CSS utility classes and CSS custom properties
