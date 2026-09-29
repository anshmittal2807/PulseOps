function StatCard({ title, value, suffix, variant, icon, detail }) {
    const variantClasses = {
        healthy: "pulse-pip healthy",
        offline: "pulse-pip offline",
    };
    const valueClasses = {
        healthy: "text-success",
        offline: "text-error",
    };
    const pipClass = variantClasses[variant] || "";
    const valueClass = valueClasses[variant] || "text-on-surface";

    return (
        <div className="bg-surface border border-surface-border rounded-xl p-4 md:p-5 flex flex-col min-h-[132px] relative shadow-sm">
            <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-medium text-on-surface-variant">{title}</span>
                {icon && <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{icon}</span>}
                {!icon && pipClass && <span className={`${pipClass} w-2 h-2 rounded-full`}></span>}
            </div>
            <div className="mt-auto flex items-end justify-between gap-3">
                <span className={`font-mono text-[28px] leading-none tracking-[-0.04em] ${valueClass}`}>
                    {value}{suffix && <span className="text-sm tracking-normal text-on-surface-variant ml-1.5">{suffix}</span>}
                </span>
                {detail && <span className="text-[11px] text-on-surface-variant text-right leading-4">{detail}</span>}
            </div>
        </div>
    );
}

export default StatCard;
