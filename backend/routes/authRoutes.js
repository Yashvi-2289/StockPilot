const express = require("express");
const requireStore = require("../middleware/requireStore");
const {
    register,
    login,
    getCurrentStore,
    updateProfile,
    logout
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireStore, getCurrentStore);
router.put("/profile", requireStore, updateProfile);
router.post("/logout", requireStore, logout);

module.exports = router;
