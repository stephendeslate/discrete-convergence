# Frontend Specification

## Overview

The frontend is a Next.js 15 application with server-side rendering and
server actions for API communication. It uses Recharts for data visualization.

Cross-reference: See [authentication.md](authentication.md) for login/register flows.
Cross-reference: See [api-endpoints.md](api-endpoints.md) for backend API contract.

## Pages

### Login (/login)
- Login form with email and password fields
- Server action calls POST /auth/login
- Sets httpOnly secure cookie with access token

### Register (/register)
- Registration form with name, email, password, org, role
- Role selector limited to USER and VIEWER
- Server action calls POST /auth/register

### Dashboard List (/dashboard)
- Lists all dashboards for the current tenant
- Link to create new dashboard
- Shows dashboard status (DRAFT/PUBLISHED/ARCHIVED)

### Dashboard Builder (/dashboard/:id)
- Grid-based widget layout
- Add/edit/remove widgets
- Publish and archive actions

### Data Sources (/data-sources)
- List configured data sources
- Link to add new data source

### Data Source Config (/data-sources/:id)
- Connection settings form
- Field mapping configuration
- Sync trigger and history

### Embed Settings (/embed)
- Configure allowed origins
- Theme customization

### API Keys (/api-keys)
- List active API keys
- Create new keys
- Revoke existing keys

### Settings (/settings)
- Tenant organization settings
- Billing and tier management

## VERIFY Tags

VERIFY: AE-FI-001 — login sets httpOnly secure cookie with access token
VERIFY: AE-FI-002 — registration sets httpOnly secure cookie
VERIFY: AE-FI-003 — protected actions read token from cookie and send Bearer header
VERIFY: AE-A11Y-001 — root layout with lang attribute and title
VERIFY: AE-A11Y-002 — heading hierarchy maintained on home page
VERIFY: AE-A11Y-003 — login page with form labels and heading
VERIFY: AE-A11Y-004 — register page with form labels and heading
VERIFY: AE-A11Y-005 — dashboard list page with heading hierarchy
VERIFY: AE-A11Y-006 — form inputs have associated labels
VERIFY: AE-A11Y-007 — registration form with proper label associations
VERIFY: AE-A11Y-008 — dashboard builder with proper heading and alt text
VERIFY: AE-WIDGET-005 — Recharts integration for chart rendering

## Accessibility Requirements

- All pages must have `<html lang="en">`
- Title tag set in root metadata
- Heading hierarchy (h1 > h2 > h3) maintained per page
- All form inputs have associated labels
- Images and charts have alt text
- Error messages use role="alert"

## Edge Cases

VERIFY: AE-FI-004 — login with invalid credentials shows error message
VERIFY: AE-FI-005 — empty dashboard list shows helpful prompt
