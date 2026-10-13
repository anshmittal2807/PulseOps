import Icon from "./Icon.jsx";
function Spinner({ label = "Loading…" }) {
    return (
        <span className="inline-flex items-center gap-2" role="status" aria-label={label}>
            <Icon name="progress_activity" className="animate-spin text-lg" />
            <span className="text-sm">{label}</span>
        </span>
    );
}

export function LoadingCard({ label = "Loading…" }) {
    return (
        <div className="bg-surface border border-surface-border rounded-xl p-10 flex items-center justify-center text-on-surface-variant">
            <Spinner label={label} />
        </div>
    );
}

export function SkeletonRows({ rows = 4 }) {
    return (
        <div className="bg-surface border border-surface-border rounded-xl p-4 flex flex-col gap-3" aria-hidden="true">
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="h-10 rounded-lg bg-surface-raised animate-pulse" style={{ opacity: 1 - index * 0.15 }} />
            ))}
        </div>
    );
}

export default Spinner;
