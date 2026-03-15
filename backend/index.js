const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/userRoutes");
const { swaggerUi, specs } = require('./swagger');




// 1️⃣ Configuration
dotenv.config();
const app = express();
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// 2️⃣ Middleware & CORS
// We include both localhost and 127.0.0.1 to prevent browser mismatches
app.use(cors({
    origin: ["http://localhost:5173", "https://nirvana-2.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(express.json());



// 3️⃣ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// 4️⃣ Routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
//product route
const productRoutes = require('./routes/productRoutes');
app.use("/api/products", productRoutes);
//cart route
app.use("/api/cart", cartRoutes);
//order route
app.use("/api/orders", orderRoutes);
// Register Payment Routes

app.use("/api/payment", paymentRoutes);
//user route
app.use("/api/users", userRoutes);


// 5️⃣ Test route
app.get("/", (req, res) => res.send("Backend running"));

// 6️⃣ Catch-all (Fixed for path-to-regexp v8)
// We use a middleware function without a string path to avoid syntax errors
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// 7️⃣ Start server
// 7️⃣ Start server
const PORT = process.env.PORT || 3000;
console.log("Swagger paths detected:", Object.keys(specs.paths));
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});