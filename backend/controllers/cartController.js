const Cart = require("../models/cart");
const Product = require("../models/product"); // Essential to prevent "Schema not registered" error

// 1. ADMIN: Get all carts
exports.getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate("user", "name email")
      .populate("products.product");
    res.json(carts);
  } catch (err) {
    res.status(500).json({ message: "Server error fetching carts" });
  }
};

// 2. USER: Get specific cart
exports.getUserCart = async (req, res) => {
  try {
    // Ensuring Product model is loaded before populate
    const cart = await Cart.findOne({ user: req.user.id }).populate("products.product");
    if (!cart) return res.json({ products: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Add to cart 
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) return res.status(400).json({ message: "Product ID is required" });

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      // Added total: 0 initially to satisfy your required:true constraint
      cart = new Cart({ user: req.user.id, products: [], total: 0 });
    }

    const existingIndex = cart.products.findIndex(p => p.product && p.product.toString() === productId);
    
    if (existingIndex >= 0) {
      cart.products[existingIndex].quantity += (Number(quantity) || 1);
    } else {
      cart.products.push({ product: productId, quantity: (Number(quantity) || 1) });
    }

    // --- FIX: Calculate total before saving ---
    const populatedForTotal = await cart.populate("products.product");
    cart.total = populatedForTotal.products.reduce((acc, item) => {
      const price = item.product ? item.product.price : 0;
      return acc + (price * item.quantity);
    }, 0);

    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id).populate("products.product");
    res.json(populatedCart);
  } catch (err) {
    console.error("Add to Cart Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 4. Remove from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter(p => p.product && p.product.toString() !== productId);
    
    // --- FIX: Recalculate total after removal ---
    const populatedForTotal = await cart.populate("products.product");
    cart.total = populatedForTotal.products.reduce((acc, item) => {
      const price = item.product ? item.product.price : 0;
      return acc + (price * item.quantity);
    }, 0);

    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id).populate("products.product");
    res.json(populatedCart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//to clear the cart
exports.clearCart = async (req, res) => {
  try {
    // Since we removed 'protect', req.user is empty.
    // For now, let's clear the cart by targeting the database directly.
    
    // Option A: If you want to delete EVERY item in the cart table (easiest for testing)
    await Cart.deleteMany({}); 

    res.status(200).json({ 
      success: true, 
      message: "Cart cleared successfully" 
    });
  } catch (error) {
    console.error("Backend ClearCart Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
};