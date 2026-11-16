// Where to go after signing in: back to the page the visitor came from (same-site paths only).
export const afterAuthTarget = (search) => {
    const params = new URLSearchParams(search)
    const next = params.get("next")
    if (next && next.startsWith("/") && !next.startsWith("//")) {
        return params.get("save") === "1" ? `${next}?save=1` : next
    }
    return "/app"
}
