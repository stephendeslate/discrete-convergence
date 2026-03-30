# Frontend Specification

> **Project:** Fleet Dispatch
> **Category:** FE
> **Related:** See [api-endpoints.md](api-endpoints.md) for backend API consumed by the frontend

---

## Overview

The fleet dispatch frontend is a Next.js 15 App Router application with React 19. It uses shadcn/ui-style components with a `cn()` utility combining `clsx` and `tailwind-merge`. Dark mode is implemented via `@media (prefers-color-scheme: dark)` in `globals.css`. Server actions handle API communication.

---

## Requirements

### VERIFY:FD-FE-001 — Next.js App Router with shadcn/ui components

The web application uses Next.js 15 with the App Router pattern. UI components follow the shadcn/ui convention with forwardRef, displayName, variant props, and the `cn()` utility. At least 8 UI components are present in `components/ui/`.

### VERIFY:FD-FE-002 — Loading states with accessibility

All route segments have `loading.tsx` files that render with `role="status"` and `aria-busy="true"` attributes. Loading states include sr-only text for screen readers.

### VERIFY:FD-FE-003 — Error boundaries with focus management

All route segments have `error.tsx` files that render with `role="alert"`, use `useRef` for the container element, and call `ref.current?.focus()` in a `useEffect` to move focus to the error message. Error boundaries include a retry button.

### VERIFY:FD-FE-004 — Dark mode via prefers-color-scheme

Dark mode is implemented using `@media (prefers-color-scheme: dark)` in `globals.css`. CSS custom properties (--background, --foreground, etc.) switch between light and dark values. The `.dark` class is NOT used.

### VERIFY:FD-FE-005 — Server actions with use server directive

Server actions in `lib/actions.ts` use the `'use server'` directive. API route constants are defined as single-quoted string variables. The `response.ok` pattern is used for error handling.

---

## Route Map

| Route | Page | Loading | Error |
|-------|------|---------|-------|
| / | Home | yes | yes |
| /dashboard | Dashboard overview | yes | yes |
| /vehicles | Vehicle list | yes | yes |
| /drivers | Driver list | yes | yes |
| /routes | Route list | yes | yes |
| /dispatches | Dispatch list | yes | yes |
| /maintenance | Maintenance records | yes | yes |
| /login | Login form | yes | yes |
| /register | Registration form | yes | yes |
| /settings | App settings | yes | yes |

---

## Components (components/ui/)

| Component | File | Type |
|-----------|------|------|
| Button | button.tsx | forwardRef with variants |
| Card | card.tsx | forwardRef compound |
| Input | input.tsx | forwardRef |
| Label | label.tsx | forwardRef |
| Select | select.tsx | forwardRef |
| Table | table.tsx | forwardRef compound |
| Badge | badge.tsx | function with variants |
| Dialog | dialog.tsx | forwardRef with native dialog |
