const Session = require("../models/Session");
const Store = require("../models/Store");
const { hashSessionToken } = require("../utils/authUtils");

async function requireStore(req, res, next) {
    const authorization = req.get("authorization") || "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Please sign in to continue" });
    }

    try {
        const session = await Session.findOne({
            tokenHash: hashSessionToken(token),
            expiresAt: { $gt: new Date() }
        }).select("storeId");

        if (!session) {
            return res.status(401).json({
                message: "Your session has expired. Please sign in again."
            });
        }

        const store = await Store.findById(session.storeId).select(
            "storeName adminName email"
        );
        if (!store) {
            return res.status(401).json({ message: "Please sign in to continue" });
        }

        req.storeId = store._id;
        req.store = store;
        req.sessionId = session._id;
        next();
    } catch (error) {
        res.status(500).json({
            message: "Could not verify your session",
            error: error.message
        });
    }
}

module.exports = requireStore;
