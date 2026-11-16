const express = require("express");
const router = express.Router();

const {
    getOrders,
    createOrder,
    restockOrder
} = require("../controllers/orderController");

router.get("/", getOrders);
router.post("/", createOrder);
router.post("/:id/restock", restockOrder);

module.exports = router;
