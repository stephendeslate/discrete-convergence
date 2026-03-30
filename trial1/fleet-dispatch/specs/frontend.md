# Frontend Specification

> **Cross-references:** See [authentication.md](authentication.md), [api-endpoints.md](api-endpoints.md), [infrastructure.md](infrastructure.md), [security.md](security.md)

## Overview

Fleet Dispatch frontend is built with Next.js 15, React 19, Tailwind CSS,
and shadcn/ui-pattern components. It implements dark mode via CSS media queries,
accessible loading/error states, and keyboard navigation support.

## Utilities

### cn() Helper
- VERIFY:FD-FE-001 — Utility: cn() with clsx + tailwind-merge
- Combines clsx for conditional classes with tailwind-merge for deduplication
- Located at lib/utils.ts
- Used by all shadcn/ui components for className merging

## Components

### Button Component
- VERIFY:FD-FE-002 — Button component following shadcn/ui patterns with CVA
- Uses class-variance-authority (CVA) for variant management
- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: default, sm, lg, icon
- forwardRef for ref forwarding
- focus-visible:ring-2 for keyboard focus indication

### Additional Components
- Card (card.tsx): Card, CardHeader, CardTitle, CardContent
- Input (input.tsx): Styled input with focus ring
- Label (label.tsx): Styled label with peer-disabled support
- Select (select.tsx): Native select with consistent styling
- Table (table.tsx): Table, TableHeader, TableBody, TableRow, TableCell
- Badge (badge.tsx): Status badges with CVA variants
- Dialog (dialog.tsx): Modal with Escape key support, focus management

## Accessibility

### Testing Suite
- VERIFY:FD-FE-003 — Accessibility tests for ARIA attributes and semantic HTML
- Validates role="status" and aria-busy on all 6 loading components
- Validates role="alert" on all 6 error components
- Validates useRef + focus management on error headings
- Validates aria-required on form fields
- Validates htmlFor/id label-input association
- Validates semantic nav element and lang attribute
- Validates dialog role and aria-modal

### Keyboard Navigation
- VERIFY:FD-FE-004 — Keyboard navigation tests
- Error heading auto-focus on mount via useEffect + useRef
- tabIndex={-1} on error headings for programmatic focus
- Native button Enter/Space key support
- Tab navigation through form fields
- Escape key closes dialogs
- focus-visible:ring-2 on all interactive elements

## Layout

### Root Layout
- VERIFY:FD-FE-005 — Root layout with navigation and APP_VERSION
- Imports APP_VERSION from @fleet-dispatch/shared
- Nav component with links to: dispatch, work-orders, technicians, settings
- Version display in nav bar
- html lang="en" for accessibility
- Imports globals.css with Tailwind base/components/utilities

## Server Actions

### Form Submissions
- VERIFY:FD-FE-006 — Server actions for form submissions
- loginAction: POST /auth/login with email, password, companyId
- registerAction: POST /auth/register with full registration data
- createWorkOrderAction: POST /work-orders with Bearer token
- API_BASE from environment variable with localhost fallback
- Consistent ActionResult shape: { success, error?, data? }

## Dark Mode

Dark mode uses `@media (prefers-color-scheme: dark)` in globals.css.
CSS custom properties switch between light and dark values.
No `.dark` class toggling — respects system preference only.

## Route Structure

| Route | Page | Loading | Error |
|-------|------|---------|-------|
| /login | Login form | role="status" | role="alert" + focus |
| /register | Registration with role picker | role="status" | role="alert" + focus |
| /dispatch | Dynamic map (ssr:false) | role="status" | role="alert" + focus |
| /work-orders | Work order table | role="status" | role="alert" + focus |
| /technicians | Technician table with GPS | role="status" | role="alert" + focus |
| /settings | Settings cards | role="status" | role="alert" + focus |

Root page (/) redirects to /dispatch.

## Cross-References

- Shared constants: see cross-layer.md (FD-CL-003)
- API endpoints consumed: see api-layer.md (FD-API-*)
- Auth flow: see auth.md (FD-AUTH-003)
