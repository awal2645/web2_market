export default function AppLogo() {
    return (
        <>
            <img
                src="/images/web2autos-logo.png"
                alt="Web2Autos.com"
                className="h-8 w-auto shrink-0"
            />
            <div className="ml-2 grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold text-sidebar-foreground">
                    Web2Autos
                </span>
                <span className="truncate text-xs font-medium text-[#1565C0] dark:text-[#90caf9]">
                    Market
                </span>
            </div>
        </>
    );
}
