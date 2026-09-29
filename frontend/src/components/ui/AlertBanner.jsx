const tones = {
    error: "border-error/30 bg-error/10 text-error",
    success: "border-emerald-200 bg-emerald-50 text-success",
    info: "border-primary/30 bg-primary-soft text-on-surface",
};

const icons = {
    error: "error",
    success: "check_circle",
    info: "info",
};

function AlertBanner({ tone = "error", children }) {
    if (!children) return null;
    return (
        <div className={`rounded-lg border px-4 py-3 text-sm flex items-start gap-2 ${tones[tone] || tones.info}`} role="alert">
            <span className="material-symbols-outlined text-lg leading-5 shrink-0">{icons[tone] || icons.info}</span>
            <span className="min-w-0">{children}</span>
        </div>
    );
}

export default AlertBanner;
