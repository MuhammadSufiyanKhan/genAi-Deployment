import { useEffect, useState } from "react"

// Full-screen state shown while a plan is being created or loaded.
const GeneratingScreen = ({ title = "Building your plan", steps = [] }) => {
    const [ i, setI ] = useState(0)

    useEffect(() => {
        if (steps.length < 2) return
        const id = setInterval(() => setI((n) => Math.min(n + 1, steps.length - 1)), 3500)
        return () => clearInterval(id)
    }, [ steps.length ])

    return (
        <main className="grid min-h-[70vh] place-items-center px-5 text-center" role="status" aria-live="polite">
            <div>
                <div className="relative mx-auto mb-10 h-32 w-32">
                    <span className="absolute inset-0 animate-spin-slow rounded-full border-2 border-dashed border-accent/60" />
                    <span className="absolute inset-3 animate-spin rounded-full border-2 border-transparent border-t-accent-2 border-r-accent-3" />
                    <span className="absolute inset-8 animate-pulse rounded-full bg-gradient-to-br from-accent to-accent-2 shadow-[0_0_60px_var(--glow)]" />
                </div>
                <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
                {steps.length > 0 && (
                    <p key={i} className="mt-4 text-lg text-muted">{steps[ i ]}</p>
                )}
            </div>
        </main>
    )
}

export default GeneratingScreen
