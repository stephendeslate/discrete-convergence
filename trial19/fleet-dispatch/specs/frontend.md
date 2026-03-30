# Frontend Specification

## Overview

Fleet Dispatch frontend is a Next.js 15 App Router application with shadcn/ui components, server actions for API communication, and comprehensive accessibility features including dark mode, ARIA attributes, and keyboard navigation.

## UI Framework

The cn() utility function combines clsx and tailwind-merge for conditional class composition across all components.

<!-- VERIFY: FD-UI-001 — cn utility uses clsx + tailwind-merge for class composition -->

## Layout and Navigation

RootLayout sets html lang="en", metadata title "Fleet Dispatch", and renders the Nav component with aria-label="Main navigation". Main content area uses role="main".

<!-- VERIFY: FD-UI-002 — RootLayout sets lang, metadata, Nav, and semantic main -->

## Dashboard

DashboardPage displays fleet overview with Vehicles, Drivers, and Dispatches summary cards. Each card uses role="region" with aria-label. Version displayed from APP_VERSION shared constant.

<!-- VERIFY: FD-UI-003 — DashboardPage renders summary cards with ARIA regions -->

## Frontend Integration

Server actions in lib/actions.ts handle all API communication:

- loginAction stores JWT token via cookies().set
- authenticatedFetch reads token from cookies and sends Bearer header
- All entity fetchers (getVehicles, getDrivers, getRoutes, getDispatches, getDashboards, getDataSources) use authenticatedFetch

<!-- VERIFY: FD-FI-001 — loginAction stores JWT token in cookies -->
<!-- VERIFY: FD-FI-002 — authenticatedFetch sends Bearer token from cookies -->
<!-- VERIFY: FD-FI-003 — Entity fetchers use authenticatedFetch for protected API calls -->
