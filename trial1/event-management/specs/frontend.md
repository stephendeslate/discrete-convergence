# Frontend Specification

> **Project:** Event Management
> **Category:** FE
> **Cross-references:** See [monitoring.md](monitoring.md), [cross-layer.md](cross-layer.md)

---

## Requirements

### VERIFY:EM-FE-001 — Framework and UI

Next.js 15 App Router with React 19. Uses shadcn/ui component patterns with `cn()` utility
(clsx + tailwind-merge). Components in `components/ui/`. Minimum 8 shadcn/ui components:
button, card, input, label, select, table, badge, dialog. All components use `forwardRef`
for ref forwarding and accept `className` prop for composition.

Root layout includes navigation with links to Events, Venues, Registrations, and Settings.
Navigation uses `APP_VERSION` from shared package for version display.

### VERIFY:EM-FE-002 — Loading States

All route segments have `loading.tsx` with:
- `role="status"` on outer container
- `aria-busy="true"` attribute
- Skeleton placeholders matching page layout
- Screen reader text via `sr-only` class

Loading states render immediately while page data fetches, providing visual feedback.

### VERIFY:EM-FE-003 — Error Boundaries

All route segments have `error.tsx` with:
- `role="alert"` on outer container
- `useRef<HTMLDivElement>` for focus ref
- `tabIndex={-1}` for programmatic focus
- `useEffect` to focus the error container on mount
- Reset button that calls `reset()` to retry

Error boundaries catch rendering errors and display user-friendly messages without
exposing stack traces or internal details.

### VERIFY:EM-FE-004 — Dark Mode

Dark mode via `@media (prefers-color-scheme: dark)` in globals.css. CSS custom properties
for all theme colors (background, foreground, primary, muted, border, etc.). No `.dark`
class toggle — the system preference is respected automatically. Primary color uses
purple (#7c3aed light / #8b5cf6 dark).

### VERIFY:EM-FE-005 — Server Actions

Server actions in `lib/actions.ts` with `'use server'` directive. All fetch calls check
`response.ok` before processing JSON. Returns typed error objects on failure. Actions
include: loginAction, getEvents, getVenues for server-side data fetching.
API base URL from environment variable, not hardcoded.
