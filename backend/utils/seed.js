const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const reviewSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, name: String, rating: Number, comment: String }, { timestamps: true });
const productSchema = new mongoose.Schema({ name: { type: String, required: true }, description: String, price: { type: Number, required: true }, image: String, stock: { type: Number, required: true }, category: { type: String, required: true, lowercase: true }, subCategory: { type: String, lowercase: true, trim: true, default: "" }, reviews: [reviewSchema], numReviews: { type: Number, default: 0 }, averageRating: { type: Number, default: 0 } }, { timestamps: true });
const userSchema = new mongoose.Schema({ name: { type: String, required: true }, email: { type: String, required: true, unique: true }, password: { type: String, required: true }, phoneNumber: { type: String, default: "" }, address: { type: String, default: "" }, role: { type: String, enum: ["user", "admin"], default: "user" }, resetPasswordToken: String, resetPasswordTokenExpiry: Date, rewards: { points: { type: Number, default: 0 } }, isVerified: { type: Boolean, default: false } }, { timestamps: true });
const cartSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, products: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, quantity: { type: Number, default: 1 } }], total: { type: Number, default: 0 }, status: { type: String, enum: ["Pending", "Completed"], default: "Pending" } }, { timestamps: true });
const orderSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, products: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, quantity: { type: Number, required: true } }], subTotal: { type: Number, required: true }, discount: { type: Number, default: 0 }, totalAmount: { type: Number, required: true }, shippingPrice: { type: Number, default: 0 }, usePoints: { type: Boolean, default: false }, pointsUsed: { type: Number, default: 0 }, pointsEarned: { type: Number, default: 0 }, fullName: { type: String, required: true }, phoneNumber: { type: String, required: true }, address: { type: String, required: true }, paymentMethod: { type: String, required: true, enum: ["COD", "eSewa"] }, paymentStatus: { type: String, default: "unpaid", enum: ["unpaid", "paid"] }, status: { type: String, default: "pending", enum: ["pending", "processing", "shipped", "delivered", "cancelled"] }, statusTimeline: { processingAt: Date, shippedAt: Date, deliveredAt: Date }, createdAt: { type: Date, default: Date.now } });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

