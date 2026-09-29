import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiTable from "../components/api/ApiTable.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import SyncBanner from "../components/ui/SyncBanner.jsx";
import { SkeletonRows } from "../components/ui/Spinner.jsx";
import { useDemo } from "../context/DemoContext.jsx";

function AllApis() {
    const navigate = useNavigate();
    const { apis, syncing } = useDemo();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All Statuses");
    const [environment, setEnvironment] = useState("All Envs");
    const [method, setMethod] = useState("All Methods");
    const [tag, setTag] = useState("All Tags");

    const filteredApis = apis.filter((api) => {
        const matchesSearch =
            api.name.toLowerCase().includes(search.toLowerCase()) ||
            api.url.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === "All Statuses" || api.status === status;
        const matchesEnvironment =
            environment === "All Envs" || api.environment === environment;
        const matchesMethod = method === "All Methods" || api.method === method;
        const matchesTag = tag === "All Tags" || api.tags.includes(tag);

        return (
            matchesSearch &&
            matchesStatus &&
            matchesEnvironment &&
            matchesMethod &&
            matchesTag
        );
    });

    return (
        <main className="flex-1 px-4 py-6 md:px-8 md:py-7">
            <div className="max-w-[1480px] mx-auto">
            <SyncBanner />
            <div className="flex justify-between items-end mb-6">
                <div><h1 className="font-headline text-xl md:text-2xl font-semibold tracking-[-0.02em] text-on-surface">API monitors</h1><p className="text-sm text-on-surface-variant mt-1">Manage health checks, thresholds, and endpoint status.</p></div>
                <button type="button" onClick={() => navigate("/apis/add")} className="sm:hidden bg-primary text-white font-body text-sm font-semibold px-3.5 py-2 rounded-lg flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">add</span>Add monitor</button>
            </div>

            <div className="bg-surface border border-surface-border rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label htmlFor="api-search" className="block text-xs font-medium text-on-surface-variant mb-2">Search monitors</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                        <input
                            id="api-search"
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by name or URL"
                            className="w-full h-10 bg-background border border-surface-border rounded-lg pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="w-[140px] flex-1 sm:flex-none">
                    <label htmlFor="filter-status" className="block text-xs font-semibold tracking-wider uppercase text-on-surface-variant mb-2">
                        Status
                    </label>
                    <select
                        id="filter-status"
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className="w-full bg-background border border-surface-border rounded px-3 py-2 text-sm text-on-surface focus:border-primary focus:ring-0 transition-colors appearance-none"
                    >
                        <option>All Statuses</option>
                        <option>Healthy</option>
                        <option>Warning</option>
                        <option>Critical</option>
                        <option>Offline</option>
                    </select>
                </div>

                <div className="w-[140px] flex-1 sm:flex-none">
                    <label htmlFor="filter-environment" className="block text-xs font-semibold tracking-wider uppercase text-on-surface-variant mb-2">
                        Environment
                    </label>
                    <select
                        id="filter-environment"
                        value={environment}
                        onChange={(event) => setEnvironment(event.target.value)}
                        className="w-full bg-background border border-surface-border rounded px-3 py-2 text-sm text-on-surface focus:border-primary focus:ring-0 transition-colors appearance-none"
                    >
                        <option>All Envs</option>
                        <option>Production</option>
                        <option>Staging</option>
                        <option>Development</option>
                    </select>
                </div>

                <div className="w-[120px] flex-1 sm:flex-none">
                    <label htmlFor="filter-method" className="block text-xs font-semibold tracking-wider uppercase text-on-surface-variant mb-2">
                        Method
                    </label>
                    <select
                        id="filter-method"
                        value={method}
                        onChange={(event) => setMethod(event.target.value)}
                        className="w-full bg-background border border-surface-border rounded px-3 py-2 text-sm text-on-surface focus:border-primary focus:ring-0 transition-colors appearance-none"
                    >
                        <option>All Methods</option>
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>PATCH</option>
                        <option>DELETE</option>
                    </select>
                </div>

                <div className="w-[140px] flex-1 sm:flex-none">
                    <label htmlFor="filter-tags" className="block text-xs font-semibold tracking-wider uppercase text-on-surface-variant mb-2">
                        Tags
                    </label>
                    <select
                        id="filter-tags"
                        value={tag}
                        onChange={(event) => setTag(event.target.value)}
                        className="w-full bg-background border border-surface-border rounded px-3 py-2 text-sm text-on-surface focus:border-primary focus:ring-0 transition-colors appearance-none"
                    >
                        <option>All Tags</option>
                        {[...new Set(apis.flatMap((api) => api.tags))].map((item) => <option key={item}>{item}</option>)}
                    </select>
                </div>
            </div>

            {syncing && apis.length === 0 ? (
                <SkeletonRows rows={5} />
            ) : apis.length === 0 ? (
                <EmptyState
                    icon="api"
                    title="No monitors yet"
                    hint="Add your first API endpoint to start tracking uptime, latency and incidents."
                    actionLabel="Add monitor"
                    actionTo="/apis/add"
                />
            ) : (
                <ApiTable apis={filteredApis} />
            )}
            </div>
        </main>
    );
}

export default AllApis;

