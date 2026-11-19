const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true,
        index: true
    },
    tokenHash: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }
    }
});

module.exports =
    mongoose.models.Session || mongoose.model("Session", sessionSchema);
