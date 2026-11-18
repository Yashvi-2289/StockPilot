const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: "Sale quantity must be a whole number"
            }
        }
    },
    { timestamps: true }
);

module.exports =
    mongoose.models.Sale || mongoose.model("Sale", saleSchema);
