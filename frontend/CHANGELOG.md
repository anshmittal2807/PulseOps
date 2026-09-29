## 2026-09-13 - Convert Activity Log and Reports HTML mockups to React

### Type
Feature / Refactor

### Summary
Converted the "Activity Log" and "Reports" HTML mockups into React pages and
added their routes.

### Files Created
- src/pages/ActivityLog.jsx
- src/pages/Reports.jsx

### Files Modified
- src/router/Router.jsx (routes for /activity-log and /reports; page header titles)
- CHANGELOG.md

### Details
- Activity Log page renders a feed of system events (Added API, Updated URL, Changed Interval, Changed Headers, Deleted API) with color-coded category labels and mono code chips, reusing the existing Tailwind @theme tokens.
- Reports page shows a period selector (Today / Weekly / Monthly) with local state, a 4-card stats grid and a "Most Failed APIs" list with status-colored dots.
- Both pages reuse the existing SideNavBar/TopNavBar layout; no new dependencies.

### Testing
- `npm run build` passes with no errors.
## 2026-09-13 - Convert Dashboard, Alerts and API Details HTML mockups to React

### Type
Feature / Refactor

### Summary
Converted the Dashboard, Alerts and "API Details" HTML mockups into React pages
and reusable components, and added them to the router.

### Files Created
- src/pages/Dashboard.jsx
- src/pages/Alerts.jsx
- src/pages/ApiDetails.jsx
- src/components/dashboard/StatCard.jsx
- src/components/dashboard/Charts.jsx
- src/components/dashboard/RecentChecksTable.jsx
- src/components/api/ApiLogsTable.jsx
- PROJECT_TERMINOLOGY.md

### Files Modified
- src/router/Router.jsx (routes for /dashboard, /alerts and /apis/:id; page header titles in TopNavBar)
- src/components/layout/TopNavBar.jsx (optional title and "Add API" button props)
- src/styles.css (re-organized custom CSS: status-pulse, pulse-pip classes)
- CHANGELOG.md

### Details
- Dashboard page shows six StatCards, three SVG charts (line, doughnut, bar) and a Recent Checks table.
- Charts are implemented with plain SVG (no Chart.js dependency) to keep the code simple and dependency-free.
- Alerts page has its own local state with a "mark as read" action per alert.
- API Details page at /apis/:id shows stat cards, Last 50 Logs table, Error/Downtime history, Headers and Request Body panels.
- All pages reuse the existing SideNavBar/TopNavBar layout and Tailwind @theme tokens.

### Testing
- `npm run build` passes with no errors.
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
