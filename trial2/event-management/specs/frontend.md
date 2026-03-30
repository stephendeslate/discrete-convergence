# Frontend Specification

## Overview

The Event Management frontend is a Next.js 15 application using the App Router,
shadcn/ui components, and Tailwind CSS 4. It provides admin, organizer, and
public-facing interfaces for event management.

## Architecture

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4 with CSS custom properties
- **Components**: shadcn/ui (8+ components in components/ui/)
- **State**: Server Actions with 'use server' directive
- **Utility**: `cn()` function using `clsx` + `tailwind-merge`

## Component Library

<!-- VERIFY:EM-UI-001 — cn() utility uses clsx + tailwind-merge -->
The `cn()` utility in `lib/utils.ts` uses `clsx` and `tailwind-merge` for
class name composition with Tailwind CSS conflict resolution.

### shadcn/ui Components (8+)

1. Button — with variant and size props
2. Card — with Header, Title, Description, Content, Footer
3. Input — styled form input
4. Label — accessible form labels
5. Badge — status indicators
6. Separator — visual dividers
7. Skeleton — loading placeholders
8. Table — data display with Header, Body, Row, Head, Cell
9. Alert — notification messages with AlertTitle and AlertDescription

## Server Actions

<!-- VERIFY:EM-UI-002 — Server actions check response.ok before processing -->
All server actions in `lib/actions.ts` use the `'use server'` directive and
check `response.ok` before processing the response body.

## Navigation

<!-- VERIFY:EM-UI-003 — Nav component uses APP_VERSION from shared -->
The root layout includes a `Nav` component that displays navigation links
and the `APP_VERSION` from the shared package.

<!-- VERIFY:EM-UI-004 — Root layout with Nav component -->
The root `layout.tsx` renders the `Nav` component for all pages.

<!-- VERIFY:EM-UI-005 — Settings page uses APP_VERSION from shared -->
The settings page displays the application version from shared constants.

## Routes

| Path | Description |
|------|-------------|
| / | Home page with links to dashboard and registration |
| /dashboard | Event list with management controls |
| /events/[id] | Event detail view |
| /venues | Venue management |
| /login | Login form |
| /register | Registration form |
| /settings | Application settings |

## Dark Mode

<!-- VERIFY:EM-UI-006 — Dark mode via @media (prefers-color-scheme: dark) -->
Dark mode is implemented using `@media (prefers-color-scheme: dark)` in
`globals.css`, not the `.dark` class pattern. CSS custom properties switch
automatically based on system preference.

## Loading States

All routes include `loading.tsx` with `role="status"` and `aria-busy="true"`
on the outer container for accessibility compliance.

## Error States

All routes include `error.tsx` with `role="alert"`, `useRef<HTMLDivElement>`,
and `useEffect` focus management with `tabIndex={-1}`.

## Code Splitting

Dynamic imports via `next/dynamic` with Skeleton loading states for
bundle optimization on heavier components.
