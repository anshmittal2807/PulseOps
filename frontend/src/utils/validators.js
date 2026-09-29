const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_RE = /^https?:\/\/.+/;
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const ENVIRONMENTS = ["Production", "Staging", "Development"];
const INTERVALS = [1, 5, 15, 30];
const AUTH_TYPES = ["None", "Bearer", "API Key", "Basic"];

export function validateEmail(value) {
    const email = (value || "").trim();
    if (!email) return "Email is required.";
    if (email.length > 190) return "Email is too long.";
    if (!EMAIL_RE.test(email)) return "Enter a valid email address.";
    return null;
}

export function validateName(value, label = "Name") {
    const name = (value || "").trim();
    if (!name) return `${label} is required.`;
    if (name.length < 2) return `${label} must be at least 2 characters.`;
    if (name.length > 120) return `${label} must be under 120 characters.`;
    return null;
}

export function passwordChecks(password) {
    const value = password || "";
    return [
        { label: "At least 8 characters", ok: value.length >= 8 },
        { label: "Contains a letter", ok: /[A-Za-z]/.test(value) },
        { label: "Contains a number", ok: /\d/.test(value) },
    ];
}

export function validatePassword(value) {
    if (!value) return "Password is required.";
    if (value.length < 8) return "Password must be at least 8 characters.";
    if (value.length > 100) return "Password must be under 100 characters.";
    if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
        return "Password must contain at least one letter and one number.";
    }
    return null;
}

export function validateLoginForm({ email, password }) {
    const errors = {};
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    if (!password) errors.password = "Password is required.";
    return errors;
}

export function validateRegisterForm({ name, email, password }) {
    const errors = {};
    const nameError = validateName(name, "Display name");
    if (nameError) errors.name = nameError;
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;
    return errors;
}

export function validateMonitorForm(form, { headers = [], tags = [] } = {}) {
    const errors = {};
    const name = (form.name || "").trim();
    if (!name) errors.name = "Give this monitor a name.";
    else if (name.length < 2) errors.name = "Name must be at least 2 characters.";
    else if (name.length > 160) errors.name = "Name must be under 160 characters.";

    const url = (form.url || "").trim();
    if (!url) errors.url = "URL is required.";
    else if (url.length > 1024) errors.url = "URL must be under 1024 characters.";
    else if (!URL_RE.test(url)) {
        errors.url = "Enter a full URL, including http:// or https://.";
    } else {
        try {
            new URL(url);
        } catch {
            errors.url = "That URL looks invalid. Check the format.";
        }
    }

    if (!METHODS.includes(form.method)) errors.method = "Choose a valid HTTP method.";
    if (!ENVIRONMENTS.includes(form.environment)) errors.environment = "Choose an environment.";

    const expected = Number(form.expectedStatus);
    if (!Number.isInteger(expected) || expected < 100 || expected > 599) {
        errors.expectedStatus = "Expected status must be 100–599.";
    }
    const threshold = Number(form.threshold);
    if (!Number.isInteger(threshold) || threshold < 50 || threshold > 60000) {
        errors.threshold = "Threshold must be 50–60000 ms.";
    }
    if (!INTERVALS.includes(Number(form.interval))) {
        errors.interval = "Choose a check interval.";
    }
    if (!AUTH_TYPES.includes(form.authType)) errors.authType = "Choose an auth type.";

    if ((form.description || "").length > 1024) {
        errors.description = "Description must be under 1024 characters.";
    }

    const body = (form.requestBody || "").trim();
    if (body) {
        try {
            JSON.parse(body);
        } catch {
            errors.requestBody = "Request body must be valid JSON.";
        }
        if (body.length > 4000) errors.requestBody = "Request body must be under 4000 characters.";
    }

    if (headers.length > 20) {
        errors.headers = "Too many headers (max 20).";
    } else {
        const seen = new Set();
        headers.forEach((header, index) => {
            const key = (header.key || "").trim();
            if (!key) {
                errors[`header-${index}`] = "Header key is required.";
            } else if (key.length > 190) {
                errors[`header-${index}`] = "Header key must be under 190 characters.";
            } else if (seen.has(key.toLowerCase())) {
                errors[`header-${index}`] = "Duplicate header key.";
            } else {
                seen.add(key.toLowerCase());
            }
            if ((header.value || "").length > 1024) {
                errors[`header-${index}`] = "Header value must be under 1024 characters.";
            }
        });
    }

    if (tags.length > 10) {
        errors.tags = "Too many tags (max 10).";
    } else if (tags.some((tag) => tag.length > 60)) {
        errors.tags = "Tags must be under 60 characters each.";
    }

    return errors;
}

/**
 * Translate backend `errors` maps (Java field names) to frontend field names.
 * Unknown keys are returned under `_form` so they still surface in the UI.
 */
const BACKEND_FIELD_ALIASES = {
    thresholdMs: "threshold",
    intervalMinutes: "interval",
    requestBody: "requestBody",
    expectedStatus: "expectedStatus",
};

export function mapBackendErrors(payload) {
    if (!payload || typeof payload !== "object" || !payload.errors) return {};
    const mapped = {};
    for (const [key, message] of Object.entries(payload.errors)) {
        const normalized = key.includes(".") ? key.slice(key.lastIndexOf(".") + 1) : key;
        const frontKey = BACKEND_FIELD_ALIASES[normalized] || normalized;
        if (["name", "url", "method", "environment", "description", "expectedStatus", "threshold", "interval", "authType", "requestBody", "headers", "tags", "email", "password"].includes(frontKey)) {
            mapped[frontKey] = message;
        } else if (frontKey.startsWith("headers[")) {
            mapped.headers = message;
        } else {
            mapped._form = mapped._form ? `${mapped._form} ${message}` : message;
        }
    }
    return mapped;
}

export function hasErrors(errors) {
    return Object.keys(errors || {}).length > 0;
}

export { METHODS, ENVIRONMENTS, INTERVALS, AUTH_TYPES };
