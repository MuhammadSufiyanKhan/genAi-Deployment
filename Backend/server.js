require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")

// Warm up the database connection; requests also connect on demand (see app.js)
connectToDB().catch(() => {})

// Export the Express app for Vercel serverless functions
module.exports = app

// For local development, keep the traditional server
if (require.main === module) {
    const port = process.env.PORT || 3000
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`)
    })
}