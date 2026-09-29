import { useDemo } from "../context/DemoContext.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import SyncBanner from "../components/ui/SyncBanner.jsx";
import { SkeletonRows } from "../components/ui/Spinner.jsx";

function ActivityLog() {
    const { activity: activityEntries, syncing } = useDemo();
    return (
        <main className="flex-1 p-6 overflow-y-auto w-full max-w-5xl mx-auto">
            <div className="mb-8">
                <h2 className="font-headline text-2xl font-semibold text-on-surface mb-2">Activity Log</h2>
                <p className="font-body text-on-surface-variant">System events and configuration changes.</p>
            </div>

            <SyncBanner />

            {syncing && activityEntries.length === 0 ? (
                <SkeletonRows rows={4} />
            ) : activityEntries.length === 0 ? (
                <EmptyState
                    icon="history"
                    title="No activity yet"
                    hint="Monitor changes, health checks and alerts will be recorded here."
                />
            ) : (
            /* Feed container */
            <div className="bg-surface border border-surface-border rounded-lg overflow-hidden flex flex-col">
                {activityEntries.map((entry) => (
                    <div
                        key={entry.id}
                        className="flex items-start gap-4 p-5 border-b border-surface-border hover:bg-surface-raised transition-colors duration-150"
                    >
                        <div className="w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center border border-surface-border shrink-0 mt-1">
                            <span className={`material-symbols-outlined ${entry.tone} text-sm`}>{entry.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2 mb-1">
                                <span className={`text-xs font-semibold tracking-wider uppercase ${entry.tone}`}>
                                    {entry.category}
                                </span>
                                <span className="font-mono text-on-surface-variant shrink-0">{entry.timestamp}</span>
                            </div>
                            <p className="font-body text-on-surface mb-1 truncate">{entry.message}</p>
                            <span className="font-mono text-on-surface-variant bg-background px-2 py-0.5 rounded border border-surface-border">
                                {entry.detail}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            )}
        </main>
    );
}

export default ActivityLog;
