const Order = require("../models/Order");
const Product = require("../models/product");

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ status: "Pending" })
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch orders",
            error: error.message
        });
    }
};

const restockOrder = async (req, res) => {
    let order;
    let stockIncremented = false;

    try {
        order = await Order.findOneAndUpdate(
            { _id: req.params.id, status: "Pending" },
            { $set: { status: "Restocking" } },
            { new: true }
        );

        if (!order) {
            const existingOrder = await Order.findById(req.params.id);
            if (!existingOrder) {
                return res.status(404).json({ message: "Order not found" });
            }

            return res.status(409).json({
                message:
                    existingOrder.status === "Received"
                        ? "This order has already been restocked"
                        : "This order is already being processed"
            });
        }

        const product = await Product.findByIdAndUpdate(
            order.productId,
            { $inc: { stock: order.quantity } },
            { returnDocument: "after", runValidators: true }
        );

        if (!product) {
            await Order.updateOne(
                { _id: order._id, status: "Restocking" },
                { $set: { status: "Pending" } }
            );
            return res.status(404).json({ message: "Product not found" });
        }
        stockIncremented = true;

        const receivedOrder = await Order.findOneAndUpdate(
            { _id: order._id, status: "Restocking" },
            { $set: { status: "Received" } },
            { new: true }
        );

        if (!receivedOrder) {
            throw new Error("Could not complete the restock operation");
        }
        stockIncremented = false;

        res.status(200).json({
            message: "Order restocked successfully",
            order: receivedOrder,
            product
        });
    } catch (error) {
        if (stockIncremented && order) {
            try {
                const rollback = await Product.updateOne(
                    { _id: order.productId },
                    { $inc: { stock: -order.quantity } }
                );

                if (rollback.matchedCount !== 1) {
                    throw new Error("Product was not available for rollback");
                }
            } catch (rollbackError) {
                return res.status(500).json({
                    message: "Restock failed and inventory could not be rolled back",
                    error: error.message,
                    rollbackError: rollbackError.message
                });
            }
        }

        if (order) {
            try {
                await Order.updateOne(
                    { _id: order._id, status: "Restocking" },
                    { $set: { status: "Pending" } }
                );
            } catch (resetError) {
                return res.status(500).json({
                    message: "Restock failed and order could not be reset",
                    error: error.message,
                    resetError: resetError.message
                });
            }
        }

        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid order ID" });
        }

        res.status(500).json({
            message: "Failed to restock order",
            error: error.message
        });
    }
};

const createOrder = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                message: "Order quantity must be a positive whole number"
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const order = await Order.create({
            productId: product._id,
            productName: product.name,
            quantity,
            unitPrice: product.price
        });

        res.status(201).json({
            message: "Order placed successfully",
            order
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        res.status(500).json({
            message: "Failed to place order",
            error: error.message
        });
    }
};

module.exports = { getOrders, createOrder, restockOrder };
