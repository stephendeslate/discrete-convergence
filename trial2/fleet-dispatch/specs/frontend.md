# Frontend Specification

## Overview

Fleet Dispatch web application built with Next.js 15 App Router, shadcn/ui components,
and Tailwind CSS 4. Supports dark mode via @media (prefers-color-scheme: dark).
See [api-endpoints.md](api-endpoints.md) for backend API contract.

## Component Library

The application uses shadcn/ui with 8+ components in components/ui/:
- Button (with variants: default, destructive, outline, secondary, ghost, link)
- Card (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- Input
- Label
- Badge (with variants)
- Separator
- Skeleton
- Table (Table, TableHeader, TableBody, TableRow, TableHead, TableCell)
- Tabs (Tabs, TabsList, TabsTrigger, TabsContent)

### VERIFY:FD-UI-001 — cn() Utility
The cn() utility must use clsx + tailwind-merge for class name composition.
Located at lib/utils.ts.

### VERIFY:FD-UI-002 — Server Actions
Server actions in lib/actions.ts must use 'use server' directive.
All fetch calls must check response.ok before proceeding.
Login and register actions must redirect to /dashboard on success.

### VERIFY:FD-UI-003 — Navigation Component
Root layout must include a Nav component with links to all routes:
dashboard, work-orders, technicians, invoices, settings, login.
Must display APP_VERSION from shared package.

### VERIFY:FD-UI-004 — Dynamic Imports
Dashboard page must use next/dynamic for map component with ssr: false
and Skeleton loading state.

## Routes

Each route directory must contain:
- page.tsx — main page component
- loading.tsx — loading state with role="status" and aria-busy="true"
- error.tsx — error boundary with role="alert", useRef, useEffect focus, tabIndex={-1}

Routes:
1. /dashboard — Dispatch dashboard with map and work order list
2. /work-orders — Work order table with status badges
3. /technicians — Technician cards with skills and availability
4. /invoices — Invoice table with status
5. /login — Login form with email/password
6. /register — Registration form
7. /settings — Settings with tabs (Company, Users, Billing)

## Dark Mode

### VERIFY:FD-UI-005 — Dark Mode Implementation
Dark mode must be implemented via @media (prefers-color-scheme: dark) in globals.css.
Must NOT use .dark class-based approach. CSS custom properties change between
light and dark themes automatically.

## Accessibility

### VERIFY:FD-AX-001 — Accessibility Tests
jest-axe tests must render real components (Button, Input, Label, Card, Badge).
Must verify loading states have role="status" and error states have role="alert".

### VERIFY:FD-AX-002 — Keyboard Navigation Tests
userEvent tests must verify:
- Tab focus moves to interactive elements
- Enter activates buttons
- Space activates buttons
- Tab navigates between form fields
- Text input works via keyboard
