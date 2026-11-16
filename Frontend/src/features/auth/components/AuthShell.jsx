import SiteHeader from "../../ui/SiteHeader"

// Shared layout for login and register: a pitch on the left, the form on the right.
const AuthShell = ({ title, subtitle, children, footer }) => (
    <div className="min-h-screen">
        <SiteHeader />
        <main className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:py-20">
            <div className="hidden lg:block">
                <h2 className="text-[clamp(2.2rem,4.4vw,3.6rem)] leading-[1.02] font-extrabold">
                    Save your plans and <span className="text-gradient">come back to them</span>
                </h2>
                <p className="mt-5 max-w-md text-lg text-muted">
                    You can build a plan without an account. Sign in to keep every report in one place.
                </p>
                <ul className="mt-8 grid gap-3 text-muted">
                    {[ "Your plans stay saved", "Open them from any device", "Download tailored resumes anytime" ].map((t) => (
                        <li key={t} className="flex items-center gap-3">
                            <span className="grid h-6 w-6 place-items-center rounded-full bg-accent/20 text-accent">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
                            </span>
                            {t}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="glass mx-auto w-full max-w-md rounded-3xl p-7 shadow-[0_30px_80px_-40px_var(--glow)] sm:p-9">
                <h1 className="text-3xl font-extrabold">{title}</h1>
                <p className="mt-2 text-muted">{subtitle}</p>
                <div className="mt-7">{children}</div>
                <p className="mt-6 text-sm text-muted">{footer}</p>
            </div>
        </main>
    </div>
)

export default AuthShell
