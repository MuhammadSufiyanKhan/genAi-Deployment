const mongoose = require("mongoose")
const dns = require("dns")


function configureDnsServers() {
    try {
        dns.setServers(["8.8.8.8", "8.8.4.4"])
        console.log("Using public DNS servers for SRV resolution")
    } catch (err) {
        console.warn("Unable to override DNS servers:", err.message || err)
    }
}

async function connectToDB() {
    configureDnsServers()

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        })

        console.log("Connected to Database")
        return true
    } catch (err) {
        console.error("Database connection failed:", err.message || err)
        return false
    }
}

module.exports = connectToDB