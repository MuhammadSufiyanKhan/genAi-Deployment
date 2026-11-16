const Logo = ({ compact = false }) => (
    <span className="flex items-center gap-2.5">
        <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden>
            <defs>
                <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="var(--accent)" />
                    <stop offset="1" stopColor="var(--accent-3)" />
                </linearGradient>
            </defs>
            <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#logo-g)" />
            <path d="M9 21.5V10.5M9 10.5h6.2a3.6 3.6 0 0 1 0 7.2H9M18.5 21.5l4-4" stroke="var(--on-accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        {!compact && <span className="hidden font-display text-[1.05rem] leading-none font-bold tracking-tight sm:inline">Interview Prep <span className="text-gradient">Assistant</span></span>}
    </span>
)

export default Logo
