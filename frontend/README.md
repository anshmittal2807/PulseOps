# PulseOps frontend

React 19 + Vite + Tailwind interface for the PulseOps uptime-monitoring backend.

## Run locally

```bash
npm install
npm run dev
```

The app expects the backend at `http://localhost:8080/api`. Override it with:

```bash
VITE_API_URL=https://your-api.example.com/api
```

## Verification

```bash
npm run lint
npm run build
```

Authentication, monitors, live probes, scheduled-check history, transition alerts, recovery notifications, activity, historical reports, and CSV export all use the backend API. The UI refreshes account data every 30 seconds while visible.
