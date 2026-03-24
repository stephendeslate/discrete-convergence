# Fleet Dispatch — Build Plan

## Overview

A multi-tenant field service dispatch platform for managing work orders, tracking technicians in real-time on a live map, optimizing routes, and invoicing customers. Dispatchers assign jobs, technicians stream GPS positions, customers see live ETA on a tracking portal. Uses open-source mapping exclusively (Leaflet + OpenStreetMap + OpenRouteService).

## Legal Caveats

- **DO NOT use Google Maps API** — ToS explicitly prohibits dispatch/fleet management use cases
- Use Leaflet + OpenStreetMap + OpenRouteService instead ($0 cost, no ToS issues)
- GPS tracking laws don't apply to synthetic data demos
- Use neutral terminology: "technician" / "field worker" (not "employee")
- Standard demo disclaimer sufficient

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11 + Prisma 6 + PostgreSQL 16 (RLS) + PostGIS 3.4 |
| Frontend | Next.js 15 App Router + shadcn/ui + Tailwind CSS 4 |
| Maps | Leaflet 1.9 + React Leaflet 5 + OpenStreetMap tiles |
| Routing | OpenRouteService Directions + Optimization (Vroom engine) |
| Real-time | Socket.io via @nestjs/websockets (GPS streaming) |
| Payments | Stripe Invoicing API |
| Drag-and-Drop | dnd-kit 6 |
| Queue | BullMQ 5 + Redis 7 |
| Testing | Vitest |
| Monorepo | Turborepo 2 + pnpm workspaces |

## Architecture

### Monorepo Structure

```
fleet-dispatch/
  apps/
    api/           # NestJS 11 backend (port 3001)
    web/           # Next.js 15 admin + technician + customer portal (port 3000)
  packages/
    shared/        # Shared types, Zod schemas, enums
  specs/           # Specification documents
```

### Multi-Tenant Data Isolation

```
Request → JWT auth middleware → extract companyId
  → Prisma middleware: SET LOCAL app.current_company_id
  → RLS policies enforce row-level isolation
  → Response scoped to company data only
```

### Dispatch Flow

```
Admin creates work orders → Assigns to technicians (manual drag or auto-optimize)
  → Technician receives notification
  → Technician starts route → GPS position streams to server via WebSocket
  → Dispatcher sees live positions on map
  → Customer sees "technician is X minutes away" on tracking portal
  → Technician arrives → Updates status → Completes work → Uploads photos
  → Invoice generated → Customer pays via Stripe
```

### Real-Time GPS Streaming

```
Technician browser → navigator.geolocation.watchPosition()
  → WebSocket emit to /gps namespace
  → Server stores position + broadcasts to:
    - Dispatch dashboard (company:{id} room)
    - Customer tracking portal (workorder:{id} room)
  → Leaflet map updates marker positions in real-time (<2s latency)
```

### Route Optimization

```
Dispatcher selects technician + unassigned work orders
  → Request to OpenRouteService Optimization API (Vroom engine)
  → Vroom solves vehicle routing problem (nearest-neighbor + 2-opt)
  → Returns optimized stop order with ETAs and distances
  → Route saved with ordered RouteStops
  → Technician sees optimized sequence on mobile
```

### Data Model

| Entity | Purpose |
|--------|---------|
| Company | Tenant with name, branding, service area polygon |
| User | Authenticated user with role (ADMIN, DISPATCHER, TECHNICIAN, CUSTOMER) |
| Technician | Field worker with skills[], GPS position, schedule. 1:1 with User |
| Customer | Service recipient with geocoded address, contact info, magic-link auth |
| WorkOrder | Central entity with 9-state machine, priority, scheduled time |
| WorkOrderStatusHistory | Immutable audit trail of every status transition |
| Route | Daily optimized route for a technician with total distance/duration |
| RouteStop | Work order's position in a route with ETA and leg distance |
| JobPhoto | Photo captured by technician on-site with metadata |
| Invoice | Generated from work order line items. States: DRAFT → SENT → PAID |
| LineItem | Labor, material, flat-rate, discount, or tax entry |
| Notification | SMS/email sent at lifecycle events (assignment, en-route, completion) |
| AuditLog | Immutable record of all state changes for compliance |

### Work Order Status Machine

