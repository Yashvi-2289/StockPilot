const mongoose = require("mongoose");
const Product = require("../models/product");
const Sale = require("../models/Sale");
const Order = require("../models/Order");
const Session = require("../models/Session");
const Store = require("../models/Store");
const {
    createSessionToken,
    hashPassword,
    hashSessionToken,
    verifyPassword
} = require("../utils/authUtils");

const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000;

function publicStore(store) {
    return {
        id: store._id,
        storeName: store.storeName,
        adminName: store.adminName,
        email: store.email
    };
}

async function createSession(storeId) {
    const token = createSessionToken();
    await Session.create({
        storeId,
        tokenHash: hashSessionToken(token),
        expiresAt: new Date(Date.now() + sessionLifetimeMs)
    });
    return token;
}

function validateProfile({ storeName, adminName, email }) {
    if (
        typeof storeName !== "string" ||
        !storeName.trim() ||
        storeName.trim().length > 100 ||
        typeof adminName !== "string" ||
        !adminName.trim() ||
        adminName.trim().length > 100 ||
        typeof email !== "string" ||
        email.trim().length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        return false;
    }

    return true;
}

const register = async (req, res) => {
    const { storeName, adminName, email, password } = req.body || {};

    if (
        !validateProfile({ storeName, adminName, email }) ||
        typeof password !== "string" ||
        password.length < 8 ||
        password.length > 128
    ) {
        return res.status(400).json({
            message: "Enter a store name, your name, a valid email, and a password of at least 8 characters."
        });
    }

    let session;
    try {
        const passwordHash = await hashPassword(password);
        session = await mongoose.startSession();
        let store;

        await session.withTransaction(async () => {
            const isFirstStore = (await Store.countDocuments({}).session(session)) === 0;
            [store] = await Store.create(
                [{
                    storeName: storeName.trim(),
                    adminName: adminName.trim(),
                    email: email.trim().toLowerCase(),
                    passwordHash
                }],
                { session }
            );

            if (isFirstStore) {
                const unassignedRecords = { storeId: null };
                await Product.updateMany(
                    unassignedRecords,
                    { $set: { storeId: store._id } },
                    { session }
                );
                await Sale.updateMany(
                    unassignedRecords,
                    { $set: { storeId: store._id } },
                    { session }
                );
                await Order.updateMany(
                    unassignedRecords,
                    { $set: { storeId: store._id } },
                    { session }
                );
            }
        });

        const token = await createSession(store._id);
        res.status(201).json({ token, user: publicStore(store) });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }

        res.status(500).json({
            message: "Could not create your store account",
            error: error.message
        });
    } finally {
        if (session) {
            await session.endSession();
        }
    }
};

const login = async (req, res) => {
    const body = req.body || {};
    const email = typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const password = body.password;

    if (
        !email ||
        typeof password !== "string" ||
        !password ||
        password.length > 128
    ) {
        return res.status(400).json({ message: "Enter your email and password." });
    }

    try {
        const store = await Store.findOne({ email }).select("+passwordHash");
        if (!store || !(await verifyPassword(password, store.passwordHash))) {
            return res.status(401).json({ message: "Email or password is incorrect." });
        }

        const token = await createSession(store._id);
        res.status(200).json({ token, user: publicStore(store) });
    } catch (error) {
        res.status(500).json({
            message: "Could not sign in",
            error: error.message
        });
    }
};

const getCurrentStore = (req, res) => {
    res.status(200).json({ user: publicStore(req.store) });
};

const updateProfile = async (req, res) => {
    const { storeName, adminName, email } = req.body || {};
    if (!validateProfile({ storeName, adminName, email })) {
        return res.status(400).json({ message: "Enter a valid store name, name, and email." });
    }

    try {
        const store = await Store.findByIdAndUpdate(
            req.storeId,
            {
                $set: {
                    storeName: storeName.trim(),
                    adminName: adminName.trim(),
                    email: email.trim().toLowerCase()
                }
            },
            { returnDocument: "after", runValidators: true }
        );
        res.status(200).json({ user: publicStore(store) });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }
        res.status(500).json({
            message: "Could not update your account",
            error: error.message
        });
    }
};

const logout = async (req, res) => {
    try {
        await Session.deleteOne({ _id: req.sessionId });
        res.status(200).json({ message: "Signed out successfully." });
    } catch (error) {
        res.status(500).json({
            message: "Could not sign out",
            error: error.message
        });
    }
};

module.exports = { register, login, getCurrentStore, updateProfile, logout };
