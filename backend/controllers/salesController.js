const Product = require("../models/product.js");

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

        // Find product
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Check available stock
        if (product.stock < quantity) {
            return res.status(400).json({
                message: "Insufficient stock",
                availableStock: product.stock
            });
        }

        // Reduce stock
        product.stock -= quantity;
        await product.save();

        res.status(200).json({
            message: "Sale recorded successfully",
            product
        });
    } catch (error) {
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