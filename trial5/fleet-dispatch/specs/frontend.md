# FD-SPEC-004: Frontend

## Overview
The web frontend is a Next.js 15 app with App Router, server actions, and shadcn/ui components.

## Pages
| Route | Description |
|-------|-------------|
| / | Redirects to /fleet |
| /login | Login form |
| /register | Registration form |
| /fleet | Vehicle fleet overview |
| /drivers | Driver list with availability |
| /drivers/[id] | Driver detail |
| /deliveries | Delivery list with status filter |
| /deliveries/[id] | Delivery detail with tracking |
| /routes | Route list |
| /settings | Tenant settings (ADMIN) |

## Authentication
- JWT stored in cookies via server actions
- middleware.ts protects all routes except /login, /register
- getToken() helper reads cookie for API calls

## Server Actions (lib/actions.ts)
- getToken() / getSession() for auth state
- loginAction(), registerAction()
- fetchDrivers(), fetchVehicles(), fetchDeliveries(), fetchRoutes()
- createDriver(), createVehicle(), createDelivery(), createRoute()

## Components (shadcn/ui)
- Button, Card, Input, Table, Badge, Label, Select
- StatusBadge for delivery/vehicle status visualization
- DataTable for paginated lists

## Styling
- Tailwind CSS with shadcn/ui design system
- Responsive layout with sidebar navigation
