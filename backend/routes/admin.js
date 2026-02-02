const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, isAdmin } = require("../middleware/auth");

// Admin routes
router.get("/users", verifyToken, isAdmin, adminController.getAllUsers);
//get all orders
router.get("/orders", verifyToken, isAdmin, adminController.getAllOrders);
//get summary stats
router.get("/stats", verifyToken, isAdmin, adminController.getDashboardStats);
module.exports = router;
