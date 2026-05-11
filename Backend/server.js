require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")

// Global database connection cache for serverless
let cachedDb = null

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb
  }

  try {
    cachedDb = await connectToDB()
    return cachedDb
  } catch (error) {
    console.error("Database connection failed:", error)
    throw error
  }
}

// Initialize database connection
connectToDatabase().then((connected) => {
  if (connected) {
    console.log("Database connected successfully")
  } else {
    console.error("Failed to connect to database")
  }
}).catch((error) => {
  console.error("Database initialization error:", error)
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