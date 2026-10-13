import Icon from "../ui/Icon.jsx";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const mainLinks = [
    { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { to: "/apis", icon: "api", label: "APIs" },
    { to: "/alerts", icon: "notifications_active", label: "Alerts" },
    { to: "/reports", icon: "description", label: "Reports" },
    { to: "/activity-log", icon: "history", label: "Activity Log" },
];

const footerLinks = [
    { to: "/profile", icon: "account_circle", label: "Profile" },
    { to: "/settings", icon: "settings", label: "Settings" },
];

function NavItem({ link, onNavigate }) {
    return (
        <NavLink
            to={link.to}
            onClick={onNavigate}
            className={({ isActive }) =>
                isActive
                    ? "text-white font-semibold bg-primary border border-primary px-3 py-2.5 rounded-lg flex items-center gap-3"
                    : "text-slate-300 px-3 py-2.5 rounded-lg flex items-center gap-3 border border-transparent transition-colors hover:bg-slate-800 hover:text-white duration-150"
            }
        >
            <Icon name={link.icon} className="text-[20px]" />
            <span className="text-sm">{link.label}</span>
        </NavLink>
    );
}

function SideNavBar({ open, onClose }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const initials = (user?.name || "DO").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <>
            {open && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-50 bg-black/60 lg:hidden" />}
            <nav className={`h-screen w-[252px] fixed left-0 top-0 flex flex-col border-r border-surface-border bg-surface-muted z-[60] transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="flex flex-col h-full px-4 py-5">
                <div>
                    <div className="flex items-center justify-between px-2 mb-6">
                        <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white"><Icon name="monitor_heart" className="text-[20px]" /></span>
                            <div><h1 className="font-headline text-[17px] leading-5 font-semibold text-white tracking-tight">PulseOps</h1><p className="text-slate-400 text-[11px] leading-4">API observability</p></div>
                        </div>
                        <button type="button" onClick={onClose} aria-label="Close navigation" className="lg:hidden text-slate-400 hover:text-white"><Icon name="close" className="text-xl" /></button>
                    </div>
                    <div className="mb-6 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-xs font-semibold text-white">PO</span>
                        <div className="min-w-0 flex-1"><p className="text-xs font-medium text-white truncate">PulseOps workspace</p><p className="text-[11px] text-slate-400">Production</p></div>
                        <Icon name="unfold_more" className="text-base text-slate-400" />
                    </div>
                    <p className="px-3 mb-2 text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-500">Monitor</p>
                    <div className="flex flex-col space-y-1">
                        {mainLinks.map((link) => (
                            <NavItem key={link.to} link={link} onNavigate={onClose} />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col space-y-1 mt-auto">
                    <p className="px-3 mb-2 text-[10px] font-semibold tracking-[0.14em] uppercase text-slate-500">Workspace</p>
                    {footerLinks.map((link) => (
                        <NavItem key={link.to} link={link} onNavigate={onClose} />
                    ))}
                    <div className="mt-3 pt-4 border-t border-slate-700 flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-xs font-semibold flex items-center justify-center text-white shrink-0">{initials}</div>
                        <div className="min-w-0 flex-1"><p className="text-xs font-medium text-white truncate">{user?.name || "Operator"}</p><p className="text-[11px] text-slate-400 truncate">{user?.role || "Member"}</p></div>
                        <button type="button" onClick={handleLogout} title="Sign out" aria-label="Sign out" className="text-slate-400 hover:text-white transition-colors">
                            <Icon name="logout" className="text-lg" />
                        </button>
                    </div>
                </div>
            </div>
            </nav>
        </>
    );
}

export default SideNavBar;
