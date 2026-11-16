
require("dotenv").config();
const Product = require("./models/product.js");
const express= require("express");
const mongoose = require("mongoose");
const { calculateDaysRemaining, calculateReorderPoint,calculateSuggestedOrder} = require("./utils/inventoryUtils");
const cors = require("cors");

const productRoutes = require("./routes/productRoutes");
const salesRoutes = require("./routes/salesRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app=express();
app.use(cors());
app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/products", salesRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", orderRoutes);
const PORT = process.env.PORT || 5000;

// Sample products for learning
const products = [
    { id: 1, name: "Notebook", stock: 50, price: 40 },
    { id: 2, name: "Pen", stock: 100, price: 10 },
    { id: 3, name: "Water Bottle", stock: 8, price: 150 }
];

//home route
app.get("/",(req,res)=>{
    res.send("welcome to stockpilot backend!");
});


// Get a number of products
app.get("/api/products/count", async (req, res) => {
    try {
        const count = await Product.countDocuments();

        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({
            message: "Failed to count products",
            error: error.message
        });
    }
});


app.get("/api/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        // console.log("Requested ID:", req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(400).json({
            message: "Invalid product ID",
            error: error.message
        });
    }
});



app.put("/api/products/:id", async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        res.status(400).json({
            message: "Failed to update product",
            error: error.message
        });
    }
});




mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });