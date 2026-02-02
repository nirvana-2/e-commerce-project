const User = require("../models/users");
const Order = require("../models/Order");

exports.getDashboardStats = async (req, res) => {
    try {
        // Runs all queries simultaneously for better performance
        const [totalOrders, pendingOrders, totalUsers, revenueData] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ status: { $regex: /^pending$/i } }), // Case-insensitive
            User.countDocuments(),
            Order.aggregate([
                { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
            ])
        ]);

        res.status(200).json({
            success: true,
            totalOrders,
            totalUsers,
            pendingOrders,
            totalRevenue: revenueData[0]?.totalSales || 0
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email") 
            .populate("products.product") 
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json({ totalUsers: users.length, users });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};