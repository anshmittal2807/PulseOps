import StatusBadge from "./StatusBadge.jsx";
import { useNavigate } from "react-router-dom";

function ApiTable({ apis }) {
    const navigate = useNavigate();
    return (
        <div className="bg-surface border border-surface-border rounded-xl overflow-x-auto">
            <table className="w-full min-w-[980px] text-left border-collapse">
                <thead>
                    <tr className="border-b border-surface-border bg-background">
                        <th className="px-5 py-3 font-body text-[11px] font-semibold tracking-wide text-on-surface-variant">Monitor</th>
                        <th className="px-4 py-3 font-body text-[11px] font-semibold tracking-wide text-on-surface-variant">Endpoint</th>
                        <th className="px-4 py-3 w-24 font-body text-xs font-semibold tracking-wider uppercase text-on-surface-variant">Method</th>
                        <th className="px-4 py-3 w-32 font-body text-xs font-semibold tracking-wider uppercase text-on-surface-variant">Status</th>
                        <th className="px-4 py-3 text-right w-32 font-body text-xs font-semibold tracking-wider uppercase text-on-surface-variant">Response</th>
                        <th className="px-4 py-3 w-32 font-body text-xs font-semibold tracking-wider uppercase text-on-surface-variant">Environment</th>
                        <th className="px-4 py-3 text-right w-40 font-body text-xs font-semibold tracking-wider uppercase text-on-surface-variant">Last Checked</th>
                    </tr>
                </thead>
                <tbody className="font-body text-sm">
                    {apis.length === 0 && (
                        <tr>
                            <td colSpan="7" className="px-4 py-8 text-center text-on-surface-variant">
                                No APIs match your filters.
                            </td>
                        </tr>
                    )}
                    {apis.map((api) => (
                        <tr
                            key={api.id}
                            onClick={() => navigate(`/apis/${api.id}`)}
                            tabIndex="0"
                            onKeyDown={(event) => { if (event.key === "Enter") navigate(`/apis/${api.id}`); }}
                            className={`border-b border-surface-border last:border-b-0 hover:bg-surface-raised transition-colors cursor-pointer focus:outline-none focus:bg-surface-raised ${api.status === "Offline" ? "opacity-60" : ""}`}
                        >
                            <td className="px-5 py-4 font-body text-sm font-semibold text-on-surface">
                                <div className="flex items-center gap-2">{api.name}{api.paused && <span className="text-[10px] uppercase font-body tracking-wider text-warning border border-warning/30 rounded px-1.5">Paused</span>}</div>
                            </td>
                            <td className="px-4 py-3 font-mono text-sm text-on-surface-variant">{api.url}</td>
                            <td className={`px-4 py-3 font-mono text-sm ${api.method === "POST" ? "text-secondary" : "text-tertiary-container"}`}>
                                {api.method}
                            </td>
                            <td className="px-4 py-3">
                                <StatusBadge status={api.status} />
                            </td>
                            <td className="px-4 py-3 font-mono text-sm text-right">
                                <span
                                    className={
                                        api.status === "Critical"
                                            ? "text-error"
                                            : api.status === "Warning"
                                                ? "text-tertiary-fixed-dim"
                                                : ""
                                    }
                                >
                                    {api.responseTime}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-on-surface-variant">{api.environment}</td>
                            <td className="px-4 py-3 font-mono text-sm text-on-surface-variant text-right">{api.lastChecked}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ApiTable;
