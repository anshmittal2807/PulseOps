import Icon from "../components/ui/Icon.jsx";
import { useNavigate } from "react-router-dom";
import { useDemo } from "../context/DemoContext.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import SyncBanner from "../components/ui/SyncBanner.jsx";
import { SkeletonRows } from "../components/ui/Spinner.jsx";

const severityStyles = {
    critical: { bar: "bg-error", badge: "text-white bg-error border-error", dot: "bg-white" },
    warning: { bar: "bg-warning", badge: "text-white bg-warning border-warning", dot: "bg-white" },
    recovered: { bar: "bg-success", badge: "text-white bg-success border-success", dot: "bg-white" },
};

function AlertRow({ alert, onMarkRead, onOpen }) {
    const styles = severityStyles[alert.severity] || severityStyles.critical;

    return (
        <div className={`grid grid-cols-12 gap-4 px-5 py-4 border-b border-surface-border hover:bg-surface-raised transition-colors items-start relative group ${alert.unread ? "" : "opacity-60"}`}>
            {alert.unread && <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.bar}`}></div>}
            <div className="col-span-3 flex items-center gap-2 pl-2">
                <Icon name={alert.icon} className="text-on-surface-variant text-sm" />
                <button type="button" onClick={() => onOpen(alert.apiId)} className="font-body text-on-surface font-medium truncate hover:text-primary text-left">{alert.service}</button>
            </div>
            <div className="col-span-2 flex items-center">
                <span className={`px-2 py-0.5 rounded text-xs font-mono border inline-flex items-center gap-1 ${styles.badge}`}>
                    <span className={`w-2 h-2 rounded-full ${styles.dot}`}></span>
                    {alert.type}
                </span>
            </div>
            <div className="col-span-4">
                <code className="font-mono text-on-surface-variant bg-background px-2 py-1 rounded border border-surface-border block truncate" title={alert.message}>
                    {alert.message}
                </code>
            </div>
            <div className="col-span-2 flex items-center justify-end">
                <span className="font-mono text-on-surface-variant whitespace-nowrap text-right">{alert.timestamp}</span>
            </div>
            <div className="col-span-1 flex items-center justify-end">
                {alert.unread ? (
                    <button
                        type="button"
                        onClick={() => onMarkRead(alert.id)}
                        title="Mark as read"
                        className="text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <Icon name="check_circle" className="text-lg" />
                    </button>
                ) : (
                    <Icon name="done_all" className="text-slate-400 text-lg" />
                )}
            </div>
        </div>
    );
}

function Alerts() {
    const navigate = useNavigate();
    const { alerts: items, markAlertRead, markAllAlertsRead, syncing } = useDemo();
    const unread = items.filter((alert) => alert.unread).length;

    return (
        <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
                <SyncBanner />
                <header className="mb-4 flex items-center justify-between">
                    <div><h2 className="font-headline text-2xl font-semibold text-on-surface">Alert history</h2><p className="text-sm text-on-surface-variant mt-1">{unread} unread notification{unread === 1 ? "" : "s"}</p></div>
                    <button type="button" onClick={markAllAlertsRead} disabled={unread === 0} className="border border-surface-border rounded px-4 py-2 text-sm text-on-surface hover:bg-surface-raised disabled:opacity-40">Mark all read</button>
                </header>
                {syncing && items.length === 0 ? (
                    <SkeletonRows rows={3} />
                ) : items.length === 0 ? (
                    <EmptyState
                        icon="notifications_off"
                        title="All clear — no alerts"
                        hint="When a monitor breaches its threshold or goes down, the incident will appear here."
                        actionLabel="View monitors"
                        actionTo="/apis"
                    />
                ) : (
                <div className="bg-surface border border-surface-border rounded-lg flex flex-col w-full overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-surface-border bg-surface">
                        <div className="col-span-3 text-xs font-semibold tracking-wider uppercase text-on-surface-variant">Service</div>
                        <div className="col-span-2 text-xs font-semibold tracking-wider uppercase text-on-surface-variant">Type</div>
                        <div className="col-span-4 text-xs font-semibold tracking-wider uppercase text-on-surface-variant">Message</div>
                        <div className="col-span-2 text-xs font-semibold tracking-wider uppercase text-on-surface-variant text-right">Timestamp</div>
                        <div className="col-span-1 text-xs font-semibold tracking-wider uppercase text-on-surface-variant text-right">Action</div>
                    </div>
                    {items.map((alert) => (
                        <AlertRow key={alert.id} alert={alert} onMarkRead={markAlertRead} onOpen={(id) => navigate(`/apis/${id}`)} />
                    ))}
                </div>
                )}
            </div>
        </main>
    );
}

export default Alerts;
