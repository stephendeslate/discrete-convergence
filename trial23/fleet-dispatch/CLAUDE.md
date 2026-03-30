# Fleet Dispatch

Multi-tenant field service dispatch management platform.

## Architecture
- **Monorepo**: Turborepo + pnpm workspaces
- **API**: NestJS 11 + Prisma 6 + PostgreSQL 16 (with RLS)
- **Web**: Next.js 15 + React 19 + Tailwind CSS
- **Shared**: @repo/shared package with constants and utilities

## Tenant Isolation
- Tenant key: `companyId`
- RLS policies on all tables (except companies)
- `PrismaService.setTenantContext(companyId)` before queries

## Key Commands
```bash
pnpm install          # Install dependencies
pnpm turbo build      # Build all packages
pnpm turbo test       # Run all tests
pnpm turbo typecheck  # Type check all packages
```

## Environment Variables
See `.env.example` for required variables.

## Domain Model
- Companies → Users → Technicians/Customers
- Work Orders (9-state machine: UNASSIGNED→ASSIGNED→EN_ROUTE→ON_SITE→IN_PROGRESS→COMPLETED→INVOICED→PAID, CANCELLED from any)
- Routes → RouteStops → WorkOrders
- Invoices → LineItems
- Dashboards → Widgets
- DataSources, Notifications, AuditLogs
