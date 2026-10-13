import Icon from "../components/ui/Icon.jsx";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { validateLoginForm } from "../utils/validators.js";
import { AuthInputClassName } from "../utils/formClasses.js";
import FormField from "../components/ui/FormField.jsx";
import AlertBanner from "../components/ui/AlertBanner.jsx";
import PasswordInput from "../components/ui/PasswordInput.jsx";

function Login() {
    const navigate = useNavigate();
    const { login, authLoading } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState(null);

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
        const validation = validateLoginForm(form);
        setErrors(validation);
        if (Object.keys(validation).length > 0) return;
        try {
            await login(form.email.trim(), form.password);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            if (err.status === 401) {
                setFormError("Invalid email or password. Try again or create a new account.");
            } else if (err.payload && err.payload.errors) {
                const mapped = {};
                if (err.payload.errors.email) mapped.email = err.payload.errors.email;
                if (err.payload.errors.password) mapped.password = err.payload.errors.password;
                if (Object.keys(mapped).length > 0) setErrors(mapped);
                else setFormError(err.message);
            } else {
                setFormError(`${err.message || "Login failed."} Is the backend running on :8080?`);
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
                        <h2 className="font-headline text-xl font-semibold text-on-surface">Welcome back</h2>
                        <p className="text-sm text-on-surface-variant mt-1">Sign in to your monitoring workspace.</p>
                    </div>
                    <AlertBanner>{formError}</AlertBanner>
                    <FormField label="Email address" error={errors.email} htmlFor="login-email">
                        <input
                            id="login-email"
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
                    <FormField label="Password" error={errors.password} htmlFor="login-password">
                        <PasswordInput
                            id="login-password"
                            value={form.password}
                            onChange={(e) => update("password", e.target.value)}
                            placeholder="7 to 24 characters"
                            className={AuthInputClassName(errors.password)}
                        />
                    </FormField>
                    <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full h-11 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                        {authLoading && <Icon name="progress_activity" className="animate-spin text-lg" />}
                        {authLoading ? "Signing in…" : "Sign in"}
                    </button>
                    <p className="text-sm text-on-surface-variant text-center">
                        No account yet?{" "}
                        <Link to="/register" className="text-primary font-semibold hover:underline">
                            Create one
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

export default Login;
