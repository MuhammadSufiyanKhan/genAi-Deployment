import { Link } from "react-router"
import { useAuth } from "../auth/hooks/useAuth"
import ThemeToggle from "../theme/ThemeToggle"
import Logo from "./Logo"

const SiteHeader = () => {
    const { user, handleLogout } = useAuth()

    return (
        <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4">
            <div className="glass mx-auto flex max-w-6xl !bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] items-center justify-between gap-3 rounded-full py-2 pr-2 pl-4 sm:pl-5">
                <Link to="/" aria-label="Interview Prep Assistant home">
                    <Logo />
                </Link>

                <nav aria-label="Main" className="flex items-center gap-1.5 sm:gap-3">
                    <Link to="/app" className="hidden rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-fg sm:block">
                        Create plan
                    </Link>
                    {user ? (
                        <button onClick={handleLogout} className="rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-fg cursor-pointer">
                            Log out
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className="rounded-full px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-fg">Log in</Link>
                            <Link to="/register" className="btn-ghost !px-4 !py-2 text-sm">Sign up</Link>
                        </>
                    )}
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    )
}

export default SiteHeader
