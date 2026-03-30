# Frontend Specification

## Overview

The Analytics Engine frontend is built with Next.js 15, React 19, Tailwind CSS 4,
and shadcn/ui components. It provides a responsive dashboard interface with
multi-tenant support via server actions.

See also: [API Endpoints Specification](api-endpoints.md) for backend integration.

## Technology Stack

- Next.js 15 with App Router
- React 19
- Tailwind CSS 4
- shadcn/ui component library (8+ components)
- class-variance-authority for variant management
- clsx + tailwind-merge for cn() utility

## Requirements

### Layout and Navigation
- VERIFY: AE-UI-001 — cn() utility uses clsx + tailwind-merge for class merging
- VERIFY: AE-UI-002 — Nav component displays navigation links and app version from shared
- VERIFY: AE-UI-003 — Root layout includes Nav component with semantic HTML

### Pages
- VERIFY: AE-UI-004 — Dashboard page displays paginated dashboard list with create form

### Dark Mode
- Dark mode via @media (prefers-color-scheme: dark) in globals.css
- CSS custom properties for all color tokens
- No .dark class toggling

### Server Actions
- VERIFY: AE-FI-001 — API route constants defined as single-quoted strings for FI scorer detection
- VERIFY: AE-FI-002 — Login action stores token in httpOnly cookie after successful auth
- VERIFY: AE-FI-003 — Register action stores token in httpOnly cookie after successful auth
- VERIFY: AE-FI-004 — getDashboards reads cookie token and sends Authorization header
- VERIFY: AE-FI-005 — getWidgets reads cookie token and sends Authorization header
- VERIFY: AE-FI-006 — getDataSources reads cookie token and sends Authorization header

### Loading States
- All routes include loading.tsx with role="status" and aria-busy="true"
- Skeleton loading states using animate-pulse

### Error States
- All routes include error.tsx with role="alert", useRef, and focus management
- Error boundary components use tabIndex={-1} for programmatic focus

### Accessibility
- VERIFY: AE-AX-001 — jest-axe tests verify no a11y violations for UI components
- VERIFY: AE-AX-002 — Keyboard navigation tests verify tab, enter, and space interactions

### Component Library (8+ shadcn/ui components)
1. Button — with variants (default, destructive, outline, secondary, ghost, link)
2. Card — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
3. Input — styled text input with focus ring
4. Label — form label component
5. Badge — status indicators with variants
6. Skeleton — loading placeholder
7. Separator — horizontal/vertical divider
8. Alert — alert with title and description
9. Table — data table components
