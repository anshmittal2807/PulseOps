import Icon from "../components/ui/Icon.jsx";
import StatCard from "../components/dashboard/StatCard.jsx";
import { LineChart, DoughnutChart, BarChart } from "../components/dashboard/Charts.jsx";
import RecentChecksTable from "../components/dashboard/RecentChecksTable.jsx";
import SyncBanner from "../components/ui/SyncBanner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { SkeletonRows } from "../components/ui/Spinner.jsx";
import { useDemo } from "../context/DemoContext.jsx";
import { useNavigate } from "react-router-dom";

function formatTick(iso) {
    try {
        return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
        return "";
    }
}

function Dashboard() {
    const navigate = useNavigate();
    const { apis, alerts, recentChecks, syncing } = useDemo();
    // Derive overview cards from the shared monitor snapshot also used by
    // the table, keeping every status count tied to the visible API data.
    const healthy = apis.filter((api) => api.status === "Healthy").length;
    const offline = apis.filter((api) => api.status === "Offline" || api.status === "Critical").length;
    const measured = apis.filter((api) => api.averageResponseTime > 0);
    const average = measured.length ? Math.round(measured.reduce((sum, api) => sum + api.averageResponseTime, 0) / measured.length) : 0;
    const statusValues = [healthy, apis.filter((api) => api.status === "Warning").length, offline];
    const total = Math.max(apis.length, 1);
    const chartApis = apis.filter((api) => api.averageResponseTime > 0).slice(0, 3);

    // Real recorded checks (scheduler + manual), newest first from the backend.
    const recorded = (recentChecks || []).slice(0, 5).map((log) => ({
        name: log.apiName || "Unknown",
        statusCode: log.statusCode,
        responseTime: log.responseTime,
        checked: log.timestamp,
    }));

    // Latency trend from recorded successful checks, oldest -> newest.
    const trendSamples = (recentChecks || [])
        .filter((log) => log.success && log.responseTimeMs != null)
        .slice(0, 20)
        .reverse();
    const trendValues = trendSamples.map((log) => log.responseTimeMs);
    const trendLabels = trendSamples.map((log) => formatTick(log.checkedAt));

    const unreadAlerts = alerts.filter((alert) => alert.unread && alert.severity !== "recovered");
    const bannerDetail = unreadAlerts.slice(0, 2)
        .map((alert) => `${alert.service}: ${alert.message}`)
        .join(" · ");

    return (
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-7 bg-background">
            <div className="max-w-[1480px] mx-auto">
                <SyncBanner />
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
                    <div><h1 className="font-headline text-xl md:text-2xl font-semibold tracking-[-0.02em] text-on-surface">Monitoring overview</h1><p className="text-sm text-on-surface-variant mt-1">Live health across your API estate.</p></div>
                    <p className="text-xs text-on-surface-variant flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-success"></span>{syncing ? "Syncing…" : "Updated just now"}</p>
                </div>
                {syncing && apis.length === 0 ? (
                    <SkeletonRows rows={4} />
                ) : apis.length === 0 ? (
                    <EmptyState
                        icon="monitor_heart"
                        title="No monitors yet"
                        hint="Add your first API endpoint. The scheduler will probe it automatically on its interval and record every check here."
                        actionLabel="Add monitor"
                        actionTo="/apis/add"
                    />
                ) : (
                <>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-4">
                    <StatCard title="Total monitors" value={apis.length} icon="dns" detail={`${apis.filter((api) => !api.paused).length} actively polling`} />
                    <StatCard title="Healthy" value={healthy} variant="healthy" icon="check_circle" detail={`${Math.round((healthy / total) * 100)}% of estate`} />
                    <StatCard title="Needs attention" value={offline + statusValues[1]} variant="offline" icon="error" detail={`${unreadAlerts.length} open alerts`} />
                    <StatCard title="Average latency" value={average} suffix="ms" icon="speed" detail="Across responding APIs" />
                </div>

                {unreadAlerts.length > 0 && <button type="button" onClick={() => navigate('/alerts')} className="w-full mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3 text-left hover:bg-red-100 transition-colors"><span className="w-8 h-8 shrink-0 rounded-lg bg-error text-white flex items-center justify-center"><Icon name="warning" className="text-lg" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-medium text-on-surface">{unreadAlerts.length} incident{unreadAlerts.length === 1 ? "" : "s"} require{unreadAlerts.length === 1 ? "s" : ""} review</span><span className="block text-xs text-on-surface-variant truncate">{bannerDetail}</span></span><Icon name="arrow_forward" className="text-on-surface-variant text-lg" /></button>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <section className="lg:col-span-2 bg-surface border border-surface-border rounded-xl p-5 md:p-6">
                        <div className="flex justify-between items-start gap-4 mb-4"><div><h3 className="font-headline text-base font-semibold text-on-surface">Response time</h3><p className="text-xs text-on-surface-variant mt-1">Recorded latency across monitored endpoints</p></div><span className="font-mono text-[11px] text-on-surface-variant border border-surface-border rounded-md px-2.5 py-1.5">Recent checks</span></div>
                        <div className="h-52 w-full relative"><LineChart data={trendValues} labels={trendLabels} /></div>
                    </section>
                    <section className="bg-surface border border-surface-border rounded-xl p-5 md:p-6">
                        <div className="mb-5"><h3 className="font-headline text-base font-semibold text-on-surface">Monitor health</h3><p className="text-xs text-on-surface-variant mt-1">Current status distribution</p></div>
                        <div className="h-48 w-full relative flex justify-center"><DoughnutChart data={statusValues.map((value) => Math.round((value / total) * 100))} /></div>
                    </section>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="xl:col-span-2"><RecentChecksTable checks={recorded} /></div>
                    <section className="bg-surface border border-surface-border rounded-xl p-5 md:p-6">
                        <div className="mb-4"><h3 className="font-headline text-base font-semibold text-on-surface">Latency by service</h3><p className="text-xs text-on-surface-variant mt-1">Average response in milliseconds</p></div>
                        <div className="h-52 w-full relative"><BarChart data={chartApis.map((api) => api.averageResponseTime)} labels={chartApis.map((api) => api.name.split(" ")[0])} /></div>
                    </section>
                </div>
                </>
                )}
            </div>
        </main>
    );
}

export default Dashboard;
