function RecentChecksTable({ checks }) {
    const rows = checks || [];

    if (rows.length === 0) {
        return (
            <div className="bg-surface border border-surface-border rounded-xl overflow-hidden h-full">
                <div className="px-5 py-4 border-b border-surface-border">
                    <h3 className="font-headline text-base font-semibold text-on-surface">Recent checks</h3>
                    <p className="text-xs text-on-surface-variant mt-1">Latest recorded results</p>
                </div>
                <p className="p-8 text-center text-sm text-on-surface-variant">No checks recorded yet. They appear here automatically once monitors are probed.</p>
            </div>
        );
    }

    return (
        <div className="bg-surface border border-surface-border rounded-xl overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-surface-border">
                <h3 className="font-headline text-base font-semibold text-on-surface">Recent checks</h3>
                <p className="text-xs text-on-surface-variant mt-1">Latest result from each monitor</p>
            </div>
            <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-surface-border bg-background">
                            <th className="py-2.5 px-5 text-[11px] font-semibold tracking-wide text-on-surface-variant">Service</th>
                            <th className="py-2.5 px-5 text-[11px] font-semibold tracking-wide text-on-surface-variant text-right">Status</th>
                            <th className="py-2.5 px-5 text-[11px] font-semibold tracking-wide text-on-surface-variant text-right">Latency</th>
                            <th className="py-2.5 px-5 text-[11px] font-semibold tracking-wide text-on-surface-variant text-right">Last checked</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-sm">
                        {rows.map((row) => {
                            const isError = row.statusCode >= 400 || row.responseTime === "timeout";
                            return (
                                <tr key={row.name} className="border-b border-surface-border hover:bg-surface-raised transition-colors">
                                    <td className="py-3.5 px-5 text-on-surface font-body text-sm font-medium">{row.name}</td>
                                    <td className={`py-3.5 px-5 text-right ${isError ? "text-error" : "text-on-surface"}`}>{row.statusCode || "—"}</td>
                                    <td className={`py-3 px-5 text-right ${row.responseTime === "timeout" ? "text-error" : "text-on-surface"}`}>{row.responseTime}</td>
                                    <td className="py-3 px-5 text-right text-on-surface-variant text-xs">{row.checked}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default RecentChecksTable;
