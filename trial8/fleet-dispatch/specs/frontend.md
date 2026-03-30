# Frontend Specification

## Overview
Next.js 15 with React 19, Tailwind CSS 4, and shadcn/ui component library.
Server actions handle API communication with httpOnly cookie-based auth.

## Technology
- Next.js 15 App Router
- React 19
- Tailwind CSS 4
- 8+ shadcn/ui components: Button, Input, Card, Label, Badge, Table, Select, Alert

## Pages
- /login - Login form (public)
- /register - Registration form (public)
- /dashboard - Dashboard with stats (protected)
- /vehicles - Vehicle list (protected)
- /drivers - Driver list (protected)
- /routes - Route list (protected)
- /trips - Trip list (protected)
- /maintenance - Maintenance records (protected)
- /settings - Account settings (protected)

## Loading & Error States
- Every route has loading.tsx with role="status" and aria-busy="true"
- Every route has error.tsx with role="alert", useRef, useEffect focus, tabIndex={-1}
- Error boundary reports to POST /errors endpoint

## Authentication Flow
- Login server action calls POST /auth/login
- On success: cookies().set('token', data.access_token, { httpOnly: true, secure: true, path: '/' })
- Protected actions read token via cookies().get('token')
- Missing token redirects to /login
- Authorization: Bearer header sent on all protected requests

## Route String Matching
- Vehicles: fetches from /vehicles (matches @Controller('vehicles'))
- Drivers: fetches from /drivers (matches @Controller('drivers'))
- Routes: fetches from /routes (matches @Controller('routes'))
- Trips: fetches from /trips (matches @Controller('trips'))
- Maintenance: fetches from /maintenance (matches @Controller('maintenance'))

## Components
- cn() utility using clsx + tailwind-merge
- Nav component in root layout.tsx
- Dynamic import for DashboardStats (code splitting)

## Dark Mode
- Uses @media (prefers-color-scheme: dark) in globals.css
- NOT .dark class-based

## Accessibility
- VERIFY: FD-A11Y-001 - jest-axe tests on real components
- VERIFY: FD-KBD-001 - Keyboard navigation tests with userEvent

## Cross-References
- See [api-endpoints.md](api-endpoints.md) for API route details
- See [authentication.md](authentication.md) for auth flow
