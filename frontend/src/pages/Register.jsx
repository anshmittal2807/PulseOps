import Icon from "../components/ui/Icon.jsx";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { passwordChecks, validateRegisterForm } from "../utils/validators.js";
import { AuthInputClassName } from "../utils/formClasses.js";
import FormField from "../components/ui/FormField.jsx";
import AlertBanner from "../components/ui/AlertBanner.jsx";
import PasswordInput from "../components/ui/PasswordInput.jsx";

function Register() {
    const navigate = useNavigate();
    const { register, authLoading } = useAuth();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState(null);
    const [touchedPassword, setTouchedPassword] = useState(false);

    const checks = passwordChecks(form.password);

    const update = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
        setErrors((current) => {
            if (!current[field]) return current;
            const next = { ...current };
            delete next[field];
            return next;
        });
    };

    const submit = async (event) => {
        event.preventDefault();
        setFormError(null);
        const validation = validateRegisterForm(form);
        setErrors(validation);
        setTouchedPassword(true);
        if (Object.keys(validation).length > 0) return;
        try {
            await register(form.name.trim(), form.email.trim(), form.password);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            if (err.status === 409) {
                setErrors((current) => ({ ...current, email: "An account with this email already exists. Try signing in." }));
            } else if (err.payload && err.payload.errors) {
                const mapped = {};
                for (const [key, message] of Object.entries(err.payload.errors)) {
                    if (["name", "email", "password"].includes(key)) mapped[key] = message;
                }
                if (Object.keys(mapped).length > 0) setErrors((current) => ({ ...current, ...mapped }));
                else setFormError(err.message);
            } else {
                setFormError(`${err.message || "Registration failed."} Is the backend running on :8080?`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <span className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white">
                        <Icon name="monitor_heart" className="text-2xl" />
                    </span>
                    <div>
                        <h1 className="font-headline text-xl font-semibold text-on-surface leading-6">PulseOps</h1>
                        <p className="text-xs text-on-surface-variant">API observability</p>
                    </div>
                </div>
                <form onSubmit={submit} noValidate className="bg-surface border border-surface-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col gap-4">
                    <div>
                        <h2 className="font-headline text-xl font-semibold text-on-surface">Create your account</h2>
                        <p className="text-sm text-on-surface-variant mt-1">A fresh workspace with demo monitors is set up instantly.</p>
                    </div>
                    <AlertBanner>{formError}</AlertBanner>
                    <FormField label="Username" error={errors.name} htmlFor="register-name">
                        <input
                            id="register-name"
                            autoComplete="username"
                            minLength={3}
                            maxLength={30}
                            required
                            value={form.name}
                            onChange={(e) => update("name", e.target.value)}
                            placeholder="ansh.mittal"
                            aria-invalid={Boolean(errors.name)}
                            className={AuthInputClassName(errors.name)}
                        />
                    </FormField>
                    <FormField label="Email address" error={errors.email} htmlFor="register-email">
                        <input
                            id="register-email"
                            type="email"
                            autoComplete="email"
                            maxLength={190}
                            required
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                            placeholder="you@company.com"
                            aria-invalid={Boolean(errors.email)}
                            className={AuthInputClassName(errors.email)}
                        />
                    </FormField>
                    <div>
                        <FormField label="Password" error={errors.password} htmlFor="register-password">
                            <PasswordInput
                                id="register-password"
                                value={form.password}
                                onChange={(e) => update("password", e.target.value)}
                                onBlur={() => setTouchedPassword(true)}
                                autoComplete="new-password"
                                placeholder="7 to 24 characters"
                                className={AuthInputClassName(errors.password)}
                            />
                        </FormField>
                        {(touchedPassword || form.password) && (
                            <ul className="mt-2 flex flex-col gap-1">
                                {checks.map((check) => (
                                    <li key={check.label} className={`text-xs flex items-center gap-1.5 ${check.ok ? "text-success" : "text-on-surface-variant"}`}>
                                        <Icon name={check.ok ? "check_circle" : "radio_button_unchecked"} className="text-sm" />
                                        {check.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-11 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                        {authLoading && <Icon name="progress_activity" className="animate-spin text-lg" />}
                        {authLoading ? "Creating account…" : "Create account"}
                    </button>
                    <p className="text-sm text-on-surface-variant text-center">
                        Already have an account?{" "}
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Register;
