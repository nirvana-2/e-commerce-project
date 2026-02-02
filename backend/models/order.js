const mongoose = require('mongoose')

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true }
    }],
    // --- FINANCIAL CALCULATIONS ---
    subTotal: { type: Number, required: true }, // Price before discount
    discount: { type: Number, default: 0 },    // The ₹ value (Points used * 10)
    totalAmount: { type: Number, required: true }, // Final price (subTotal - discount + shipping)
    shippingPrice: { type: Number, default: 0 },
    
    // --- STYLE PERKS TRACKING ---
    usePoints: { type: Boolean, default: false },
    pointsUsed: { type: Number, default: 0 },   // How many points the user spent
    pointsEarned: { type: Number, default: 0 }, // Points they will get (totalAmount / 1000)

    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },

    // Payment Tracking
    paymentMethod: {
        type: String,
        required: true,
        enum: ["COD", "eSewa"]
    },
    paymentStatus: {
        type: String,
        default: "unpaid",
        enum: ["unpaid", "paid"]
    },

    // Fulfillment Status
    status: {
        type: String,
        default: "pending",
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"]
    },

    statusTimeline: {
        processingAt: { type: Date, default: null },
        shippedAt: { type: Date, default: null },
        deliveredAt: { type: Date, default: null }
    },
    createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema)