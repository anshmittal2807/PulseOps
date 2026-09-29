import { useState } from "react";
import { useDemo } from "../context/DemoContext.jsx";
import SyncBanner from "../components/ui/SyncBanner.jsx";

const periods = ["Today", "Weekly", "Monthly"];

function Reports() {
    const [period, setPeriod] = useState("Weekly");
    const { apis, notify } = useDemo();
    const failureCount = apis.filter((api) => api.status !== "Healthy").length;
    const average = apis.filter((api) => api.averageResponseTime > 0);
    const averageTime = average.length ? Math.round(average.reduce((sum, api) => sum + api.averageResponseTime, 0) / average.length) : 0;
    const dynamicStats = [
        { label: "Uptime", value: `${(100 - (failureCount / Math.max(apis.length, 1)) * 2.5).toFixed(2)}%`, valueClass: "text-primary" },
        { label: "Failures", value: String(failureCount), valueClass: "text-on-surface" },
        { label: "Average Time", value: `${averageTime}ms`, valueClass: "text-on-surface" },
        { label: "Monitors", value: String(apis.length), valueClass: "text-on-surface" },
    ];
    const exportReport = () => {
        const rows = [["API", "URL", "Status", "Response Time", "Environment"], ...apis.map((api) => [api.name, api.url, api.status, api.responseTime, api.environment])];
        const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
        const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); link.download = `pulseops-${period.toLowerCase()}-report.csv`; link.click(); URL.revokeObjectURL(link.href); notify("Report exported as CSV");
    };

    return (
        <main className="flex-1 p-6 w-full max-w-7xl mx-auto">
            <SyncBanner />
            {/* Page header and period selector */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="font-headline text-2xl font-semibold text-on-surface">System Reports</h1>
                <div className="flex items-center gap-3"><div className="flex bg-surface border border-surface-border rounded-md p-1">
                    {periods.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => setPeriod(option)}
                            className={`px-4 py-1.5 rounded text-sm ${
                                option === period
                                    ? "bg-surface-raised text-on-surface font-medium border border-surface-border"
                                    : "text-on-surface-variant hover:bg-surface-raised transition-colors"
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div><button type="button" onClick={exportReport} className="bg-primary text-white rounded px-4 py-2 text-sm font-semibold flex items-center gap-2 hover:bg-blue-700"><span className="material-symbols-outlined text-lg">download</span>Export CSV</button></div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {dynamicStats.map((stat) => (
                    <div key={stat.label} className="bg-surface border border-surface-border rounded-[10px] p-5 flex flex-col gap-2">
                        <div className="text-on-surface-variant text-sm uppercase tracking-wider">{stat.label}</div>
                        <div className={`font-mono text-3xl ${stat.valueClass}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Most failed APIs list */}
            <div className="bg-surface border border-surface-border rounded-[10px] flex flex-col mt-6">
                <div className="p-5 border-b border-surface-border">
                    <h2 className="font-headline text-[18px] font-semibold text-on-surface">Most Failed APIs</h2>
                </div>
                <div className="flex flex-col">
                    {apis.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-on-surface-variant">No monitors yet. Add one to start collecting report data.</p>
                    ) : apis.every((api) => api.status === "Healthy") ? (
                        <p className="px-5 py-8 text-center text-sm text-on-surface-variant flex items-center justify-center gap-2"><span className="material-symbols-outlined text-success">check_circle</span>No failures in this period. Every monitor is healthy.</p>
                    ) : (
                    apis.filter((api) => api.status !== "Healthy").map((api, index, failed) => (
                        <div
                            key={api.name}
                            className={`px-5 py-3 flex justify-between items-center hover:bg-surface-raised transition-colors ${
                                index < failed.length - 1 ? "border-b border-surface-border" : ""
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${api.status === "Warning" ? "bg-warning" : "bg-error"}`}></div>
                                <span className="font-mono text-on-surface">{api.name}</span>
                            </div>
                            <div className="font-mono text-on-surface-variant">{api.status}</div>
                        </div>
                    )))}
                </div>
            </div>
        </main>
    );
}

export default Reports;
