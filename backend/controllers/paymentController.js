const crypto = require("crypto");
const Order = require("../models/Order");
const Product = require("../models/product");
const Cart = require("../models/cart");
const User = require("../models/users"); // ✅ Ensure User model is imported

// 1. INITIATE PAYMENT
exports.initiateEsewa = async (req, res) => {
    try {
        // ✅ Added usePoints to the destructuring
        const { userId, items, subTotal, totalAmount, address, fullName, phoneNumber, usePoints } = req.body;

        if (!totalAmount) {
            return res.status(400).json({ success: false, message: "totalAmount is missing" });
        }

        const newOrder = new Order({
            user: userId,
            products: items,
            totalAmount: totalAmount,
            subTotal,
            address,
            fullName,
            phoneNumber,
            paymentMethod: "eSewa",
            paymentStatus: "unpaid",
            status: "pending",
            usePoints: usePoints // ✅ Save this to the order
        });

        const savedOrder = await newOrder.save();

        // ✅ LOGIC: Deduct points from user immediately if they chose to use them
        if (usePoints) {
            const user = await User.findById(userId);
            // Deduct ALL current points because they are being used for this discount
            await User.findByIdAndUpdate(userId, { $set: { "rewards.points": 0 } }); 
            newOrder.pointsUsed = user.rewards.points; // Save how many were used
        }

        const formattedAmount = String(Math.floor(Number(totalAmount)));
        const transaction_uuid = `${savedOrder._id}-${Date.now()}`;
        const product_code = "EPAYTEST";
        const secret_key = "8gBm/:&EnhH.1/q";

        const signatureString = `total_amount=${formattedAmount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

        const signature = crypto
            .createHmac("sha256", secret_key)
            .update(signatureString)
            .digest("base64");

        res.status(200).json({
            success: true,
            payment_data: {
                amount: formattedAmount,
                tax_amount: "0",
                total_amount: formattedAmount,
                transaction_uuid,
                product_code,
                signature,
                signed_field_names: "total_amount,transaction_uuid,product_code",
                success_url: "http://localhost:5173/payment-success",
                failure_url: `http://localhost:5173/cart?status=cancel&oid=${savedOrder._id}`,
                product_service_charge: "0",
                product_delivery_charge: "0",
            }
        });
    } catch (err) {
        console.error("Initiation Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

// 2. VERIFY PAYMENT
// 2. VERIFY PAYMENT
exports.verifyEsewa = async (req, res) => {
    const { data } = req.query;
    try {
        if (!data) return res.status(400).json({ success: false, message: "No data received" });

        const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));

        if (decodedData.status !== "COMPLETE") {
            return res.status(400).json({ success: false, message: "Transaction not complete" });
        }

        const orderId = decodedData.transaction_uuid.split('-')[0];
        const order = await Order.findById(orderId);

        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        // Initialize earnedPoints to show even if order was already processed
        let earnedPoints = Math.floor(Number(order.totalAmount) / 100);

        if (order.paymentStatus !== "paid") {
            // Update Stock
            const stockUpdates = order.products.map(item => ({
                updateOne: {
                    filter: { _id: item.product },
                    update: { $inc: { stock: -item.quantity } },
                }
            }));
            await Product.bulkWrite(stockUpdates);

            // ✅ LOGIC: Calculate Rewards
            // We use the earnedPoints variable calculated above
            await User.findByIdAndUpdate(order.user, { 
                $inc: { "rewards.points": earnedPoints } 
            });

            // ✅ REPAIR: Save the points to the Order document so frontend can see it
            order.pointsEarned = earnedPoints; 
            order.paymentStatus = "paid";
            order.status = "processing";
            await order.save();

            // Clear Cart
            await Cart.findOneAndDelete({ user: order.user });
        }

        // ✅ REPAIR: Send earnedPoints back to frontend in the response
        res.status(200).json({ 
            success: true, 
            earnedPoints: earnedPoints 
        });
    } catch (err) {
        console.error("Verification Error:", err.message);
        res.status(500).json({ success: false, message: "Verification failed" });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const deletedOrder = await Order.findOneAndDelete({
            _id: orderId,
            paymentStatus: "unpaid"
        });

        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: "Order not found or already paid" });
        }

        res.status(200).json({ success: true, message: "Order deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};