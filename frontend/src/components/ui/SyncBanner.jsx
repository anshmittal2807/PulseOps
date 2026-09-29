import { useDemo } from "../../context/DemoContext.jsx";

function SyncBanner() {
    const { backendMode, syncing, syncError, refresh } = useDemo();
    if (!backendMode || (!syncError && !syncing)) return null;
    if (syncing && !syncError) {
        return (
            <div className="mb-4 rounded-lg border border-surface-border bg-surface px-4 py-2.5 text-sm text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                Syncing with backend…
            </div>
        );
    }
    return (
        <div className="mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error flex items-center gap-3" role="alert">
            <span className="material-symbols-outlined">cloud_off</span>
            <span className="flex-1">Could not reach the backend ({syncError}). Showing last known data.</span>
            <button
                type="button"
                onClick={refresh}
                className="shrink-0 border border-error/40 rounded px-3 py-1.5 text-xs font-semibold hover:bg-error/10"
            >
                Retry
            </button>
        </div>
    );
}

export default SyncBanner;
