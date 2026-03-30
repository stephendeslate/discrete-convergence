# Frontend Specification

## Overview

Fleet Dispatch web application built with Next.js 15 App Router,
React 19, Tailwind CSS 4, and shadcn/ui component patterns.

## Technology Stack

- Next.js 15 with App Router
- React 19 with Server Components
- Tailwind CSS 4 for styling
- clsx + tailwind-merge for class merging (cn utility)
- Server Actions for form submissions

## Component Library

8+ shadcn/ui-style components in `components/ui/`:
- Button (variants: default, destructive, outline, secondary, ghost, link)
- Card (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- Input (with focus ring styling)
- Label (accessible form labels)
- Badge (status indicators)
- Table (data display)
- Select (dropdown)
- Skeleton (loading placeholders)
- Textarea (multi-line input)

<!-- VERIFY:FD-UI-001 — cn() utility uses clsx + tailwind-merge -->
<!-- VERIFY:FD-UI-002 — Server Actions check response.ok before redirect -->
<!-- VERIFY:FD-UI-003 — Nav component in root layout with APP_VERSION -->

## Pages

| Route | Purpose |
|-------|---------|
| / | Landing page |
| /dashboard | Dispatch dashboard with stats |
| /work-orders | Work order list |
| /technicians | Technician list |
| /customers | Customer list |
| /routes | Route management |
| /invoices | Invoice management |
| /login | Login form |
| /register | Registration form |
| /settings | Company settings |
| /tracking | Customer tracking portal |

## Loading States

All routes have `loading.tsx` with:
- `role="status"` on outer container
- `aria-busy="true"` attribute
- Skeleton components for visual placeholder
- Screen reader text via `sr-only` class

## Error States

All routes have `error.tsx` with:
- `role="alert"` on outer container
- `useRef<HTMLDivElement>` for focus management
- `useEffect` to focus error container on mount
- `tabIndex={-1}` for programmatic focus
- Reset button for error recovery

## Dark Mode

<!-- VERIFY:FD-UI-004 — Dark mode via @media (prefers-color-scheme: dark) in globals.css -->

Dark mode uses `@media (prefers-color-scheme: dark)` in `globals.css`.
No `.dark` class-based approach.

## Code Splitting

Dashboard page uses `next/dynamic` for DashboardStats component
with Skeleton loading state.

## Server Actions

Forms use Server Actions with `'use server'` directive.
All actions check `response.ok` before calling `redirect()`.
