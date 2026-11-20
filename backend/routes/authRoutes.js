const express = require("express");
const requireStore = require("../middleware/requireStore");
const {
    register,
    login,
    requestPasswordReset,
    resetPassword,
    getCurrentStore,
    updateProfile,
    changePassword,
    logout
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.get("/me", requireStore, getCurrentStore);
router.put("/profile", requireStore, updateProfile);
router.put("/password", requireStore, changePassword);
router.post("/logout", requireStore, logout);

module.exports = router;
