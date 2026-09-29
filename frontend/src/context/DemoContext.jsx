/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken } from "../service/apiClient.js";
import { useAuth } from "./AuthContext.jsx";

const DemoContext = createContext(null);

const emptyState = () => ({ apis: [], alerts: [], activity: [], recentChecks: [] });

/** Map backend ApiResponse -> the shape the pages already render. */
function mapApi(item) {
    return {
        id: item.id,
        name: item.name,
        url: item.url,
        method: item.method,
        status: item.status,
        responseTime: item.responseTime ?? "—",
        averageResponseTime: item.averageResponseTimeMs ?? 0,
        successRate: String(item.successRate ?? "100.0"),
        environment: item.environment,
        lastChecked: item.lastChecked ?? "Not checked yet",
        lastCheckedAt: item.lastCheckedAt,
        tags: item.tags ?? [],
        description: item.description ?? "",
        expectedStatus: item.expectedStatus,
        threshold: item.thresholdMs,
        interval: String(item.intervalMinutes ?? 5),
        authType: item.authType,
        paused: Boolean(item.paused),
        headers: item.headers ?? [],
        requestBody: item.requestBody ?? "",
        // Lists carry logs only when detail was fetched; empty otherwise.
        logs: item.logs ?? [],
        errorHistory: item.errorHistory ?? [],
        downtimeHistory: item.downtimeHistory ?? [],
    };
}

/** Map the AddApi form values -> backend ApiCreateRequest. */
export function toCreatePayload(values) {
    return {
        name: values.name,
        url: values.url,
        method: values.method || "GET",
        environment: values.environment || "Production",
        description: values.description || "",
        expectedStatus: Number(values.expectedStatus) || 200,
        thresholdMs: Number(values.threshold) || 500,
        intervalMinutes: Number(values.interval) || 5,
        authType: values.authType || "None",
        requestBody: values.requestBody || "",
        headers: (values.headers || [])
            .filter((h) => h && h.key && h.key.trim())
            .map((h) => ({ key: h.key.trim(), value: h.value || "" })),
        tags: values.tags || [],
    };
}

function requireToken() {
    if (!getToken()) {
        const error = new Error("You are signed out. Sign in again to continue.");
        error.status = 401;
        throw error;
    }
}

export function DemoProvider({ children }) {
    const { isLoggedIn } = useAuth();
    const backendMode = isLoggedIn && Boolean(getToken());

    const [state, setState] = useState(emptyState);
    const [toast, setToast] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [syncError, setSyncError] = useState(null);

    useEffect(() => {
        if (!toast) return undefined;
        const timer = window.setTimeout(() => setToast(null), 2600);
        return () => window.clearTimeout(timer);
    }, [toast]);

    const notify = useCallback((message, tone = "success") => setToast({ message, tone }), []);

    const refresh = useCallback(async () => {
        if (!getToken()) return;
        setSyncing(true);
        setSyncError(null);
        try {
            const [apis, alerts, activity, recentChecks] = await Promise.all([
                api.listApis(),
                api.listAlerts(),
                api.listActivity(),
                api.recentChecks(60),
            ]);
            setState({
                apis: apis.map(mapApi),
                alerts,
                activity,
                recentChecks,
            });
        } catch (error) {
            setSyncError(error.message);
        } finally {
            setSyncing(false);
        }
    }, []);

    // Pull live data on login. The backend is the single source of truth —
    // there is no local demo data and nothing is simulated.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-login, not a cascading render
        if (backendMode) refresh();
        else setState(emptyState());
    }, [backendMode, refresh]);

    /** Fetch full detail (api + last 50 recorded checks) for one monitor. */
    const fetchApiDetails = useCallback(async (id) => {
        requireToken();
        const bundle = await api.getApi(id);
        const mapped = mapApi({ ...bundle.api, logs: bundle.logs });
        mapped.errorHistory = (bundle.logs || [])
            .filter((l) => !l.success)
            .slice(0, 10)
            .map((l) => ({ id: l.id, timestamp: l.timestamp, message: l.errorMessage || `HTTP ${l.statusCode}` }));
        setState((current) => ({
            ...current,
            apis: current.apis.map((item) => String(item.id) === String(id) ? { ...item, ...mapped } : item),
        }));
        return mapped;
    }, []);

    const addApi = (values) => {
        requireToken();
        return api.createApi(toCreatePayload(values)).then(async (created) => {
            await refresh();
            notify(`${created.name} added to monitoring`);
            return created.id;
        });
    };

    const runCheck = (id) => {
        requireToken();
        // Live probe against the real endpoint; the backend records the result.
        return api.runCheck(id).then(async () => {
            try {
                await fetchApiDetails(id);
            } catch { /* ignore */ }
            await refresh();
            notify("Health check completed");
        }).catch((error) => {
            notify(error.message || "Health check failed", "error");
            throw error;
        });
    };

    const togglePaused = (id) => {
        requireToken();
        return api.togglePaused(id).then(async () => {
            await refresh();
            notify("Monitor state updated");
        }).catch((error) => {
            notify(error.message, "error");
            throw error;
        });
    };

    const deleteApi = (id) => {
        requireToken();
        return api.deleteApi(id).then(async () => {
            await refresh();
            notify("API removed", "error");
        }).catch((error) => {
            notify(error.message, "error");
            throw error;
        });
    };

    const markAlertRead = (id) => {
        requireToken();
        api.markAlertRead(id).then(refresh).catch(() => {});
        setState((current) => ({ ...current, alerts: current.alerts.map((alert) => alert.id === id ? { ...alert, unread: false } : alert) }));
    };

    const markAllAlertsRead = () => {
        requireToken();
        api.markAllAlertsRead().then(refresh).catch(() => {});
        setState((current) => ({ ...current, alerts: current.alerts.map((alert) => ({ ...alert, unread: false })) }));
        notify("All alerts marked as read");
    };

    const value = useMemo(() => ({
        ...state,
        addApi, runCheck, togglePaused, deleteApi,
        markAlertRead, markAllAlertsRead, notify,
        fetchApiDetails, refresh,
        backendMode, syncing, syncError,
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [state, backendMode, syncing, syncError]);

    return (
        <DemoContext.Provider value={value}>
            {children}
            {toast && <div className={`fixed right-6 bottom-6 z-[100] max-w-sm rounded-lg border px-4 py-3 shadow-2xl font-body text-sm ${toast.tone === "error" ? "border-error bg-error text-white" : "border-primary bg-primary text-white"}`} role="status">{toast.message}</div>}
        </DemoContext.Provider>
    );
}

export function useDemo() {
    const value = useContext(DemoContext);
    if (!value) throw new Error("useDemo must be used inside DemoProvider");
    return value;
}
