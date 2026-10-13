import Icon from "./Icon.jsx";
function FormField({ label, error, hint, htmlFor, children }) {
    return (
        <div className="flex flex-col gap-1.5 text-sm">
            {label && (
                <label htmlFor={htmlFor} className="text-on-surface-variant font-medium">
                    {label}
                </label>
            )}
            {children}
            {error ? (
                <p className="text-error text-xs flex items-center gap-1" role="alert">
                    <Icon name="error" className="text-sm" />
                    {error}
                </p>
            ) : hint ? (
                <p className="text-on-surface-variant/70 text-xs">{hint}</p>
            ) : null}
        </div>
    );
}

export default FormField;
