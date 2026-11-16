// Fixed, purely decorative backdrop: soft aurora blobs plus a faint grid.
const Background = () => (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[34rem] w-[34rem] rounded-full bg-accent opacity-25 blur-[130px] dark:opacity-30" />
        <div className="absolute top-1/4 -right-40 h-[38rem] w-[38rem] rounded-full bg-accent-3 opacity-25 blur-[140px] dark:opacity-45" />
        <div className="absolute -bottom-48 left-1/4 h-[30rem] w-[30rem] rounded-full bg-accent-2 opacity-20 blur-[130px] dark:opacity-20" />
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