```
UNASSIGNED → ASSIGNED → EN_ROUTE → ON_SITE → IN_PROGRESS → COMPLETED → INVOICED → PAID
                                                                         ↑
CANCELLED (from any state except PAID)                          invoice generated
```

### Invoice Status Machine

```
DRAFT → SENT → PAID
  ↓
VOID (only from DRAFT or SENT)
```

## Feature Inventory

### API Endpoints (apps/api)

- **Auth**: POST /auth/login, POST /auth/register, POST /auth/refresh, POST /auth/magic-link
- **Companies**: GET/PATCH /companies/me
- **Work Orders**: CRUD /work-orders, PATCH /work-orders/:id/status, POST /work-orders/:id/assign
- **Technicians**: CRUD /technicians, GET /technicians/available, GET /technicians/:id/schedule
- **Customers**: CRUD /customers, GET /customers/:id/work-orders
- **Routes**: POST /routes/optimize, GET /technicians/:id/route/:date, PATCH /routes/:id/reorder
- **GPS**: WebSocket /gps (position emit + subscribe)
- **Dispatch**: WebSocket /dispatch (assignment updates, status changes)
- **Tracking**: GET /track/:token (public customer portal — no auth, bypasses RLS)
- **Invoices**: POST /work-orders/:id/invoice, PATCH /invoices/:id/send, GET /invoices
- **Photos**: POST /work-orders/:id/photos, GET /work-orders/:id/photos
- **Notifications**: GET /notifications
- **Audit**: GET /audit-log

### Frontend Pages (apps/web)

- **Dispatch Dashboard**: Split-view map + Kanban board (drag-to-assign), live technician markers
- **Work Order Detail**: Status timeline, photos, notes, assignment, invoice
- **Technician Schedule**: Daily view with ordered route stops, navigation links
- **Technician Mobile**: Job list, status buttons, photo capture, arrival/completion flow
- **Customer Portal**: Live tracking map with ETA, status timeline (public, magic-link auth)
- **Route Optimizer**: Select technician + jobs → visualize before/after routes
- **Invoice Management**: List, create, send, payment status
- **Admin**: Company settings, user management, service area config

### Key Business Rules

- Work order status transitions validated against state machine — invalid transitions return 400
- Auto-assign algorithm: nearest available technician with matching skills
- GPS positions are high-volume (~1000/technician/day) — batch inserts, 90-day retention purge
- Tracking tokens: UUID with 24h expiry, bypass RLS via SECURITY DEFINER function
- GPS coordinates stored as Decimal(10,7), PostGIS uses ST_MakePoint(longitude, latitude) — longitude first
- Company-scoped sequences: WO-00042 (work orders), INV-00042 (invoices)
- Invoices immutable after SENT — only DRAFT invoices can be edited
- No cascading deletes on business data — work orders, invoices, audit logs are retained
- Route optimization: cache routes aggressively (OpenRouteService free tier: 2,000 req/day)
- Sync auto-pauses after 5 consecutive failures; requires explicit resume

## Key Dependencies

```json
{
  "leaflet": "^1.9.x",
  "react-leaflet": "^5.x",
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^10.x",
  "@nestjs/websockets": "^11.x",
  "@nestjs/platform-socket.io": "^11.x",
  "socket.io-client": "^4.x",
  "stripe": "^17.x",
  "@prisma/client": "^6.x",
  "date-fns": "^4.x",
  "zod": "^3.x"
}
```

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Google Maps ToS violation | Leaflet + OSM + OpenRouteService only (explicitly permitted for dispatch) |
| OpenRouteService rate limits | Cache routes, batch optimize daily, OSRM self-host as fallback |
| OpenRouteService downtime | Cache demo routes as static JSON fallback |
| WebSocket scaling | Demo handles < 50 connections; Railway supports WS natively |
| Cross-origin WebSocket | Explicit CORS config for Vercel → Railway Socket.io |
| PostGIS setup | Use Railway's PostGIS template (not default PostgreSQL) |
| Leaflet + Next.js SSR | Leaflet requires window/document — use next/dynamic with { ssr: false } |
| Mobile UX quality | Large touch targets, simple flows — responsive web, not native app |
| Route optimization accuracy | Vroom engine handles 20-job VRP in milliseconds |
| GPS data volume | Batch inserts, indexed by (companyId, technicianId, timestamp), 90-day purge cron |
| Tracking token security | Short-lived (24h), SECURITY DEFINER bypasses RLS only for tracking read |
