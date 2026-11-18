const Product = require("../models/product.js");
const Sale = require("../models/Sale.js");
const mongoose = require("mongoose");
const {
    calculateAverageDailySales,
    getSalesTotalsByProduct
} = require("../utils/salesUtils");

// RECORD SALE
const recordSale = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        // Validate quantity
        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be a positive integer"
            });
        }

        let session;
        let product;

        try {
            session = await mongoose.startSession();
            await session.withTransaction(async () => {
                product = await Product.findById(id).session(session);

                if (!product) {
                    const error = new Error("Product not found");
                    error.statusCode = 404;
                    throw error;
                }

                if (product.stock < quantity) {
                    const error = new Error("Insufficient stock");
                    error.statusCode = 400;
                    error.availableStock = product.stock;
                    throw error;
                }

                product.stock -= quantity;
                await Sale.create(
                    [{ productId: product._id, quantity }],
                    { session }
                );

                const totalsByProduct = await getSalesTotalsByProduct(
                    [product._id],
                    session
                );
                const totals = totalsByProduct.get(String(product._id));
                product.averageDailySales = calculateAverageDailySales(
                    totals.totalQuantity,
                    totals.firstSaleDate
                );
                await product.save({ session });
            });
        } finally {
            if (session) {
                await session.endSession();
            }
        }

        res.status(200).json({
            message: "Sale recorded successfully",
            product
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({
                message: error.message,
                ...(error.availableStock === undefined
                    ? {}
                    : { availableStock: error.availableStock })
            });
        }

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        res.status(500).json({
            message: "Failed to record sale",
            error: error.message
        });
    }
};

module.exports = { recordSale };