const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/$/, "");

const TOKEN_KEY = "pulseops-token";

export function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function setToken(token) {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
    } catch {
        /* storage unavailable */
    }
}

export function isAuthenticated() {
    return Boolean(getToken());
}

async function parseBody(response) {
    const text = await response.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

/**
 * Thin fetch wrapper that attaches the JWT (when present) and throws
 * an Error with `status` + `payload` for non-2xx responses.
 */
export async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth) {
        const token = getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (response.status === 401 && auth) {
        // Token expired/invalid -> drop it so the router redirects to /login.
        setToken(null);
        window.dispatchEvent(new Event("pulseops:unauthorized"));
    }
    const payload = await parseBody(response);
    if (!response.ok) {
        const message =
            (payload && typeof payload === "object" && (payload.message || payload.error)) ||
            `Request failed (${response.status})`;
        const error = new Error(typeof message === "string" ? message : "Request failed");
        error.status = response.status;
        error.payload = payload;
        // Backend bean-validation failures arrive as { message, errors: { field: msg } }.
        error.fields =
            payload && typeof payload === "object" && payload.errors && typeof payload.errors === "object"
                ? payload.errors
                : {};
        throw error;
    }
    return payload;
}

export const api = {
    // auth (no token attached)
    register: (data) => apiRequest("/auth/register", { method: "POST", body: data, auth: false }),
    login: (data) => apiRequest("/auth/login", { method: "POST", body: data, auth: false }),
    me: () => apiRequest("/auth/me"),
    updateProfile: (data) => apiRequest("/auth/profile", { method: "PUT", body: data }),

    // monitors
    listApis: () => apiRequest("/apis"),
    getApi: (id) => apiRequest(`/apis/${id}`),
    createApi: (data) => apiRequest("/apis", { method: "POST", body: data }),
    updateApi: (id, data) => apiRequest(`/apis/${id}`, { method: "PUT", body: data }),
    deleteApi: (id) => apiRequest(`/apis/${id}`, { method: "DELETE" }),
    togglePaused: (id) => apiRequest(`/apis/${id}/pause`, { method: "PATCH" }),
    runCheck: (id) => apiRequest(`/apis/${id}/check`, { method: "POST" }),

    // alerts + activity + dashboard
    listAlerts: () => apiRequest("/alerts"),
    markAlertRead: (id) => apiRequest(`/alerts/${id}/read`, { method: "PATCH" }),
    markAllAlertsRead: () => apiRequest("/alerts/read-all", { method: "PATCH" }),
    listActivity: () => apiRequest("/activity"),
    dashboardStats: () => apiRequest("/dashboard/stats"),
    recentChecks: (limit = 60) => apiRequest(`/dashboard/recent-checks?limit=${limit}`),
    probeMonitor: (data) => apiRequest("/apis/probe", { method: "POST", body: data }),
    health: () => apiRequest("/health", { auth: false }),
};

export { BASE_URL, TOKEN_KEY };
