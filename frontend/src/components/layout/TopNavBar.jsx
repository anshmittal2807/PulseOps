function TopNavBar() {
    return (
        <header className="h-16 w-full sticky top-0 z-40 border-b border-surface-border bg-background">
            <div className="flex items-center justify-end px-4 w-full h-full gap-4">
                <button
                    type="button"
                    aria-label="Notifications"
                    className="text-on-surface-variant hover:text-primary transition-colors duration-200 active:opacity-80"
                >
                    <span className="material-symbols-outlined">notifications</span>
                </button>
                <div className="w-8 h-8 rounded-full bg-surface overflow-hidden border border-surface-border"></div>
            </div>
        </header>
    );
}

export default TopNavBar;
