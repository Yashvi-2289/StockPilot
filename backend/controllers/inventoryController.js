const Product = require("../models/product.js");

const {
    calculateDaysRemaining,
    calculateReorderPoint,
    calculateSuggestedOrder
} = require("../utils/inventoryUtils");

// GET inventory summary
const getInventorySummary = async (req, res) => {
    try {
        const products = await Product.find();

        const summary = products.map((product) => {
            const reorderPoint = calculateReorderPoint(
                product.averageDailySales,
                product.leadTimeDays,
                product.safetyStock
            );

            return {
                id: product._id,
                name: product.name,
                stock: product.stock,
                averageDailySales: product.averageDailySales,
                leadTimeDays: product.leadTimeDays,
                safetyStock: product.safetyStock,

                daysRemaining: calculateDaysRemaining(
                    product.stock,
                    product.averageDailySales
                ),

                reorderPoint,
                lowStock: product.stock <= reorderPoint,

                suggestedOrder: calculateSuggestedOrder(
                    product.stock,
                    product.averageDailySales,
                    product.leadTimeDays,
                    product.safetyStock
                )
            };
        });

        res.status(200).json(summary);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch inventory summary",
            error: error.message
        });
    }
};

module.exports = { getInventorySummary };