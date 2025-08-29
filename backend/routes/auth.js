const express = require("express");
const { login, register } = require("../controllers/authController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Public
router.post("/login", login);
router.post("/register", register);

// Protected
router.get("/profile", protect, (req, res) => {
  res.json({ message: "User profile", user: req.user });
});

// Admin only
router.get("/admin-data", protect, admin, (req, res) => {
  res.json({ message: "Secret admin data" });
});

module.exports = router;
