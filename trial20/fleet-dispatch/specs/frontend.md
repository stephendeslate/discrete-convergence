# Frontend Specification

## Overview

Fleet Dispatch frontend is built with Next.js 15 App Router, React 19,
Tailwind CSS, and custom shadcn/ui-style components. Server actions handle
API communication with httpOnly cookie-based token storage.

Cross-references: [authentication.md](authentication.md), [api-endpoints.md](api-endpoints.md)

## Pages

### Dashboard (app/dashboard/page.tsx)
- Server component fetching dashboards data
- Displays cards with fleet metrics and status badges
- Loading skeleton via loading.tsx, error boundary via error.tsx

### Vehicles (app/dashboard/vehicles/page.tsx)
- Server component with table displaying vehicle inventory
- Columns: Name, License Plate, Make/Model, Status, Mileage
- Status shown with Badge component (success variant for AVAILABLE)

### Routes (app/dashboard/routes/page.tsx)
- Server component with table displaying route definitions
- Columns: Name, Origin, Destination, Distance, Status

### Dispatches (app/dashboard/dispatches/page.tsx)
- Server component with table displaying dispatch assignments
- Columns: Scheduled At, Vehicle, Route, Driver, Status
- Relations resolved via included data from API

### Drivers (app/dashboard/drivers/page.tsx)
- Server component with table displaying driver records
- Columns: Name, License Number, Phone, Status

### Login (app/login/page.tsx)
- Client component with email/password form
- Uses loginAction server action for authentication
- Redirects to /dashboard on success

### Register (app/register/page.tsx)
- Client component with email, password, role selector, tenant ID
- Uses registerAction server action
- Role restricted to VIEWER/DISPATCHER via Select component

### Settings (app/settings/page.tsx)
- Client component with logout functionality
- Uses logoutAction server action to clear cookies

### Data Sources (app/data-sources/page.tsx)
- Server component showing data source configuration (placeholder)

## Components (components/ui/)

8 shadcn/ui-style components:
1. Button — variant (default, destructive, outline, ghost) + size props
2. Card — bordered container with shadow
3. Input — styled text input with focus ring
4. Badge — colored inline labels with variants
5. Alert — notification banners with role="alert"
6. Skeleton — loading placeholder with animation
7. Select — styled dropdown with focus ring
8. Table — full table component set (Table, TableHeader, TableBody, TableRow, TableHead, TableCell)

## Server Actions (lib/actions.ts)

- loginAction: POST /auth/login, stores tokens in httpOnly cookies
- registerAction: POST /auth/register, stores access token
- logoutAction: deletes token cookies
- fetchVehicles, fetchRoutes, fetchDrivers, fetchDispatches: authenticated GET requests
- fetchDashboards, fetchDataSources: authenticated GET requests
- getAuthHeaders: reads access_token from cookies

Cross-references: [security.md](security.md), [authentication.md](authentication.md)

## VERIFY Tags

- VERIFY: FD-AUTH-001 — Login page renders with email and password fields
- VERIFY: FD-AUTH-002 — Registration page enforces allowed roles
- VERIFY: FD-AUTH-003 — Logout clears tokens from cookies
- VERIFY: FD-SEC-001 — Button component supports variant and size props
- VERIFY: FD-SEC-003 — Utility cn function merges Tailwind classes

## Accessibility

- html lang="en" set in root layout
- role="navigation" and aria-label on nav element
- role="main" on main content area
- role="alert" on Alert component
- aria-required on form inputs
- Label/input associations via htmlFor/id
- Focus visible ring styles on all interactive elements
- Dark mode via @media (prefers-color-scheme: dark) CSS variables
