import Icon from "./Icon.jsx";
import { useState } from "react";

function PasswordInput({ id, value, onChange, placeholder = "••••••••", autoComplete = "current-password", className = "", onBlur }) {
    const [visible, setVisible] = useState(false);
    return (
        <span className="relative block">
            <input
                id={id}
                type={visible ? "text" : "password"}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                autoComplete={autoComplete}
                minLength={7}
                maxLength={24}
                required
                className={`${className} pr-11`}
            />
            <button
                type="button"
                onClick={() => setVisible((shown) => !shown)}
                aria-label={visible ? "Hide password" : "Show password"}
                title={visible ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md text-on-surface-variant hover:text-primary hover:bg-primary-soft flex items-center justify-center transition-colors"
            >
                <Icon name={visible ? "visibility_off" : "visibility"} className="text-xl" />
            </button>
        </span>
    );
}

export default PasswordInput;
