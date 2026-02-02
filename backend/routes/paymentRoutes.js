const express = require("express");
const router = express.Router();
const { initiateEsewa, verifyEsewa, cancelOrder } = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/auth");

/**
 * @swagger
 * /api/payment/initiate-esewa:
 *   post:
 *     summary: Initiate eSewa payment
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - amount
 *             properties:
 *               orderId:
 *                 type: string
 *                 example: "ORD123456"
 *               amount:
 *                 type: number
 *                 example: 1500
 *               productName:
 *                 type: string
 *                 example: "Order Payment"
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 paymentUrl:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid payment data
 */
router.post("/initiate-esewa", initiateEsewa);

/**
 * @swagger
 * /api/payment/verify-esewa:
 *   get:
 *     summary: Verify eSewa transaction
 *     tags: [Payment]
 *     parameters:
 *       - in: query
 *         name: oid
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *       - in: query
 *         name: amt
 *         required: true
 *         schema:
 *           type: number
 *         description: Transaction amount
 *       - in: query
 *         name: refId
 *         required: true
 *         schema:
 *           type: string
 *         description: eSewa reference ID
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 order:
 *                   type: object
 *       400:
 *         description: Verification failed
 *       404:
 *         description: Order not found
 */
router.get("/verify-esewa", verifyEsewa);

/**
 * @swagger
 * /api/payment/cancel-order/{orderId}:
 *   delete:
 *     summary: Cancel an order
 *     tags: [Payment]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID to cancel
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Order not found
 *       400:
 *         description: Cannot cancel order
 */
router.delete("/cancel-order/:orderId", cancelOrder);

module.exports = router;