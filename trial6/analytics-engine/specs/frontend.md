# Frontend Specification

## Overview

The web application is built with Next.js 15, using the App Router, server actions,
and Tailwind CSS with shadcn/ui components.

<!-- VERIFY: AE-FE-001 -->

## Routes

| Route | Auth | Description |
|-------|------|-------------|
| / | No | Redirects to /dashboard |
| /login | No | Login form |
| /register | No | Registration form |
| /dashboard | Yes | Dashboard listing |
| /dashboard/[id] | Yes | Dashboard detail with widgets |
| /data-sources | Yes | Data source listing |
| /settings | Yes | User settings |

## Middleware

- Route protection middleware redirects unauthenticated users to /login
- Token is stored in cookies and passed to API via server actions
- Public routes: /login, /register

## Server Actions

- All API communication uses server actions in `lib/actions.ts`
- `getToken()` / `getSession()` helpers retrieve auth state from cookies
- Actions call the NestJS API with Authorization Bearer headers

## Components

Built with shadcn/ui primitives:
- Button, Card, Input, Label for form elements
- Navigation header with user menu
- Dashboard cards with status badges
- Widget grid layout
- Data source table with type indicators

## Styling

- Tailwind CSS with custom theme configuration
- Dark mode support via CSS variables
- Responsive layout with mobile breakpoints
