import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StatusBadge from "../components/api/StatusBadge.jsx";
import ApiLogsTable from "../components/api/ApiLogsTable.jsx";
import { useDemo } from "../context/DemoContext.jsx";

function ApiDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { apis, runCheck, togglePaused, deleteApi, fetchApiDetails, syncing } = useDemo();
    const [checking, setChecking] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const api = apis.find((item) => String(item.id) === id);

    useEffect(() => {
        // Pull the last 50 recorded checks for this monitor.
        const cached = apis.find((item) => String(item.id) === id);
        if (cached && cached.logs && cached.logs.length > 0) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- async detail fetch on mount
        setLoadingDetail(true);
        fetchApiDetails(id).catch(() => {}).finally(() => setLoadingDetail(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [syncing, id]);

    if (!api) return <main className="flex-1 p-10 text-center"><h1 className="text-2xl font-headline mb-3">Monitor not found</h1><button className="text-primary" onClick={() => navigate("/apis")}>Return to all APIs</button></main>;

    const handleCheck = async () => {
        setChecking(true);
        try {
            await runCheck(api.id);
        } catch {
            /* toast already shown by context */
        } finally {
            setChecking(false);
        }
    };
    const handleDelete = async () => {
        try {
            await deleteApi(api.id);
        } catch { /* toast already shown */ }
        navigate("/apis");
    };
    const handleToggle = async () => {
        try {
            await togglePaused(api.id);
        } catch { /* toast already shown */ }
    };

    return (
        <main className="flex-1 flex flex-col min-w-0 p-6">
            <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                    <div className="flex flex-col gap-2">
                        <button type="button" onClick={() => navigate("/apis")} className="text-on-surface-variant hover:text-primary text-sm flex items-center gap-1 self-start"><span className="material-symbols-outlined text-base">arrow_back</span>All APIs</button>
                        <div className="flex items-center gap-3"><h1 className="font-headline text-2xl font-semibold text-on-surface">{api.name}</h1><StatusBadge status={api.status} />{api.paused && <span className="text-warning text-xs uppercase tracking-wider border border-warning/30 rounded px-2 py-1">Paused</span>}</div>
                        <div className="flex items-center gap-2 text-on-surface-variant font-mono text-sm"><span className="material-symbols-outlined text-base">link</span><span>{api.url}</span></div>
                        {api.description && <p className="text-sm text-on-surface-variant max-w-2xl">{api.description}</p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => navigate(`/apis/${api.id}/edit`)} className="border border-surface-border rounded px-4 py-2 text-sm hover:bg-surface-raised flex items-center gap-2"><span className="material-symbols-outlined text-lg">edit</span>Edit</button>
                        <button type="button" onClick={handleToggle} className="border border-surface-border rounded px-4 py-2 text-sm hover:bg-surface-raised flex items-center gap-2"><span className="material-symbols-outlined text-lg">{api.paused ? "play_arrow" : "pause"}</span>{api.paused ? "Resume" : "Pause"}</button>
                        <button type="button" onClick={handleCheck} disabled={checking || api.paused} className="bg-primary text-white rounded px-4 py-2 text-sm font-semibold disabled:opacity-40 flex items-center gap-2 hover:bg-blue-700"><span className={`material-symbols-outlined text-lg ${checking ? "animate-spin" : ""}`}>{checking ? "progress_activity" : "play_circle"}</span>{checking ? "Running…" : "Run live check"}</button>
                        <button type="button" onClick={() => setConfirmingDelete(true)} className="border border-error/40 text-error rounded px-3 py-2 hover:bg-error/10" aria-label="Delete API"><span className="material-symbols-outlined text-lg">delete</span></button>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Metric label="Average Response" value={api.averageResponseTime ? `${api.averageResponseTime}ms` : "—"} />
                    <Metric label="Success Rate" value={`${api.successRate}%`} accent />
                    <Metric label="Expected Status" value={api.expectedStatus} />
                    <Metric label="Check Interval" value={`${api.interval} min`} />
                </div>

                <Panel title={`Recent Checks (${api.logs.length})`}>
                    {loadingDetail
                        ? <div className="p-8 text-center text-on-surface-variant">Loading live checks…</div>
                        : <><ApiLogsTable logs={api.logs} />{api.logs.length === 0 && <div className="p-8 text-center text-on-surface-variant">No checks recorded yet. Run a check above, or wait for the next scheduled run.</div>}</>}
                </Panel>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ListPanel title="Error History" items={api.errorHistory} empty="No errors recorded." render={(item) => <><span className="text-on-surface-variant">{item.timestamp}</span><span className="text-error">{item.message}</span></>} />
                    <ListPanel title="Downtime History" items={api.downtimeHistory} empty="No downtime recorded." render={(item) => <><span className="text-on-surface">{item.range}</span><span className="ml-auto text-on-surface-variant">{item.duration}</span></>} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Panel title="Configuration"><div className="p-4 grid grid-cols-2 gap-4 text-sm"><Config label="Method" value={api.method} /><Config label="Environment" value={api.environment} /><Config label="Threshold" value={`${api.threshold}ms`} /><Config label="Authentication" value={api.authType} /></div></Panel>
                    <Panel title="Headers"><div className="p-4 bg-background font-mono text-sm min-h-32">{api.headers.length ? api.headers.map((header) => <div key={header.key}><span className="text-secondary">{header.key}</span>: <span className="text-primary">{header.value}</span></div>) : <span className="text-on-surface-variant">No custom headers</span>}</div></Panel>
                </div>
                {api.requestBody && <Panel title="Request Body"><pre className="p-4 bg-background font-mono text-sm whitespace-pre-wrap overflow-x-auto">{api.requestBody}</pre></Panel>}
            </div>

            {confirmingDelete && <div className="fixed inset-0 z-[90] bg-black/70 flex items-center justify-center p-4" onMouseDown={() => setConfirmingDelete(false)}><div className="bg-surface border border-surface-border rounded-xl p-6 max-w-md w-full shadow-2xl" onMouseDown={(e) => e.stopPropagation()}><h2 className="font-headline text-xl font-semibold mb-2">Remove {api.name}?</h2><p className="text-on-surface-variant text-sm mb-6">This permanently deletes the monitor and its recorded check history.</p><div className="flex justify-end gap-3"><button type="button" onClick={() => setConfirmingDelete(false)} className="border border-surface-border rounded px-4 py-2 text-sm">Cancel</button><button type="button" onClick={handleDelete} className="bg-error text-surface rounded px-4 py-2 text-sm font-semibold">Remove API</button></div></div></div>}
        </main>
    );
}

function Metric({ label, value, accent }) { return <div className="bg-surface border border-surface-border rounded-[10px] p-5"><h3 className="text-sm text-on-surface-variant mb-3">{label}</h3><div className={`font-mono text-2xl ${accent ? "text-primary" : "text-on-surface"}`}>{value}</div></div>; }
function Panel({ title, children }) { return <div className="bg-surface border border-surface-border rounded-[10px] overflow-hidden"><div className="p-4 border-b border-surface-border"><h3 className="font-headline text-lg font-semibold">{title}</h3></div>{children}</div>; }
function Config({ label, value }) { return <div><div className="text-on-surface-variant text-xs uppercase tracking-wider mb-1">{label}</div><div className="font-mono">{value}</div></div>; }
function ListPanel({ title, items, empty, render }) { return <Panel title={title}><div className="p-4">{items.length ? <ul className="flex flex-col gap-3 font-mono text-xs">{items.map((item) => <li key={item.id} className="flex gap-4 border-b border-surface-border pb-3 last:border-0 last:pb-0">{render(item)}</li>)}</ul> : <p className="text-sm text-on-surface-variant">{empty}</p>}</div></Panel>; }

export default ApiDetails;
