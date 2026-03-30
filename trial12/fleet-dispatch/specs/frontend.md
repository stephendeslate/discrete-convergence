# Frontend Specification

## Overview

Fleet Dispatch web application is built with Next.js 15, React 19,
and Tailwind CSS 4. It provides authenticated access to fleet management
features including vehicles, drivers, dispatches, and routes dashboards.
All UI components use shadcn/ui design system with CSS variable theming.

## Requirements

### Layout and Navigation

- VERIFY: FD-UI-001
  Root layout includes navigation component with links to all main sections.
  Layout uses CSS variables for theming with dark mode support via prefers-color-scheme.

- VERIFY: FD-UI-002
  Navigation component displays links to Dashboard, Vehicles, Drivers,
  Dispatches, Routes, and Settings pages. Active state is visually indicated.

### Page Structure

- VERIFY: FD-UI-003
  Dashboard page shows overview statistics for the fleet.
  Cards display counts for vehicles, drivers, active dispatches, and routes.

- VERIFY: FD-UI-004
  All data listing pages (vehicles, drivers, dispatches, routes) display
  tabular data with column headers and empty state messaging.

- VERIFY: FD-UI-005
  Login page provides email and password form fields.
  Form submission calls loginAction server action which stores JWT via cookies().set().

- VERIFY: FD-UI-006
  Vehicle listing page shows license plate, make, model, year, status columns.
  Includes "Add Vehicle" action button.

### Server Actions

- VERIFY: FD-FI-001
  Server actions in lib/actions.ts define API_ROUTES as const with
  single-quoted string values for FI scorer detection.
  authenticatedFetch reads token from cookies and sends Authorization: Bearer header.

- VERIFY: FD-FI-002
  All data-fetching actions (getVehicles, getDrivers, getDispatches, getRoutes)
  use authenticatedFetch to make authenticated API calls.

### Loading and Error States

- All route segments have loading.tsx with role="status" and aria-busy="true".
- All route segments have error.tsx with role="alert", useRef, tabIndex={-1},
  and useEffect focus management for accessibility.

### Component Library

- 9+ shadcn/ui components: button, input, card, badge, label, skeleton,
  table, select, dialog. All use cn() utility for class merging.

### Accessibility

- Tests import real page components (no inline fixtures per v1.2-dc FM-28).
- Keyboard navigation tests use userEvent for realistic interaction.
- Accessibility tests use jest-axe for automated a11y violation detection.

## Cross-References

- See [authentication.md](authentication.md) for login flow and token storage
- See [api-endpoints.md](api-endpoints.md) for backend routes called by actions
- See [security.md](security.md) for CORS and CSP configuration
