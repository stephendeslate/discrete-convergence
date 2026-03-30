# Frontend Specification

## Overview
Fleet Dispatch web application built with Next.js 15 App Router.
Server components for data fetching, client components for interactivity.

## Technology Stack
- Next.js 15 with App Router
- React 19
- Leaflet + OpenStreetMap for maps (NOT Google Maps)
- Dynamic imports with ssr:false for Leaflet components

## Pages

### Home (/)
- Landing page with login/register links
- Public access

### Login (/login)
- Email/password form — VERIFY: FD-FE-008
- Server action calls POST /auth/login
- Token stored in httpOnly cookie — VERIFY: FD-FE-001

### Register (/register)
- Registration form for new companies — VERIFY: FD-FE-009
- Server action calls POST /auth/register — VERIFY: FD-FE-002

### Dashboard (/dashboard)
- Split view: map + Kanban board
- Fetches work orders via server action — VERIFY: FD-FE-004
- Links to all management sections

### Work Order Detail (/work-orders/[id])
- Full work order information
- Status history timeline
- Photo gallery

### Technicians (/technicians)
- Technician list with skills and status — VERIFY: FD-FE-005
- Schedule view

### Customers (/customers)
- Customer list with address and contact info

### Routes (/routes)
- Route optimizer with date picker
- Map visualization of route stops

### Invoices (/invoices)
- Invoice list with status and totals
- Actions: send, pay, void

### Settings (/settings)
- Company profile management
- Admin-only access

### Customer Tracking Portal (/track/[token])
- Public tracking info fetched via server action — VERIFY: FD-FE-006
- Public page, no auth required — VERIFY: FD-FE-007
- Shows work order status and technician location
- Leaflet map with live GPS — VERIFY: FD-FE-010

## Accessibility
- html lang="en"
- Semantic headings (h1, h2)
- Form labels with htmlFor
- aria-label on sections and forms
- alt text on images
- role="alert" for error messages

## API Integration
- Server actions use apiFetch helper — VERIFY: FD-FE-003
- Token passed as Authorization: Bearer header
- Cookie-based token storage for SSR compatibility

## Map Components
- DispatchMap: wrapper with dynamic import
- LeafletMapInner: client-only Leaflet rendering — VERIFY: FD-FE-011
- Uses OpenStreetMap tiles exclusively

## Cross-References
- See [authentication.md](authentication.md) for login/register flow
- See [api-endpoints.md](api-endpoints.md) for API routes
- See [security.md](security.md) for frontend security
