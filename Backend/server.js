require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")

const port = process.env.PORT || 3000

connectToDB().then((connected) => {
    if (!connected) {
        console.error("Failed to connect to MongoDB. Server will not start.")
        process.exit(1)
    }

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`)
    })
})