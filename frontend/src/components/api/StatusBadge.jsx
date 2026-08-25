const statusStyles = {
    Healthy: { dot: "bg-success", text: "text-success", pulse: true },
    Warning: { dot: "bg-warning", text: "text-warning", pulse: false },
    Critical: { dot: "bg-error", text: "text-error", pulse: false },
    Offline: { dot: "bg-offline", text: "text-offline", pulse: false },
};

function StatusBadge({ status }) {
    const styles = statusStyles[status] || statusStyles.Offline;

    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${styles.dot} ${styles.pulse ? "status-pulse" : ""}`}></div>
            <span className={`${styles.text} font-semibold`}>{status}</span>
        </div>
    );
}

export default StatusBadge;
