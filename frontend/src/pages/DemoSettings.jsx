import Icon from "../components/ui/Icon.jsx";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useDemo } from "../context/DemoContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { mapBackendErrors, validateName } from "../utils/validators.js";
import { inputClassName } from "../utils/formClasses.js";
import FormField from "../components/ui/FormField.jsx";
import AlertBanner from "../components/ui/AlertBanner.jsx";

const SETTINGS_KEY = "pulseops-preferences";

function DemoSettings() {
    const { pathname } = useLocation();
    const { notify, backendMode } = useDemo();
    const { user, updateProfile } = useAuth();
    const isProfile = pathname === "/profile";
    const [profile, setProfile] = useState({
        name: user?.name || "",
        email: user?.email || "",
        role: user?.role || "",
    });
    const [profileError, setProfileError] = useState(null);
    const [formError, setFormError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState(loadPreferences);

    const updateName = (value) => {
        setProfile((current) => ({ ...current, name: value }));
        setProfileError(null);
    };

    const save = async (event) => {
        event.preventDefault();
        setFormError(null);
        if (isProfile) {
            // Profile changes go to the account API; display preferences below
            // are browser-local and do not change the monitoring scheduler.
            const nameError = validateName(profile.name, "Display name");
            if (nameError) {
                setProfileError(nameError);
                return;
            }
            if (backendMode) {
                setSaving(true);
                try {
                    await updateProfile(profile.name.trim());
                    notify("Profile updated");
                } catch (error) {
                    const backendErrors = mapBackendErrors(error.payload);
                    setProfileError(backendErrors.name || error.message || "Could not update profile.");
                } finally {
                    setSaving(false);
                }
            } else {
                setFormError("You are signed out. Sign in again to update your profile.");
            }
        } else {
            try {
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            } catch {
                setFormError("Browser storage is unavailable, so preferences could not be saved.");
                return;
            }
            notify("Preferences saved (local to this browser)");
        }
    };

    return (
        <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
                <h1 className="font-headline text-2xl font-semibold mb-1">{isProfile ? "Profile" : "Settings"}</h1>
                <p className="text-sm text-on-surface-variant mb-6">
                    {isProfile
                        ? "Your account information."
                        : "Local display preferences. Monitoring runs on the backend on a schedule."}
                </p>
                {!isProfile && (
                    <div className="mb-4 rounded-lg border border-primary/30 bg-primary-soft px-4 py-3 text-sm text-on-surface flex items-center gap-2">
                        <Icon name="cloud_done" className="text-primary" />
                        Monitors, checks, alerts and activity are recorded automatically per account.
                    </div>
                )}
                <form onSubmit={save} noValidate className="bg-surface border border-surface-border rounded-xl p-6 flex flex-col gap-5">
                    <AlertBanner>{formError}</AlertBanner>
                    {isProfile ? <>
                        <FormField label="Display name" error={profileError} htmlFor="profile-name">
                            <input
                                id="profile-name"
                                value={profile.name}
                                onChange={(e) => updateName(e.target.value)}
                                maxLength={120}
                                aria-invalid={Boolean(profileError)}
                                className={inputClassName(profileError)}
                            />
                        </FormField>
                        <Field label="Email address (cannot be changed)"><input type="email" className={`${fieldClass} opacity-60`} value={profile.email} disabled /></Field>
                        <Field label="Role"><input className={`${fieldClass} opacity-60`} value={profile.role} disabled /></Field>
                    </> : <>
                        <Toggle label="Email alerts" description="Remember whether email notifications should be enabled when a delivery provider is connected." checked={settings.emailAlerts} onChange={(value) => setSettings({ ...settings, emailAlerts: value })} />
                        <Toggle label="Desktop alerts" description="Remember your desktop notification preference for this browser." checked={settings.desktopAlerts} onChange={(value) => setSettings({ ...settings, desktopAlerts: value })} />
                        <Field label="Timezone"><select className={fieldClass} value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}>{TIMEZONES.map((tz) => <option key={tz}>{tz}</option>)}</select></Field>
                        <Field label="Log retention"><select className={fieldClass} value={settings.retention} onChange={(e) => setSettings({ ...settings, retention: e.target.value })}><option>7 days</option><option>30 days</option><option>90 days</option></select></Field>
                    </>}
                    <div className="flex justify-end items-center pt-5 border-t border-surface-border">
                        <button type="submit" disabled={saving} className="bg-primary text-white rounded px-5 py-2 text-sm font-semibold ml-auto hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                            {saving && <Icon name="progress_activity" className="animate-spin text-base" />}
                            {saving ? "Saving…" : "Save changes"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

const fieldClass = "w-full bg-background border border-surface-border rounded px-3 py-2 text-on-surface focus:border-primary outline-none";

const TIMEZONES = ["Asia/Kolkata", "UTC", "America/New_York"];

function browserTimezone() {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz) {
            if (!TIMEZONES.includes(tz)) TIMEZONES.unshift(tz);
            return tz;
        }
    } catch { /* ignore */ }
    return "UTC";
}

function loadPreferences() {
    // Merge saved values with defaults so older browser settings still work
    // when a new preference is added later.
    const defaults = { emailAlerts: true, desktopAlerts: false, timezone: browserTimezone(), retention: "30 days" };
    try {
        const stored = JSON.parse(localStorage.getItem(SETTINGS_KEY));
        return stored && typeof stored === "object" ? { ...defaults, ...stored } : defaults;
    } catch {
        return defaults;
    }
}

function Field({ label, children }) { return <label className="text-sm text-on-surface-variant flex flex-col gap-2">{label}{children}</label>; }
function Toggle({ label, description, checked, onChange }) { return <label className="flex items-center justify-between gap-4 py-2"><span><span className="block text-on-surface font-medium">{label}</span><span className="block text-sm text-on-surface-variant">{description}</span></span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-5 h-5 accent-primary" /></label>; }

export default DemoSettings;
