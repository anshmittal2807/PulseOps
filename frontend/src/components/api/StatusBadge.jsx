const statusStyles = {
    Healthy: { badge: "bg-success border-success", pulse: true },
    Warning: { badge: "bg-warning border-warning", pulse: false },
    Critical: { badge: "bg-error border-error", pulse: false },
    Offline: { badge: "bg-offline border-offline", pulse: false },
};

function StatusBadge({ status }) {
    const styles = statusStyles[status] || statusStyles.Offline;

    return (
        <div className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-white ${styles.badge}`}>
            <div className={`w-1.5 h-1.5 rounded-full bg-white ${styles.pulse ? "status-pulse" : ""}`}></div>
            <span className="text-xs font-medium">{status}</span>
        </div>
    );
}

export default StatusBadge;
