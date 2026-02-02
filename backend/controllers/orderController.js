const Order = require("../models/Order");
const Cart = require("../models/cart");
const Product = require("../models/product");
const User = require("../models/users"); // Added for Rewards Logic
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// 1. Place a new order
const placeOrder = async (req, res) => {
  try {
    const { 
      userId, 
      items, 
      fullName, 
      phoneNumber, 
      address, 
      shippingPrice, 
      paymentMethod, 
      usePoints 
    } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in order" });
    }

    // Fetch User for Reward Logic
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Calculate Financials
    let subTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    let discount = 0;
    let pointsToDeduct = 0;

    // ✅ STYLE PERKS LOGIC: 10 point minimum (1 Point = 10 Rs Discount)
    if (usePoints) {
      if (user.rewards.points >= 10) {
        discount = user.rewards.points * 10; 
        
        // Safety: Discount can't exceed the subtotal
        if (discount > subTotal) {
          discount = subTotal;
        }
        pointsToDeduct = discount / 10;
      } else {
        return res.status(400).json({ 
          success: false, 
          message: `Minimum 10 points required to redeem. You have ${user.rewards.points}.` 
        });
      }
    }

    const finalTotal = subTotal - discount + (shippingPrice || 0);

    // Format products for Order Schema
    const formattedProducts = items.map(item => ({
      product: item.product._id || item.product,
      quantity: item.quantity || 1,
      price: item.price // Locking price at time of purchase
    }));

    const newOrder = new Order({
      user: userId,
      products: formattedProducts,
      subTotal,
      discount,
      totalAmount: finalTotal,
      fullName: fullName || "Customer",
      phoneNumber: phoneNumber || "0000000000",
      address,
      shippingPrice: shippingPrice || 0,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: "unpaid",
      status: 'pending',
      pointsUsed: pointsToDeduct,
      pointsEarned: Math.floor(finalTotal / 1000) // ✅ 1000 Rs = 1 Point
    });

    const savedOrder = await newOrder.save();

    // ✅ DEDUCT POINTS: From user wallet immediately if used
    if (pointsToDeduct > 0) {
      // Use $inc with a negative value to be safer than direct assignment
      await User.findByIdAndUpdate(userId, { 
        $inc: { "rewards.points": -pointsToDeduct } 
      });
    }

    // ✅ STOCK LOGIC: 
    // Subtract stock now if COD. eSewa waits for verification controller.
    if (paymentMethod !== "eSewa") {
      const stockUpdates = formattedProducts.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: -item.quantity } },
        },
      }));
      await Product.bulkWrite(stockUpdates);
    }

    // ✅ CLEAR CART
    await Cart.findOneAndDelete({ user: userId });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: savedOrder
    });

  } catch (error) {
    console.error("PLACE ORDER CRASH:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get user's order history
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Cleanup: Remove stale unpaid eSewa orders (older than 5 mins)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await Order.deleteMany({
      user: userId,
      paymentMethod: "eSewa",
      paymentStatus: "unpaid",
      createdAt: { $lt: fiveMinutesAgo }
    });

    const orders = await Order.find({ user: userId })
      .populate({
        path: 'products.product',
        select: 'name image category'
      })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// 3. Update Order Status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body; 
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.status === "delivered") {
      return res.status(400).json({ success: false, message: "Order already delivered" });
    }

    // Stock logic for eSewa (if status moves to processing)
    if (status === "processing" && order.status === "pending" && order.paymentMethod === "eSewa") {
      for (const item of order.products) {
        const product = await Product.findById(item.product);
        if (product && product.stock < item.quantity) {
          return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
        }
        if (product) {
          product.stock -= item.quantity;
          await product.save();
        }
      }
    }

    // Update Status and Timestamps
    order.status = status;
    if (status === "shipped") order.statusTimeline.shippedAt = Date.now();
    
    if (status === "delivered") {
      order.statusTimeline.deliveredAt = Date.now();
      
      // ✅ STYLE PERKS: Officially award points to User on delivery
      if (order.pointsEarned > 0) {
        await User.findByIdAndUpdate(order.user, {
          $inc: { "rewards.points": order.pointsEarned }
        });
      }
    }

    await order.save();
    res.status(200).json({ success: true, message: `Status updated to ${status}`, order });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const checkReviewEligibility = async (req, res) => {
  try {
    const { productId } = req.params;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(200).json({ eligible: false });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const order = await Order.findOne({
      user: new mongoose.Types.ObjectId(userId),
      "products.product": new mongoose.Types.ObjectId(productId),
      $or: [
        { paymentStatus: "paid" }, 
        { status: "delivered" }
      ]
    });

    return res.status(200).json({ eligible: !!order });
  } catch (error) {
    return res.status(200).json({ eligible: false });
  }
};

module.exports = { 
  placeOrder, 
  getUserOrders, 
  updateOrderStatus, 
  checkReviewEligibility 
};