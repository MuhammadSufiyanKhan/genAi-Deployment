// Fixed, purely decorative backdrop: soft aurora blobs plus a faint grid.
const Background = () => (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-56 left-1/2 h-[34rem] w-[48rem] -translate-x-1/2 rounded-full bg-accent opacity-10 blur-[150px] dark:opacity-[0.12]" />
        <div
            className="absolute inset-0 opacity-[0.5] dark:opacity-[0.35]"
            style={{
                backgroundImage:
                    "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
                maskImage: "radial-gradient(ellipse at 50% 20%, black 20%, transparent 75%)",
                WebkitMaskImage: "radial-gradient(ellipse at 50% 20%, black 20%, transparent 75%)"
            }}
        />
    </div>
)

export default Background
