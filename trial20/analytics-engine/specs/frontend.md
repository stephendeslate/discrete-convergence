# Frontend Specification

## Overview

The Analytics Engine frontend is built with Next.js 15 using the App Router pattern.
It uses React 19 with server components by default and client components where
interactive state is needed. The UI layer uses shadcn/ui-style components built
with class-variance-authority and Tailwind CSS v4.

See also: api-endpoints.md for the backend API contract consumed by server actions.
See also: security.md for token storage and CSRF protection details.

## Technology Stack

- Next.js 15 with App Router
- React 19 (server components default)
- Tailwind CSS v4 with @tailwindcss/postcss
- class-variance-authority for component variants
- clsx + tailwind-merge for className utilities
- Jest + Testing Library for unit tests
- jest-axe for accessibility testing

## Route Structure

VERIFY: AE-FE-002 — Root layout includes html lang="en" attribute for accessibility
VERIFY: AE-FE-003 — Home page provides navigation to all key features

- / — Home page with feature cards
- /login — Login form with email/password
- /register — Registration form (VIEWER role only)
- /dashboard — Dashboard list with create button
- /data-sources — Data source list with management
- /settings — Account settings with logout

Each route includes:
- page.tsx — Main page component
- loading.tsx — Loading skeleton with role="status" aria-busy="true"
- error.tsx — Error boundary with role="alert" and useRef focus management

VERIFY: AE-FE-012 — Login page uses form validation with error display
VERIFY: AE-FE-013 — Registration restricted to VIEWER role only
VERIFY: AE-FE-014 — Dashboard list page uses server-side data fetching
VERIFY: AE-FE-015 — Data sources page uses server-side data fetching
VERIFY: AE-FE-016 — Settings page provides logout functionality

## Server Actions

All API communication happens through Next.js server actions in lib/actions.ts.

VERIFY: AE-FE-004 — Login action stores token in httpOnly cookie
VERIFY: AE-FE-005 — Register action sends VIEWER role
VERIFY: AE-FE-006 — Logout action clears token cookie

- loginAction: POST /auth/login, stores accessToken in httpOnly cookie
- registerAction: POST /auth/register with role: 'VIEWER'
- logoutAction: Deletes token cookie
- getDashboards: GET /dashboards with Authorization Bearer header
- getDataSources: GET /data-sources with Authorization Bearer header
- getWidgets: GET /widgets?dashboardId with Authorization Bearer header
- createDashboard: POST /dashboards
- createDataSource: POST /data-sources

VERIFY: AE-FE-007 — Dashboard fetch includes Authorization Bearer header from cookie
VERIFY: AE-FE-008 — Data source fetch includes Authorization Bearer header from cookie
VERIFY: AE-FE-009 — Widget fetch includes dashboard scoping and Authorization header
VERIFY: AE-FE-010 — Create dashboard server action sends POST with auth
VERIFY: AE-FE-011 — Create data source server action sends POST with auth

## UI Components

8 reusable components in components/ui/:
- Button: Variants (default, destructive, outline, secondary, ghost, link)
- Card: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- Input: Text input with consistent styling and focus ring
- Label: Form label with peer-disabled styling
- Badge: Status indicators with variant support
- Skeleton: Loading placeholders with animation
- Dialog: Modal dialog with role="dialog" aria-modal
- DropdownMenu: Accessible dropdown with aria-expanded and role="menu"

VERIFY: AE-FE-001 — Utility function cn() merges Tailwind classes correctly

## Accessibility

VERIFY: AE-A11Y-001 — All UI components pass jest-axe accessibility audit
VERIFY: AE-A11Y-002 — Interactive elements support keyboard navigation

- All form inputs have associated labels
- Loading states use role="status" + aria-busy="true"
- Error states use role="alert" with focus management
- Buttons are keyboard accessible (Enter and Space)
- Dialog uses role="dialog" + aria-modal="true"
- Color contrast meets WCAG AA via CSS custom properties
- Dark mode via @media (prefers-color-scheme: dark)

## Styling

- CSS custom properties for theming in globals.css
- Dark mode support via prefers-color-scheme media query
- Consistent spacing using Tailwind utility classes
- Focus rings using focus-visible for keyboard-only focus
