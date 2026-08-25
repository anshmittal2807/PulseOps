## 2026-08-25 - Add "Add New API" page

### Type
Feature

### Summary
Converted the "Add New API Endpoint" HTML mockup into a working React form page at `/apis/add`.

### Files Created
- src/pages/AddApi.jsx

### Files Modified
- src/router/Router.jsx (added `/apis/add` route)
- src/pages/AllApis.jsx ("Add API" button now navigates to /apis/add)

### Details
- Fully controlled form: name, URL, HTTP method, environment, description, expected status code, response time threshold, monitoring interval, auth type, request body.
- Dynamic headers list (add / edit / remove rows) and tag chips (Enter or blur to add, X to remove).
- Save logs the payload to console and navigates back to /apis (backend integration pending); Cancel returns to /apis.
- Reuses existing layout (SideNavBar/TopNavBar) and Tailwind @theme tokens; no new dependencies.

### Testing
- `npm run build` passes with no errors.


# Changelog

## 2026-08-25 - Convert "All APIs" HTML mockup to React

### Type
Feature / Refactor

### Summary
Converted the static "All APIs" HTML mockup into React components and pages using Tailwind v4 `@theme` tokens.

### Files Created
- src/components/layout/SideNavBar.jsx
- src/components/layout/TopNavBar.jsx
- src/components/api/StatusBadge.jsx
- src/components/api/ApiTable.jsx
- src/pages/AllApis.jsx

### Files Modified
- src/styles.css (added @theme color/font tokens, status-pulse animation)
- src/router/Router.jsx (added AppLayout with SideNavBar/TopNavBar; routes /dashboard and /apis)
- index.html (added Google Fonts + Material Symbols links, fixed malformed link tag, title set to PulseOps)

### Details
- The API list page uses local useState for search/status/environment/method/tags filters applied over a static data array.
- StatusBadge renders colored dots with pulse animation for Healthy status.
- ApiTable shows an empty-state row when filters match nothing.
- No new dependencies added.

### Testing
- `npm run build` passes with no errors.
