# Frontend Specification

## Overview

FleetDispatch frontend is a Next.js 15 App Router application with 11 shadcn/ui-style
components, dark mode support, and full accessibility compliance.

## Components (11 total)

- VERIFY:FD-FE-002 — cn() utility using clsx + tailwind-merge
- Button: 4 variants (default, destructive, outline, ghost), 3 sizes, forwardRef
- Card: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- Input: Styled input with focus ring, disabled state
- Label: Styled label with peer-disabled support
- Badge: 6 variants (default, secondary, destructive, outline, success, warning)
- Skeleton: Animated placeholder with pulse animation
- Table: Table, TableHeader, TableBody, TableRow, TableHead, TableCell
- Switch: Toggle with role="switch", aria-checked, keyboard support
- Dialog: Modal with Escape to close, click-outside to dismiss, aria-modal
- Nav: Main navigation with active state highlighting
- StatusBadge: Maps work order/invoice/technician statuses to badge variants

## Pages

- VERIFY:FD-FE-005 — 9 route pages: home, login, register, dispatch, work-orders, technicians, customers, routes, invoices, settings, track
- Each page has loading.tsx and error.tsx states (where applicable)
- Login/register use server actions via useActionState

## Dark Mode

- VERIFY:FD-FE-004 — Dark mode via @media (prefers-color-scheme: dark), NOT .dark class
- CSS custom properties define all colors
- All components use var(--*) for theming

## Loading States

- VERIFY:FD-FE-006 — Loading states use role="status" + aria-busy="true"
- Skeleton components for content placeholders
- sr-only text for screen readers

## Error States

- VERIFY:FD-FE-007 — Error states use role="alert" + useRef<HTMLDivElement> + tabIndex={-1}
- useEffect focuses error container on mount
- Retry button calls reset()

## Server Actions

- VERIFY:FD-FE-003 — loginAction and registerAction in lib/actions.ts
- Actions call API endpoints, handle errors, redirect on success

## Convention Gates

- VERIFY:FD-FE-008 — Zero dangerouslySetInnerHTML in frontend code
- No console.log in production code
- All interactive elements keyboard accessible

## Cross-References

- See [API Endpoints](./api-endpoints.md) for backend routes called by actions
- See [Security](./security.md) for CSRF and XSS prevention
- VERIFY:FD-SHARED-001 — Shared package exports 10+ utilities used by both API and web
- VERIFY:FD-TEST-010 — Accessibility tests with jest-axe
- VERIFY:FD-TEST-011 — Keyboard navigation tests with userEvent
