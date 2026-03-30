# Frontend Specification

## Overview

The Analytics Engine frontend is a Next.js 15 application with React 19,
Tailwind CSS 4, and shadcn/ui components. It communicates with the backend
via server actions that handle authentication and data fetching.

See also: [API Endpoints](api-endpoints.md) for backend routes.
See also: [Authentication](authentication.md) for auth token flow.

## Pages and Routes

### Dashboard Page (/dashboard)
Displays a grid of dashboard cards with title, description, and status badges.
Fetches data via getDashboards() server action.

### Data Sources Page (/data-sources)
Displays a table of data sources with name, type, and active status.
Fetches data via getDataSources() server action.

### Login Page (/login)
Login form with email and password fields.
Uses loginAction() server action to authenticate.

### Register Page (/register)
Registration form with name, email, password fields.
Uses registerAction() server action to create account.

### Settings Page (/settings)
Displays application information including version from APP_VERSION.

## UI Components (shadcn/ui)

VERIFY: AE-UI-001
cn() utility combines clsx and tailwind-merge for className merging.

VERIFY: AE-UI-002
Button component supports variants (default, destructive, outline, secondary,
ghost, link) and sizes (default, sm, lg, icon) with proper focus styles.

VERIFY: AE-UI-003
Nav component provides main navigation with links to dashboard, data sources,
settings, and a logout action. Uses semantic nav element with aria-label.

VERIFY: AE-UI-004
Root layout includes Nav component and applies consistent page structure
with proper HTML lang attribute and semantic main element.

VERIFY: AE-UI-005
Dashboard page renders cards with Badge components showing status.

VERIFY: AE-UI-006
Login page renders accessible form with proper label associations,
aria-required attributes, and form action binding.

VERIFY: AE-UI-007
UI component tests verify rendering, user interaction, and keyboard navigation
for Button, Card, Input, Label, Badge, Skeleton, and Alert.

## Loading and Error States

VERIFY: AE-AX-001
Loading states use role="status" and aria-busy="true" on outer container
with Skeleton components for visual feedback.

VERIFY: AE-AX-002
Error states use role="alert" with useRef/useEffect focus management
and tabIndex={-1} for screen reader accessibility.

## Dark Mode

Dark mode is implemented via @media (prefers-color-scheme: dark) in globals.css,
not via .dark class. This ensures automatic system preference detection.

## Server Actions

All server action exports are async functions marked with 'use server'.
Protected actions read token via cookies().get('token') and pass
Authorization headers to backend API calls.
