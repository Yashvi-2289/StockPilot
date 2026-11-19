const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            index: true
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        productName: {
            type: String,
            required: true,
            trim: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: "Order quantity must be a whole number"
            }
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            enum: ["Pending", "Restocking", "Received"],
            default: "Pending"
        }
    },
    { timestamps: true }
);

module.exports =
    mongoose.models.Order || mongoose.model("Order", orderSchema);
