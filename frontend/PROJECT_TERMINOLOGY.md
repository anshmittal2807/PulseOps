# PROJECT TERMINOLOGY

This file defines the standard terms used across the PulseOps frontend.

## Page / Feature Terms

| Term | Meaning | Used For |
|------|---------|----------|
| Dashboard | Overview page showing summary stats, charts and recent checks | Route: `/dashboard` |
| API | A monitored HTTP endpoint | Route: `/apis` |
| Alerts | Notifications for API health/status problems | Route: `/alerts` |
| Reports | Historical analysis pages | Route: `/reports` |
| Activity Log | Audit trail of system events | Route: `/activity-log` |
| Profile | Current user account page | Route: `/profile` |
| Settings | Application configuration page | Route: `/settings` |

## Reports Terms

| Term | Meaning |
|------|---------|
| Uptime | Percentage of time monitored APIs were healthy in the period |
| Failures | Number of failed checks in the period |
| Average Time | Average response time across monitored APIs |
| Downtime | Total time APIs were unreachable in the period |
| Most Failed APIs | List of APIs sorted by the number of failures |
| Period | Report time window (Today / Weekly / Monthly) |

## Activity Log Terms

| Term | Meaning |
|------|---------|
| Activity Entry | A single system event (added/updated/deleted API, header or interval change) |
| Detail Chip | Mono code block showing the metadata of an activity entry |

## Status Terms

| Term | Meaning |
|------|---------|
| Healthy | API responding within expected thresholds |
| Warning | API responding but beyond expected thresholds |
| Critical | API failing (timeout, wrong status code) |
| Offline | API is down / unreachable |

## UI Terms

| Term | Meaning |
|------|---------|
| Stat Card | Small card showing a single summary number on the Dashboard |
| Recent Checks | Table of the latest checks performed on APIs |
| Response Time Trend | Line chart of latency over time |
| Status Distribution | Doughnut chart of API health statuses |
| API Latency Comparison | Bar chart comparing API latencies |
| Last 50 Logs | Table of the most recent checks of one API |
| Error History | List of past errors of one API |
| Downtime History | List of past downtime windows of one API |
| Headers | HTTP request headers configured for an API |
| Request Body | HTTP request payload configured for an API |

## Component Naming

- React components use `PascalCase` (e.g. `StatCard.jsx`, `RecentChecksTable.jsx`).
- Utility/service files use `camelCase` (e.g. `apiClient.js`).

## Naming Conventions

- Use "API" (not "Service", "Endpoint", "Check" or "Job") when referring to a monitored endpoint.
- Use "Helper" only for shared small utilities.
- Use "Row" for a single row component of a list/table (e.g. `AlertRow`).