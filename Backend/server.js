require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")

// For Vercel serverless functions, ensure DB connection on app startup
connectToDB().then((connected) => {
    if (!connected) {
        console.error("Failed to connect to MongoDB. Serverless function may not work properly.")
    } else {
        console.log("Database connected successfully")
    }
}).catch((error) => {
    console.error("Database connection error:", error)
})

// Export the Express app for Vercel serverless functions
module.exports = app

// For local development, keep the traditional server
if (require.main === module) {
    const port = process.env.PORT || 3000
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`)
    })
}