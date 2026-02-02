const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const { getProducts, addProducts,getProductById,createProductReview ,updateProduct } = require("../controllers/productController");

router.get("/", getProducts); 
router.post("/", verifyToken, isAdmin, addProducts);
// This is public, so no verifyToken or isAdmin is needed here
router.get("/:id", getProductById);
// Add this to your product routes file
router.post("/:id/reviews",verifyToken, createProductReview);
// 1. Verify who they are (verifyToken)
// 2. Check if they are an Admin (isAdmin)
router.put("/:id", verifyToken, isAdmin, updateProduct);

module.exports = router;