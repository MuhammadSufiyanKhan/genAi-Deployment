// Small in-memory limiter for anonymous report generation (each report costs an AI call).
// On serverless it is per instance, so it is a safety net, not a hard guarantee.
const WINDOW_MS = 60 * 60 * 1000
const MAX_ANONYMOUS_REPORTS = 5
const hits = new Map()

function limitAnonymousReports(req, res, next) {
    if (req.user) return next()

    const ip = (req.headers["x-forwarded-for"] || req.ip || "").toString().split(",")[0].trim()
    const now = Date.now()
    const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS)

    if (recent.length >= MAX_ANONYMOUS_REPORTS) {
        return res.status(429).json({
            message: "You have reached the limit for guests. Log in to create more plans, or try again in an hour."
        })
    }

    recent.push(now)
    hits.set(ip, recent)
    next()
}

module.exports = { limitAnonymousReports }
