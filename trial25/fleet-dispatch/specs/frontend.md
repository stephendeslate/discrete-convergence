# Frontend Specification

## Overview

The frontend is a Next.js 15 application with React 19, using the App Router pattern.
Styling is handled by Tailwind CSS. The application communicates with the NestJS API
via server actions and a client-side API utility.

## Technology Stack

- Next.js 15 with App Router
- React 19
- Tailwind CSS 3.4
- TypeScript 5.7
- clsx + tailwind-merge for className utility

## Pages

### Public Pages
- / — Home/landing page with login and register links
- /login — Authentication login form (client component)
- /register — User registration form (client component)

### Authenticated Pages
- /dashboard — Main dashboard overview
- /vehicles — Vehicle management with list and create form
- /drivers — Driver management with list and create form
- /routes — Route listing
- /dispatches — Dispatch management with list and create form
- /trips — Trip tracking
- /maintenance — Maintenance record listing
- /zones — Zone management
- /settings — User and tenant settings

## Components

### Navigation
- NavBar — Application navigation with links to all pages

### Data Display
- VehicleList — Displays vehicles in a table/list format
- DriverList — Displays drivers in a table/list format
- RouteList — Displays routes in a table/list format
- DispatchList — Displays dispatches with status badges

### Forms
- CreateVehicleForm — Form for adding new vehicles (name, plate, type, capacity)
- CreateDriverForm — Form for adding new drivers (name, email, phone, license)
- CreateDispatchForm — Form for creating dispatches (vehicle, driver, route, schedule)

### Utilities
- ErrorBoundary — Class component for catching render errors
- LoadingSkeleton — Animated placeholder for loading states

## Server Actions (lib/actions.ts)

All server actions use the 'use server' directive and communicate with the API backend.

- createVehicle(formData, token) — POST /vehicles
- updateVehicle(id, formData, token) — PUT /vehicles/:id
- deleteVehicle(id, token) — DELETE /vehicles/:id
- createDispatch(formData, token) — POST /dispatches
- assignDispatch(id, token) — PATCH /dispatches/:id/assign
- completeDispatch(id, token) — PATCH /dispatches/:id/complete
- loginAction(email, password) — POST /auth/login
- registerAction(email, password, tenantId) — POST /auth/register

## API Client (lib/api.ts)

Client-side API utility for fetching data from the backend.

- apiFetch<T>(path, options) — Generic fetch wrapper with auth support
- fetchVehicles(token, page) — GET /vehicles
- fetchDrivers(token, page) — GET /drivers
- fetchRoutes(token, page) — GET /routes
- fetchDispatches(token, page) — GET /dispatches
- fetchTrips(token, page) — GET /trips
- fetchMaintenance(token, page) — GET /maintenance
- fetchZones(token, page) — GET /zones

## Utilities (lib/utils.ts)

- cn(...inputs) — Merge class names using clsx + tailwind-merge
- formatDate(date) — Format date to locale string
- formatCurrency(amount) — Format number as USD currency
