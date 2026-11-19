
require("dotenv").config();
const Product = require("./models/product.js");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const salesRoutes = require("./routes/salesRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const orderRoutes = require("./routes/orderRoutes");
const requireStore = require("./middleware/requireStore");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
const PORT = process.env.PORT || 5000;

app.get("/api/products/count", requireStore, async (req, res) => {
    try {
        const count = await Product.countDocuments({ storeId: req.storeId });
        res.status(200).json({ count });
    } catch (error) {
        res.status(500).json({
            message: "Failed to count products",
            error: error.message
        });
    }
});

app.use("/api/products", requireStore, productRoutes);
app.use("/api/products", requireStore, salesRoutes);
app.use("/api/inventory", requireStore, inventoryRoutes);
app.use("/api/orders", requireStore, orderRoutes);

//home route
app.get("/", (req, res) => {
    res.send("welcome to stockpilot backend!");
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