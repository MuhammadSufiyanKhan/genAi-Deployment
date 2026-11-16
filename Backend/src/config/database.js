const mongoose = require("mongoose")
const dns = require("dns")

// Fail fast instead of buffering queries for 10s when there is no connection
mongoose.set("bufferCommands", false)

let dnsConfigured = false
function configureDnsServers() {
    if (dnsConfigured) return
    dnsConfigured = true
    try {
        dns.setServers([ "8.8.8.8", "8.8.4.4" ])
    } catch (err) {
        console.warn("Unable to override DNS servers:", err.message || err)
    }
}

// One shared connection attempt per server instance. A failed attempt is forgotten,
// so the next request tries again instead of leaving the instance broken.
let connecting = null

async function connectToDB() {
    if (mongoose.connection.readyState === 1) return true

    if (!connecting) {
        configureDnsServers()
        connecting = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 45000,
        }).then(() => {
            console.log("Connected to Database")
            return true
        }).catch((err) => {
            console.error("Database connection failed:", err.message || err)
            connecting = null
            throw err
        })
    }

    return connecting
}

module.exports = connectToDB
