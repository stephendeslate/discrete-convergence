# Frontend Specification

## Overview
Next.js 15 with React 19 frontend using server actions for API communication.

## Requirements

### FD-FE-001: Server Actions
<!-- VERIFY: FD-FE-001 -->
All API communication uses Next.js server actions with cookie-based auth token management. Tokens stored as httpOnly cookies.

### FD-FE-002: Error Handling
<!-- VERIFY: FD-FE-002 -->
All fetch calls include error handling with appropriate fallback responses. Network errors do not crash the UI.

### FD-FE-003: Loading States
<!-- VERIFY: FD-FE-003 -->
Loading components use role="status" and aria-busy="true" with skeleton placeholders and sr-only loading text.

### FD-FE-004: Error Boundaries
<!-- VERIFY: FD-FE-004 -->
Error boundaries use role="alert" with useRef + useEffect for auto-focus and tabIndex={-1} for programmatic focus.
