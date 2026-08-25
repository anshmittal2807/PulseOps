import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiTable from "../components/api/ApiTable.jsx";

const apis = [
    {
        id: 1,
        name: "Authentication Service",
        url: "auth.pulseops.io",
        method: "POST",
        status: "Healthy",
        responseTime: "120ms",
        environment: "Production",
        lastChecked: "2 mins ago",
        tags: ["Core"],
    },
    {
        id: 2,
        name: "Payment Gateway",
        url: "api.stripe.com",
        method: "POST",
        status: "Healthy",
        responseTime: "340ms",
        environment: "Production",
        lastChecked: "4 mins ago",
        tags: ["External"],
    },
    {
        id: 3,
        name: "Notification Service",
        url: "notify.internal",
        method: "GET",
        status: "Critical",
        responseTime: "timeout",
        environment: "Staging",
        lastChecked: "6 mins ago",
        tags: ["Core"],
    },
    {
        id: 4,
        name: "Inventory Service",
        url: "inv-svc.cluster.local",
        method: "GET",
        status: "Warning",
        responseTime: "850ms",
        environment: "Production",
        lastChecked: "10 mins ago",
        tags: ["Core"],
    },
    {
        id: 5,
        name: "Delivery Partner API",
        url: "partner-api.com",
        method: "POST",
        status: "Offline",
        responseTime: "0ms",
        environment: "Beta",
        lastChecked: "15 mins ago",
        tags: ["External"],
    },{
        id: 5,
        name: "Delivery Partner API",
        url: "partner-api.com",
        method: "POST",
        status: "Offline",
        responseTime: "0ms",
        environment: "Beta",
        lastChecked: "15 mins ago",
        tags: ["External"],
    },  
];

function AllApis() {
    const navigate = useNavigate();
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
        <main className="flex-1 p-6 pt-0">
            <div className="flex justify-between items-center mb-8">
                <h2 className="font-headline text-2xl font-semibold text-on-surface">All APIs</h2>
                <button
                    type="button"
                    onClick={() => navigate("/apis/add")}
                    className="bg-primary text-background font-body text-sm font-semibold px-4 py-2 rounded flex items-center gap-2 active:scale-[0.98] transition-transform hover:bg-[#00b39e]"
                >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Add API
                </button>
            </div>

            <div className="bg-surface border border-surface-border rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label htmlFor="api-search" className="block text-xs font-semibold tracking-wider uppercase text-on-surface-variant mb-2">
                        Search
                    </label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                        <input
                            id="api-search"
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by name or URL"
                            className="w-full bg-background border border-surface-border rounded pl-10 pr-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:ring-0 transition-colors"
                        />
                    </div>
                </div>

                <div className="w-[140px]">
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

                <div className="w-[140px]">
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
                        <option>Beta</option>
                    </select>
                </div>

                <div className="w-[120px]">
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
                    </select>
                </div>

                <div className="w-[140px]">
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
                        <option>Core</option>
                        <option>External</option>
                    </select>
                </div>
            </div>

            <ApiTable apis={filteredApis} />
        </main>
    );
}

export default AllApis;

