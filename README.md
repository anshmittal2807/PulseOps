# PulseOps — API Observability Platform

Full-stack API health monitoring: a **Spring Boot backend** (JWT auth, live HTTP health checks, scheduler, alerts, activity log, dashboard stats) plus a **React + Vite + Tailwind frontend**.

Everything is live data — no demo fixtures, no simulated checks. Monitors you add are probed for real, on a schedule, and every result is recorded.

## Quick start

### 1. Backend (port 8080)

```bash
cd Backend
./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run
```

- Default DB is a durable **H2 file database** at `Backend/data/pulseops` — zero setup and data survives restarts. Override with `DATASOURCE_URL` / `DATASOURCE_USERNAME` / `DATASOURCE_PASSWORD`, or use the MySQL profile (`MYSQL_USER` / `MYSQL_PASSWORD`, see `application-mysql.properties`).
- First boot creates an admin account (`ADMIN_EMAIL` / `ADMIN_PASSWORD`, dev default `admin@pulseops.io / Admin@123` — a warning is logged while the default password is in use).
- JWT secret: set `JWT_SECRET` in production (dev default in `application.properties`).
- Swagger UI: http://localhost:8080/swagger-ui.html
- H2 console: http://localhost:8080/h2-console (JDBC URL `jdbc:h2:file:./data/pulseops`, user `sa`)

### 2. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

`VITE_API_URL` (in `frontend/.env`) points at `http://localhost:8080/api`. Open http://localhost:5173 and sign in (or register — new accounts start empty with a welcome entry).

## Backend API

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | no | Register. Returns `{ token, user }` |
| POST | `/api/auth/login` | no | Login. Returns `{ token, user }` |
| GET | `/api/auth/me` | JWT | Current user |
| PUT | `/api/auth/profile` | JWT | Update display name |
| GET | `/api/apis` | JWT | List monitors |
| POST | `/api/apis` | JWT | Create monitor |
| POST | `/api/apis/probe` | JWT | Test a config live **without** saving or recording anything |
| GET | `/api/apis/{id}` | JWT | Monitor + last 50 recorded check logs |
| PUT | `/api/apis/{id}` | JWT | Update monitor |
| DELETE | `/api/apis/{id}` | JWT | Delete monitor + history |
| PATCH | `/api/apis/{id}/pause` | JWT | Pause / resume |
| POST | `/api/apis/{id}/check` | JWT | Run a live HTTP check now (recorded) |
| GET | `/api/alerts` | JWT | List alerts |
| PATCH | `/api/alerts/{id}/read` | JWT | Mark one alert read |
| PATCH | `/api/alerts/read-all` | JWT | Mark all alerts read |
| GET | `/api/activity` | JWT | Activity feed |
| GET | `/api/dashboard/stats` | JWT | Stats for the dashboard |
| GET | `/api/dashboard/recent-checks?limit=60` | JWT | Recently recorded checks across the estate |
| GET | `/api/dashboard/report?period=weekly` | JWT | Check-based uptime, latency, failures and downtime report |
| GET | `/api/health` | no | Liveness probe |

Auth: `Authorization: Bearer <jwt>` (configurable expiry via `JWT_EXPIRATION_MS`, BCrypt-hashed passwords).

## How monitoring works

- `POST /api/apis/{id}/check` probes the URL with `java.net.http.HttpClient` (configurable timeout), compares status code vs `expectedStatus` and latency vs `thresholdMs`, then classifies `Healthy / Warning / Critical / Offline`, updates rolling average + uptime, and stores a `CheckLog`.
- Alerts are created on status transitions rather than on every failed poll. Recovery automatically resolves unread incident alerts and creates a recovery notification.
- `MonitoringScheduler` (every `MONITORING_FIXED_DELAY_MS`, default 60s) automatically probes each unpaused monitor whose `intervalMinutes` (1/5/15/30) has elapsed since its last check. Disable with `MONITORING_ENABLED=false`.
- "Test connection" on the Add page calls `POST /api/apis/probe`, which runs the identical live probe but persists nothing.

The frontend refreshes live data every 30 seconds, supports full monitor create/edit/pause/run/delete workflows, derives downtime windows from check history, and exports historical reports as CSV.
