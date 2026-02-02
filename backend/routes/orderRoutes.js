const express = require('express');
const router = express.Router();
const { verifyToken,isAdmin } = require("../middleware/auth");
const { placeOrder, getUserOrders,updateOrderStatus,checkReviewEligibility} = require("../controllers/orderController");

// POST /api/orders -> Place an order
router.post('/', verifyToken, placeOrder);

// GET /api/orders/my-orders -> Get user history
// I added /my-orders to match your frontend API call
router.get('/my-orders', verifyToken, getUserOrders);
//to move the progress bar from your UI
router.put("/admin/status/:id", verifyToken, isAdmin, updateOrderStatus);
router.get('/check-review-eligibility/:productId', checkReviewEligibility);

module.exports = router;