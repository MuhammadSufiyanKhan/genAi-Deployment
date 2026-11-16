const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

app.use(express.json())
app.use(cookieParser())
// Allowed frontends: local dev, known production aliases, any extra origins from CLIENT_URL (comma separated),
// and this Vercel team's frontend deployments (per-deployment and branch preview URLs).
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://frontend-wine-psi-17.vercel.app",
    "https://genai-deployment.vercel.app",
    ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map(o => o.trim()) : [])
]
const vercelFrontendPattern = /^https:\/\/frontend-[a-z0-9-]+-muhammadsufiyankhans-projects\.vercel\.app$/

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || vercelFrontendPattern.test(origin)) {
            return callback(null, true)
        }
        return callback(null, false)
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "Server is running" })
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err)
    res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    })
})

// 404 handler - catch all unmatched routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" })
})

module.exports = app