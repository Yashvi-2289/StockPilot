const Product = require("../models/product.js");
const { refreshAverageDailySales } = require("../utils/salesUtils");

// GET all products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ storeId: req.storeId });
        await refreshAverageDailySales(products, req.storeId);

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message
        });
    }
};

// GET product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findOne({ _id: id, storeId: req.storeId });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        await refreshAverageDailySales([product], req.storeId);

        res.status(200).json(product);
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        res.status(500).json({
            message: "Failed to fetch product",
            error: error.message
        });
    }
};

// CREATE product
const createProduct = async (req, res) => {
    try {
        const {
            name,
            stock,
            price,
            leadTimeDays,
            safetyStock
        } = req.body;

        const product = await Product.create({
            name,
            stock,
            price,
            leadTimeDays,
            safetyStock,
            storeId: req.storeId
        });

        res.status(201).json({
            message: "Product created successfully",
            product
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid product data",
                error: error.message
            });
        }

        res.status(500).json({
            message: "Failed to create product",
            error: error.message
        });
    }
};

// UPDATE product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const updates = { ...req.body };
        delete updates.averageDailySales;
        delete updates.storeId;
        delete updates._id;

        const product = await Product.findOneAndUpdate(
            { _id: id, storeId: req.storeId },
            updates,
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product updated successfully",
            product
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Invalid product data",
                error: error.message
            });
        }

        res.status(500).json({
            message: "Failed to update product",
            error: error.message
        });
    }
};

// DELETE product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findOneAndDelete({
            _id: id,
            storeId: req.storeId
        });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product deleted successfully",
            product
        });
    } catch (error) {
        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid product ID"
            });
        }

        res.status(500).json({
            message: "Failed to delete product",
            error: error.message
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};