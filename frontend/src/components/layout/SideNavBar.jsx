import { NavLink } from "react-router-dom";

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

function NavItem({ link }) {
    return (
        <NavLink
            to={link.to}
            className={({ isActive }) =>
                isActive
                    ? "text-primary font-bold border-r-2 border-primary bg-surface-raised px-4 py-3 flex items-center gap-3"
                    : "text-on-surface-variant px-4 py-3 flex items-center gap-3 transition-colors hover:bg-surface hover:text-on-surface duration-150 active:scale-[0.98]"
            }
        >
            <span className="material-symbols-outlined">{link.icon}</span>
            {link.label}
        </NavLink>
    );
}

function SideNavBar() {
    return (
        <nav className="h-screen w-[240px] fixed left-0 top-0 flex flex-col border-r border-surface-border bg-background z-50">
            <div className="flex flex-col h-full justify-between py-6">
                <div>
                    <div className="px-6 mb-8">
                        <h1 className="font-headline text-[32px] leading-[40px] font-bold text-primary tracking-tight">
                            PulseOps
                        </h1>
                        <p className="text-on-surface-variant font-body text-sm">
                            Observability Suite
                        </p>
                    </div>
                    <div className="flex flex-col space-y-1">
                        {mainLinks.map((link) => (
                            <NavItem key={link.to} link={link} />
                        ))}
                    </div>
                </div>
                <div className="flex flex-col space-y-1 mt-auto">
                    {footerLinks.map((link) => (
                        <NavItem key={link.to} link={link} />
                    ))}
                </div>
            </div>
        </nav>
    );
}

export default SideNavBar;
