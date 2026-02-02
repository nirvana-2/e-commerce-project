// models/product.js
const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // Store name so you don't have to populate every time
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  image: { type: String },
  stock: { type: Number, required: true },
  category: { type: String, required: true, lowercase: true },
  // Ensure this is exactly 'subCategory' with a capital 'C'
  subCategory: { 
    type: String, 
    lowercase: true, 
    trim: true,
    default: "" 
  },
  reviews: [reviewSchema],
  numReviews: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 }
}, { timestamps: true });

// CHANGE THIS LINE: This forces Mongoose to use the new schema if it already exists
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
module.exports = Product;