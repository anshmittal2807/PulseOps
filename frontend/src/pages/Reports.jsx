import { useEffect, useState } from "react";
import { api } from "../service/apiClient.js";
import { useDemo } from "../context/DemoContext.jsx";
import SyncBanner from "../components/ui/SyncBanner.jsx";
import AlertBanner from "../components/ui/AlertBanner.jsx";

const periods = ["Today", "Weekly", "Monthly"];

function Reports() {
    const [period, setPeriod] = useState("Weekly");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { notify } = useDemo();

    useEffect(() => {
        let active = true;
        api.report(period.toLowerCase())
            .then((result) => {
                if (!active) return;
                setReport(result);
                setError(null);
            })
            .catch((requestError) => {
                if (active) setError(requestError.message || "Could not load report data.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => { active = false; };
    }, [period]);

    const choosePeriod = (next) => {
        if (next === period) return;
        setLoading(true);
        setPeriod(next);
    };

    const summaries = report?.monitors || [];
    const hasChecks = (report?.totalChecks || 0) > 0;
    const dynamicStats = [
        { label: "Uptime", value: hasChecks ? `${report.uptime.toFixed(2)}%` : "—", valueClass: "text-primary" },
        { label: "Failed checks", value: String(report?.failedChecks || 0), valueClass: "text-on-surface" },
        { label: "Average time", value: hasChecks ? `${report.averageResponseTimeMs}ms` : "—", valueClass: "text-on-surface" },
        { label: "Est. downtime", value: `${report?.estimatedDowntimeMinutes || 0} min`, valueClass: "text-on-surface" },
    ];

    const exportReport = () => {
        if (!report) return;
        const rows = [
            ["Monitor", "URL", "Current status", "Checks", "Failed checks", "Uptime", "Average response (ms)", "Estimated downtime (min)"],
            ...summaries.map((item) => [item.name, item.url, item.currentStatus, item.totalChecks, item.failedChecks, item.uptime, item.averageResponseTimeMs, item.estimatedDowntimeMinutes]),
        ];
        const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
        link.download = `pulseops-${period.toLowerCase()}-report.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
        notify("Report exported as CSV");
    };

    return (
        <main className="flex-1 p-4 md:p-6 w-full max-w-7xl mx-auto">
            <SyncBanner />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-headline text-2xl font-semibold text-on-surface">Reliability reports</h1>
                    <p className="text-sm text-on-surface-variant mt-1">Historical uptime calculated from recorded monitor checks.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-surface border border-surface-border rounded-md p-1">
                        {periods.map((option) => (
                            <button key={option} type="button" onClick={() => choosePeriod(option)} className={`px-3 md:px-4 py-1.5 rounded text-sm ${option === period ? "bg-primary text-white font-medium" : "text-on-surface-variant hover:bg-surface-raised"}`}>{option}</button>
                        ))}
                    </div>
                    <button type="button" onClick={exportReport} disabled={!report || loading} className="bg-primary text-white rounded px-4 py-2 text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-40"><span className="material-symbols-outlined text-lg">download</span>Export CSV</button>
                </div>
            </div>

            <div className="mt-5"><AlertBanner>{error}</AlertBanner></div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6">
                {dynamicStats.map((stat) => (
                    <div key={stat.label} className="bg-surface border border-surface-border rounded-[10px] p-4 md:p-5 flex flex-col gap-2">
                        <div className="text-on-surface-variant text-xs uppercase tracking-wider">{stat.label}</div>
                        <div className={`font-mono text-2xl md:text-3xl ${stat.valueClass}`}>{loading ? "…" : stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="bg-surface border border-surface-border rounded-[10px] flex flex-col mt-6 overflow-hidden">
                <div className="p-5 border-b border-surface-border flex justify-between items-center">
                    <div><h2 className="font-headline text-[18px] font-semibold text-on-surface">Monitor performance</h2><p className="text-xs text-on-surface-variant mt-1">Ordered by failed checks in this period</p></div>
                    {report && <span className="text-xs font-mono text-on-surface-variant">{report.totalChecks} checks</span>}
                </div>
                {loading ? (
                    <p className="px-5 py-10 text-center text-sm text-on-surface-variant">Calculating report…</p>
                ) : summaries.length === 0 ? (
                    <p className="px-5 py-10 text-center text-sm text-on-surface-variant">No monitors yet. Add one to start collecting reliability data.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[780px] text-left text-sm">
                            <thead className="bg-background text-xs uppercase tracking-wider text-on-surface-variant"><tr><th className="px-5 py-3">Monitor</th><th className="px-4 py-3">Current</th><th className="px-4 py-3 text-right">Checks</th><th className="px-4 py-3 text-right">Failures</th><th className="px-4 py-3 text-right">Uptime</th><th className="px-4 py-3 text-right">Avg. response</th><th className="px-5 py-3 text-right">Downtime</th></tr></thead>
                            <tbody>{summaries.map((item) => <tr key={item.id} className="border-t border-surface-border"><td className="px-5 py-4"><div className="font-semibold text-on-surface">{item.name}</div><div className="font-mono text-xs text-on-surface-variant truncate max-w-xs">{item.url}</div></td><td className="px-4 py-4"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${item.currentStatus === "Healthy" ? "bg-emerald-50 text-success" : item.currentStatus === "Warning" ? "bg-amber-50 text-warning" : "bg-red-50 text-error"}`}>{item.currentStatus}</span></td><td className="px-4 py-4 text-right font-mono">{item.totalChecks}</td><td className="px-4 py-4 text-right font-mono text-error">{item.failedChecks}</td><td className="px-4 py-4 text-right font-mono">{item.totalChecks ? `${item.uptime.toFixed(2)}%` : "—"}</td><td className="px-4 py-4 text-right font-mono">{item.totalChecks ? `${item.averageResponseTimeMs}ms` : "—"}</td><td className="px-5 py-4 text-right font-mono">{item.estimatedDowntimeMinutes} min</td></tr>)}</tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}

export default Reports;
