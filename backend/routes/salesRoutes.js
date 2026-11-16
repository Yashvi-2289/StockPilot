const express = require("express");
const router = express.Router();

const { recordSale } = require("../controllers/salesController");

router.post("/:id/sales", recordSale);

module.exports = router;