import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDemo } from "../../context/DemoContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

function TopNavBar({ title, crumb, onAddApi, onMenu }) {
    const navigate = useNavigate();
    const { alerts, apis, syncing } = useDemo();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const unread = alerts.filter((alert) => alert.unread).length;
    const problemMonitors = apis.filter((monitor) => !monitor.paused && monitor.status !== "Healthy");
    const criticalOpen = problemMonitors.some((monitor) => monitor.status === "Critical" || monitor.status === "Offline");
    const systemOk = problemMonitors.length === 0;
    const statusText = syncing ? "Syncing…" : systemOk ? "All systems operational" : `${problemMonitors.length} monitor${problemMonitors.length === 1 ? "" : "s"} need attention`;
    const initials = (user?.name || "PO").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

    const handleLogout = () => {
        setMenuOpen(false);
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <header className="h-[72px] w-full sticky top-0 z-40 border-b border-surface-border bg-surface">
            <div className="flex items-center justify-between px-4 md:px-8 w-full h-full gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <button type="button" onClick={onMenu} aria-label="Open navigation" className="lg:hidden w-9 h-9 rounded-lg border border-surface-border text-on-surface-variant flex items-center justify-center hover:bg-surface-raised hover:text-on-surface">
                        <span className="material-symbols-outlined text-xl">menu</span>
                    </button>
                    <div className="min-w-0">
                        {crumb && <p className="hidden sm:block text-[11px] leading-4 font-medium tracking-[0.12em] uppercase text-on-surface-variant">{crumb}</p>}
                        <h2 className="font-headline text-lg leading-6 font-semibold text-on-surface truncate">{title}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="hidden xl:flex items-center gap-2 text-xs text-on-surface-variant px-3 py-2 rounded-lg border border-surface-border bg-background" title="Live status derived from active monitors">
                        <span className={`w-1.5 h-1.5 rounded-full ${systemOk ? "bg-success shadow-[0_0_0_3px_#A7F3D0]" : criticalOpen ? "bg-error shadow-[0_0_0_3px_#FECACA]" : "bg-warning"}`}></span>
                        {statusText}
                    </div>
                    {onAddApi && <button type="button" onClick={onAddApi} className="hidden sm:flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-white hover:bg-blue-700 active:translate-y-px transition-colors"><span className="material-symbols-outlined text-lg">add</span>Add monitor</button>}
                    <button
                        type="button"
                        aria-label="Notifications"
                        onClick={() => navigate("/alerts")}
                        className="relative w-9 h-9 rounded-lg border border-surface-border bg-background text-on-surface-variant hover:text-primary hover:bg-primary-soft transition-colors flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-xl">notifications</span>
                        {unread > 0 && <span className="absolute -right-1 -top-1 min-w-4 h-4 px-1 rounded-full bg-error text-surface text-[10px] font-semibold flex items-center justify-center ring-2 ring-background">{unread}</span>}
                    </button>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-label="Account menu"
                            className="w-9 h-9 rounded-lg bg-primary text-xs font-semibold flex items-center justify-center text-white hover:bg-blue-700"
                            title={user?.email || "Account"}
                        >
                            {initials}
                        </button>
                        {menuOpen && (
                            <>
                                <button type="button" aria-label="Close account menu" className="fixed inset-0 z-40 cursor-default" onClick={() => setMenuOpen(false)} />
                                <div className="absolute right-0 mt-2 w-60 z-50 rounded-xl border border-surface-border bg-surface shadow-xl p-2">
                                    <div className="px-3 py-2.5 border-b border-surface-border mb-1">
                                        <p className="text-sm font-semibold text-on-surface truncate">{user?.name || "Operator"}</p>
                                        <p className="text-xs text-on-surface-variant truncate">{user?.email || ""}</p>
                                    </div>
                                    <button type="button" onClick={() => { setMenuOpen(false); navigate("/profile"); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-surface-raised flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">account_circle</span>Profile
                                    </button>
                                    <button type="button" onClick={() => { setMenuOpen(false); navigate("/settings"); }} className="w-full text-left px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-surface-raised flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">settings</span>Settings
                                    </button>
                                    <button type="button" onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-error hover:bg-error/10 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">logout</span>Sign out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default TopNavBar;