const productsData =
    [
        { name: 'Nike Running T-Shirt', description: 'Lightweight breathable shirt for running.', price: 1299, stock: 80, category: 'clothing', subCategory: 'shirt', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500' },
        { name: 'Levi Slim Fit Jeans', description: 'Classic slim fit jeans in blue wash.', price: 3499, stock: 60, category: 'clothing', subCategory: 'pants', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500' },
        { name: 'Zip Up Hoodie', description: 'Warm fleece zip-up hoodie for cold days.', price: 2999, stock: 50, category: 'clothing', subCategory: 'hoodies', image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500' },
        { name: 'Polo Shirt', description: 'Classic polo shirt for casual wear.', price: 1599, stock: 70, category: 'clothing', subCategory: 'shirt', image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500' },
        { name: 'Cargo Pants', description: 'Comfortable cargo pants with multiple pockets.', price: 2799, stock: 45, category: 'clothing', subCategory: 'pants', image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500' },
        { name: 'Pullover Hoodie', description: 'Cozy pullover hoodie in multiple colors.', price: 2499, stock: 55, category: 'clothing', subCategory: 'hoodies', image: 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=500' },
        { name: 'iPhone 15 Pro', description: 'Latest Apple smartphone with A17 Pro chip.', price: 159999, stock: 25, category: 'electronics', subCategory: 'mobile', image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500' },
        { name: 'Samsung Galaxy S24', description: 'Flagship Android phone with AI features.', price: 124999, stock: 30, category: 'electronics', subCategory: 'mobile', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500' },
        { name: 'MacBook Air M3', description: 'Ultra-thin laptop powered by Apple M3 chip.', price: 189999, stock: 15, category: 'electronics', subCategory: 'laptop', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500' },
        { name: 'Dell XPS 15', description: 'Premium Windows laptop with OLED display.', price: 179999, stock: 12, category: 'electronics', subCategory: 'laptop', image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500' },
        { name: 'Sony WH-1000XM5', description: 'Industry-leading noise cancelling headphones.', price: 34999, stock: 40, category: 'electronics', subCategory: 'accessories', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500' },
        { name: 'Apple Watch Series 9', description: 'Advanced smartwatch with health monitoring.', price: 59999, stock: 35, category: 'electronics', subCategory: 'accessories', image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500' },
        { name: 'PlayStation 5', description: 'Next-gen gaming console with 4K gaming.', price: 89999, stock: 20, category: 'gaming', subCategory: 'console', image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500' },
        { name: 'Xbox Series X', description: 'Microsofts most powerful gaming console.', price: 84999, stock: 18, category: 'gaming', subCategory: 'console', image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500' },
        { name: 'RTX 4070 GPU', description: 'High performance graphics card for PC gaming.', price: 79999, stock: 10, category: 'gaming', subCategory: 'pc components', image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500' },
        { name: 'AMD Ryzen 9 CPU', description: 'High-end processor for gaming and content creation.', price: 54999, stock: 15, category: 'gaming', subCategory: 'pc components', image: 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=500' },
        { name: 'FIFA 25', description: 'Latest FIFA football simulation game.', price: 5999, stock: 50, category: 'gaming', subCategory: 'games', image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=500' },
        { name: 'Instant Pot Duo', description: 'Multi-use pressure cooker and slow cooker.', price: 8999, stock: 30, category: 'home', subCategory: 'kitchen', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500' },
        { name: 'Nespresso Coffee Machine', description: 'Premium coffee machine with one-touch brewing.', price: 14999, stock: 20, category: 'home', subCategory: 'kitchen', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500' },
        { name: 'Ergonomic Office Chair', description: 'Comfortable ergonomic chair for long work hours.', price: 24999, stock: 15, category: 'home', subCategory: 'furniture', image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500' },
        { name: 'Bookshelf 5-Tier', description: 'Modern 5-tier wooden bookshelf.', price: 12999, stock: 20, category: 'home', subCategory: 'furniture', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500' },
        { name: 'Scented Candle Set', description: 'Set of 6 luxury scented candles.', price: 1999, stock: 80, category: 'home', subCategory: 'decor', image: 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=500' },
        { name: 'Vitamin C Serum', description: 'Brightening vitamin C serum for glowing skin.', price: 1799, stock: 60, category: 'beauty', subCategory: 'skincare', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500' },
        { name: 'Hydrating Moisturizer', description: 'Lightweight daily moisturizer with SPF 30.', price: 1299, stock: 70, category: 'beauty', subCategory: 'skincare', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500' },
        { name: 'Lipstick Collection', description: 'Long-lasting matte lipstick in 12 shades.', price: 999, stock: 90, category: 'beauty', subCategory: 'makeup', image: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2f37?w=500' },
        { name: 'Foundation SPF 15', description: 'Full coverage foundation with sun protection.', price: 1499, stock: 65, category: 'beauty', subCategory: 'makeup', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500' },
        { name: 'Yoga Mat Premium', description: 'Non-slip 6mm thick yoga mat.', price: 1499, stock: 75, category: 'sports', subCategory: 'equipment', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500' },
        { name: 'Adjustable Dumbbells', description: 'Space-saving adjustable dumbbells set.', price: 24999, stock: 20, category: 'sports', subCategory: 'equipment', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500' },
        { name: 'Nike Running Shoes', description: 'Lightweight breathable running shoes.', price: 8999, stock: 50, category: 'sports', subCategory: 'shoes', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500' },
        { name: 'Adidas Training Shoes', description: 'Versatile training shoes for gym workouts.', price: 7499, stock: 45, category: 'sports', subCategory: 'shoes', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500' },
    ];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        await Promise.all([Product.deleteMany({}), User.deleteMany({}), Cart.deleteMany({}), Order.deleteMany({})]);
        console.log('🗑️  Cleared all collections');

        const products = await Product.insertMany(productsData);
        console.log(`🛍️  Seeded ${products.length} products`);

        // ✅ Simple passwords
        const adminPass = await bcrypt.hash('admin123', 10);
        const userPass = await bcrypt.hash('user1234', 10);

        const usersData = [
            { name: "Admin User", email: "admin@myshop.com", password: adminPass, role: "admin", phoneNumber: "9800000001", address: "Kathmandu, Nepal", isVerified: true, rewards: { points: 0 } },
            { name: "Saman Shakya", email: "saman@example.com", password: userPass, role: "user", phoneNumber: "9800000002", address: "Lalitpur, Nepal", isVerified: true, rewards: { points: 500 } },
            { name: "Priya Sharma", email: "priya@example.com", password: userPass, role: "user", phoneNumber: "9800000003", address: "Bhaktapur, Nepal", isVerified: true, rewards: { points: 200 } },
            { name: "Rahul Thapa", email: "rahul@example.com", password: userPass, role: "user", phoneNumber: "9800000004", address: "Pokhara, Nepal", isVerified: true, rewards: { points: 150 } },
            { name: "Anita Rai", email: "anita@example.com", password: userPass, role: "user", phoneNumber: "9800000005", address: "Chitwan, Nepal", isVerified: true, rewards: { points: 300 } },
        ];
        const users = await User.insertMany(usersData);
        console.log(`👥 Seeded ${users.length} users`);

        const regularUsers = users.filter(u => u.role === 'user');
        const cartsData = regularUsers.map((user, i) => ({
            user: user._id,
            products: [
                { product: products[i * 2]._id, quantity: 1 },
                { product: products[i * 2 + 1]._id, quantity: 2 },
            ],
            total: products[i * 2].price + products[i * 2 + 1].price * 2,
            status: "Pending"
        }));
        const carts = await Cart.insertMany(cartsData);
        console.log(`🛒 Seeded ${carts.length} carts`);

        const ordersData = [
            { user: regularUsers[0]._id, products: [{ product: products[0]._id, quantity: 1 }], subTotal: products[0].price, discount: 0, totalAmount: products[0].price + 200, shippingPrice: 200, fullName: regularUsers[0].name, phoneNumber: "9800000002", address: "Lalitpur, Nepal", paymentMethod: "eSewa", paymentStatus: "paid", status: "delivered", statusTimeline: { processingAt: new Date('2026-03-01'), shippedAt: new Date('2026-03-02'), deliveredAt: new Date('2026-03-04') }, pointsEarned: Math.floor(products[0].price / 1000), createdAt: new Date('2026-03-01') },
            { user: regularUsers[1]._id, products: [{ product: products[7]._id, quantity: 2 }, { product: products[8]._id, quantity: 1 }], subTotal: products[7].price * 2 + products[8].price, discount: 0, totalAmount: products[7].price * 2 + products[8].price + 200, shippingPrice: 200, fullName: regularUsers[1].name, phoneNumber: "9800000003", address: "Bhaktapur, Nepal", paymentMethod: "COD", paymentStatus: "unpaid", status: "shipped", statusTimeline: { processingAt: new Date('2026-03-05'), shippedAt: new Date('2026-03-06') }, pointsEarned: 0, createdAt: new Date('2026-03-05') },
            { user: regularUsers[2]._id, products: [{ product: products[13]._id, quantity: 1 }], subTotal: products[13].price, discount: 500, totalAmount: products[13].price - 500 + 200, shippingPrice: 200, usePoints: true, pointsUsed: 50, fullName: regularUsers[2].name, phoneNumber: "9800000004", address: "Pokhara, Nepal", paymentMethod: "eSewa", paymentStatus: "paid", status: "processing", statusTimeline: { processingAt: new Date('2026-03-10') }, pointsEarned: Math.floor(products[13].price / 1000), createdAt: new Date('2026-03-10') },
            { user: regularUsers[3]._id, products: [{ product: products[19]._id, quantity: 3 }], subTotal: products[19].price * 3, discount: 0, totalAmount: products[19].price * 3 + 200, shippingPrice: 200, fullName: regularUsers[3].name, phoneNumber: "9800000005", address: "Chitwan, Nepal", paymentMethod: "COD", paymentStatus: "unpaid", status: "pending", statusTimeline: {}, pointsEarned: 0, createdAt: new Date('2026-03-14') },
            { user: regularUsers[0]._id, products: [{ product: products[24]._id, quantity: 1 }, { product: products[25]._id, quantity: 1 }], subTotal: products[24].price + products[25].price, discount: 0, totalAmount: products[24].price + products[25].price + 200, shippingPrice: 200, fullName: regularUsers[0].name, phoneNumber: "9800000002", address: "Lalitpur, Nepal", paymentMethod: "eSewa", paymentStatus: "paid", status: "delivered", statusTimeline: { processingAt: new Date('2026-02-20'), shippedAt: new Date('2026-02-21'), deliveredAt: new Date('2026-02-23') }, pointsEarned: Math.floor((products[24].price + products[25].price) / 1000), createdAt: new Date('2026-02-20') },
        ];
        const orders = await Order.insertMany(ordersData);
        console.log(`📦 Seeded ${orders.length} orders`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('─────────────────────────────────');
        console.log('👤 Admin:  admin@myshop.com  / admin123');
        console.log('👤 User:   saman@example.com / user1234');
        console.log('─────────────────────────────────');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();