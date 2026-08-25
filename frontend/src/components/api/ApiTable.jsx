import StatusBadge from "./StatusBadge.jsx";

function ApiTable({ apis }) {
    return (
        <div className="bg-surface border border-surface-border rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-surface-border bg-background">
                        <th className="px-4 py-3 font-body text-xs font-semibold tracking-wider uppercase text-on-surface-variant">Name</th>
                        <th className="px-4 py-3 font-body text-xs font-semibold tracking-wider uppercase text-on-surface-variant">URL</th>
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
                            className={`border-b border-surface-border last:border-b-0 hover:bg-surface-raised transition-colors ${api.status === "Offline" ? "opacity-50" : ""}`}
                        >
                            <td className="px-4 py-3 font-headline text-[18px] leading-6 font-semibold text-on-surface">{api.name}</td>
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
