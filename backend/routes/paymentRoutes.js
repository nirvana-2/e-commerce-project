const express = require("express");
const router = express.Router();
const { initiateEsewa, verifyEsewa, cancelOrder } = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/auth"); // Using your specific middleware name

// Step 1: Frontend calls this to create a pending order and get the eSewa signature
router.post("/initiate-esewa", initiateEsewa);

// Step 2: eSewa redirects the user here after payment. 
// Note: No verifyToken here because the request comes from eSewa's redirect, not your frontend app.
router.get("/verify-esewa", verifyEsewa);

router.delete("/cancel-order/:orderId", cancelOrder);

module.exports = router;