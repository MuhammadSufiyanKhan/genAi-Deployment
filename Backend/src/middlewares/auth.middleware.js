const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")



async function authUser(req, res, next) {

    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: "Token not provided."
        })
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({
        token
    })

    if (isTokenBlacklisted) {
        return res.status(401).json({
            message: "token is invalid"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded

        next()

    } catch (err) {

        return res.status(401).json({
            message: "Invalid token."
        })
    }

}


/**
 * Like authUser, but never blocks: if there is a valid login cookie req.user is set,
 * otherwise the request continues as an anonymous visitor.
 */
async function optionalAuth(req, res, next) {
    const token = req.cookies.token

    if (token) {
        try {
            const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token })
            if (!isTokenBlacklisted) {
                req.user = jwt.verify(token, process.env.JWT_SECRET)
            }
        } catch (err) {
            // invalid or expired token: treat as anonymous
        }
    }

    next()
}


module.exports = { authUser, optionalAuth }