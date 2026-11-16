const express = require("express");
const router = express.Router();

const { getAllProducts,getProductById,createProduct, updateProduct, deleteProduct} = require("../controllers/productController");

// GET all products
router.get("/", getAllProducts);

// GET product by ID
router.get("/:id", getProductById);

// UPDATE product
router.put("/:id", updateProduct);

// CREATE product
router.post("/", createProduct);

// DELETE product
router.delete("/:id", deleteProduct);

module.exports = router;