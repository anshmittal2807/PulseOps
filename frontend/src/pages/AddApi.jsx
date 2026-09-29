import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toCreatePayload, useDemo } from "../context/DemoContext.jsx";
import { api } from "../service/apiClient.js";
import { AUTH_TYPES, ENVIRONMENTS, INTERVALS, METHODS, hasErrors, mapBackendErrors, validateMonitorForm } from "../utils/validators.js";
import { inputClassName } from "../utils/formClasses.js";
import FormField from "../components/ui/FormField.jsx";
import AlertBanner from "../components/ui/AlertBanner.jsx";

const selectClasses = (hasError) => `${inputClassName(hasError)} appearance-none cursor-pointer`;

function AddApi() {
    const navigate = useNavigate();
    const { addApi, notify } = useDemo();
    const [form, setForm] = useState({ name: "", url: "", method: "GET", environment: "Production", description: "", expectedStatus: 200, threshold: 500, interval: "5", authType: "None", requestBody: "" });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [headers, setHeaders] = useState([{ key: "Content-Type", value: "application/json" }]);
    const [tags, setTags] = useState(["Core"]);
    const [tagInput, setTagInput] = useState("");
    const [tagError, setTagError] = useState(null);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [errors, setErrors] = useState({});

    const update = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => {
            if (!current[field]) return current;
            const next = { ...current };
            delete next[field];
            return next;
        });
    };

    const validate = () => {
        const next = validateMonitorForm(form, { headers, tags });
        setErrors(next);
        return next;
    };

    const addTag = () => {
        const tag = tagInput.trim();
        setTagError(null);
        if (!tag) {
            setTagInput("");
            return;
        }
        if (tag.length > 60) {
            setTagError("Tags must be under 60 characters each.");
            return;
        }
        if (tags.length >= 10) {
            setTagError("Too many tags (max 10).");
            return;
        }
        if (!tags.includes(tag)) setTags((current) => [...current, tag]);
        setTagInput("");
        setErrors((current) => {
            if (!current.tags) return current;
            const next = { ...current };
            delete next.tags;
            return next;
        });
    };

    const updateHeader = (index, field, value) => {
        setHeaders((current) => current.map((item, i) => i === index ? { ...item, [field]: value } : item));
        setErrors((current) => {
            const next = { ...current };
            delete next[`header-${index}`];
            delete next.headers;
            return next;
        });
    };

    const testConnection = async () => {
        const validation = validate();
        if (hasErrors(validation)) return;
        setTesting(true);
        setTestResult(null);
        try {
            // Live probe against the real endpoint. Nothing is saved or recorded.
            const result = await api.probeMonitor(toCreatePayload({
                ...form,
                name: form.name.trim() || "Probe",
                url: form.url.trim(),
                tags,
                headers,
                requestBody: form.requestBody,
            }));
            setTestResult({ ok: result.success, code: result.statusCode, time: result.responseTimeMs, message: result.message });
        } catch (error) {
            const backendErrors = mapBackendErrors(error.payload);
            if (hasErrors(backendErrors)) {
                const { _form, ...fieldErrors } = backendErrors;
                setErrors((current) => ({ ...current, ...fieldErrors }));
                setFormError(_form || "Fix the highlighted fields before testing.");
            } else {
                setTestResult({ ok: false, code: null, time: null, message: error.message || "Probe failed." });
            }
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setFormError(null);
        const validation = validate();
        if (hasErrors(validation)) {
            setFormError("Fix the highlighted fields before saving.");
            return;
        }
        const payload = {
            ...form,
            name: form.name.trim(),
            url: form.url.trim(),
            expectedStatus: Number(form.expectedStatus),
            threshold: Number(form.threshold),
            tags,
            headers: headers.filter((header) => header.key.trim()),
            requestBody: form.requestBody,
        };
        try {
            setSaving(true);
            const id = await addApi(payload);
            navigate(`/apis/${id}`);
        } catch (error) {
            const backendErrors = mapBackendErrors(error.payload);
            if (hasErrors(backendErrors)) {
                const { _form, ...fieldErrors } = backendErrors;
                setErrors((current) => ({ ...current, ...fieldErrors }));
                setFormError(_form || "The server rejected some fields. Check the highlighted ones.");
            } else {
                setFormError(error.message || "Could not save the monitor.");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="font-headline text-xl md:text-2xl font-semibold text-on-surface mb-1">Add New API Endpoint</h1>
                    <p className="text-on-surface-variant text-sm">Create a live monitor. The scheduler will start health-checking it automatically on its interval.</p>
                </div>
                <form onSubmit={handleSave} noValidate className="bg-surface border border-surface-border rounded-xl p-5 md:p-6 flex flex-col gap-6">
                    <AlertBanner>{formError}</AlertBanner>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="API Name" error={errors.name} htmlFor="api-name">
                            <input id="api-name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g., Orders Service" maxLength={160} aria-invalid={Boolean(errors.name)} className={inputClassName(errors.name)} />
                        </FormField>
                        <FormField label="API URL" error={errors.url} htmlFor="api-url" hint="Must include http:// or https://">
                            <input id="api-url" type="url" value={form.url} onChange={(e) => update("url", e.target.value)} placeholder="https://api.example.com/health" aria-invalid={Boolean(errors.url)} className={`${inputClassName(errors.url)} font-mono`} />
                        </FormField>
                        <FormField label="HTTP Method" error={errors.method} htmlFor="api-method">
                            <select id="api-method" value={form.method} onChange={(e) => update("method", e.target.value)} className={`${selectClasses(errors.method)} font-mono`}>
                                {METHODS.map((item) => <option key={item}>{item}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Environment" error={errors.environment} htmlFor="api-env">
                            <select id="api-env" value={form.environment} onChange={(e) => update("environment", e.target.value)} className={selectClasses(errors.environment)}>
                                {ENVIRONMENTS.map((item) => <option key={item}>{item}</option>)}
                            </select>
                        </FormField>
                    </section>

                    <FormField label="Description (optional)" error={errors.description} htmlFor="api-description">
                        <textarea id="api-description" rows="2" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What does this endpoint do?" maxLength={1024} className={`${inputClassName(errors.description)} resize-y`} />
                    </FormField>

                    <SectionTitle>Health Criteria</SectionTitle>
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Expected Status" error={errors.expectedStatus} htmlFor="api-expected">
                            <input id="api-expected" type="number" min="100" max="599" value={form.expectedStatus} onChange={(e) => update("expectedStatus", e.target.value)} aria-invalid={Boolean(errors.expectedStatus)} className={`${inputClassName(errors.expectedStatus)} font-mono`} />
                        </FormField>
                        <FormField label="Threshold (ms)" error={errors.threshold} htmlFor="api-threshold" hint="Warning above this latency">
                            <input id="api-threshold" type="number" min="50" max="60000" step="50" value={form.threshold} onChange={(e) => update("threshold", e.target.value)} aria-invalid={Boolean(errors.threshold)} className={`${inputClassName(errors.threshold)} font-mono`} />
                        </FormField>
                        <FormField label="Check Interval" error={errors.interval} htmlFor="api-interval">
                            <select id="api-interval" value={form.interval} onChange={(e) => update("interval", e.target.value)} className={selectClasses(errors.interval)}>
                                {INTERVALS.map((item) => <option key={item} value={item}>{item} min{item > 1 ? "s" : ""}</option>)}
                            </select>
                        </FormField>
                    </section>

                    <SectionTitle>Request Setup</SectionTitle>
                    <FormField label="Authentication" error={errors.authType} htmlFor="api-auth">
                        <select id="api-auth" value={form.authType} onChange={(e) => update("authType", e.target.value)} className={selectClasses(errors.authType)}>
                            {AUTH_TYPES.map((item) => <option key={item}>{item}</option>)}
                        </select>
                    </FormField>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-on-surface-variant font-medium">Headers</span>
                            <button type="button" onClick={() => setHeaders((current) => [...current, { key: "", value: "" }])} disabled={headers.length >= 20} className="text-primary text-sm flex items-center gap-1 disabled:opacity-40">
                                <span className="material-symbols-outlined text-base">add</span>Add header
                            </button>
                        </div>
                        {errors.headers && <p className="text-error text-xs flex items-center gap-1" role="alert"><span className="material-symbols-outlined text-sm">error</span>{errors.headers}</p>}
                        {headers.map((header, index) => (
                            <div key={index} className="flex flex-col gap-1">
                                <div className="flex gap-2">
                                    <input value={header.key} onChange={(e) => updateHeader(index, "key", e.target.value)} placeholder="Key" aria-label={`Header ${index + 1} key`} className={`${inputClassName(errors[`header-${index}`])} font-mono w-1/3`} />
                                    <input value={header.value} onChange={(e) => updateHeader(index, "value", e.target.value)} placeholder="Value" aria-label={`Header ${index + 1} value`} className={`${inputClassName(false)} font-mono`} />
                                    <button type="button" aria-label="Remove header" onClick={() => setHeaders((current) => current.filter((_, i) => i !== index))} className="text-on-surface-variant hover:text-error px-2">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                                {errors[`header-${index}`] && <p className="text-error text-xs" role="alert">{errors[`header-${index}`]}</p>}
                            </div>
                        ))}
                    </div>

                    <FormField label="Request Body (JSON, optional)" error={errors.requestBody} htmlFor="api-body">
                        <textarea id="api-body" rows="5" value={form.requestBody} onChange={(e) => update("requestBody", e.target.value)} placeholder={'{\n  "key": "value"\n}'} spellCheck={false} aria-invalid={Boolean(errors.requestBody)} className={`${inputClassName(errors.requestBody)} font-mono text-sm resize-y`} />
                    </FormField>

                    <div className="flex flex-col gap-1.5 text-sm">
                        <span className="text-on-surface-variant font-medium">Tags</span>
                        <div className={`bg-background border rounded p-2 flex flex-wrap gap-2 items-center min-h-11 ${errors.tags ? "border-error" : "border-surface-border"}`}>
                            {tags.map((tag) => (
                                <span key={tag} className="bg-surface-raised text-xs px-2 py-1 rounded border border-surface-border flex items-center gap-1">
                                    {tag}
                                    <button type="button" aria-label={`Remove tag ${tag}`} onClick={() => setTags((current) => current.filter((item) => item !== tag))}>
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </span>
                            ))}
                            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} onBlur={addTag} placeholder="Add tag" maxLength={60} className="bg-transparent outline-none text-sm min-w-24 flex-1" />
                        </div>
                        {(tagError || errors.tags) && <p className="text-error text-xs" role="alert">{tagError || errors.tags}</p>}
                    </div>

                    {testResult && testResult.ok && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-success flex items-center gap-2"><span className="material-symbols-outlined">check_circle</span>Live probe succeeded · {testResult.code} · {testResult.time}ms</div>}
                    {testResult && !testResult.ok && <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error flex items-center gap-2" role="alert"><span className="material-symbols-outlined">error</span>{testResult.code !== null && testResult.code !== undefined ? `Live probe failed · ${testResult.code} · ` : "Live probe failed · "}{testResult.message}</div>}

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-5 border-t border-surface-border">
                        <button type="button" onClick={testConnection} disabled={testing} className="border border-primary text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-soft disabled:opacity-50">
                            {testing ? "Testing…" : "Test connection"}
                        </button>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => { notify("Changes discarded", "error"); navigate("/apis"); }} className="border border-surface-border text-on-surface px-5 py-2 rounded-lg text-sm font-semibold hover:bg-surface-raised">Cancel</button>
                            <button type="submit" disabled={saving} className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                                {saving && <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>}
                                {saving ? "Saving…" : "Save API"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </main>
    );
}

function SectionTitle({ children }) { return <h3 className="font-headline text-lg font-semibold text-on-surface border-t border-surface-border pt-5">{children}</h3>; }

export default AddApi;
