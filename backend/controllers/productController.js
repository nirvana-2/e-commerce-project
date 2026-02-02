const Product = require("../models/product");
const Order=require("../models/Order")
const Review=require("../models/review")
exports.createProductReview = async (req, res) => {
    try {
      const { rating, comment } = req.body;
      const product = await Product.findById(req.params.id);
  
      if (product) {
        // 1. Check if user already reviewed this product
        const alreadyReviewed = product.reviews.find(
          (r) => r.user.toString() === req.user._id.toString()
        );
  
        if (alreadyReviewed) {
          return res.status(400).json({ message: "Product already reviewed" });
        }
  
        // 2. Create the review object
        const review = {
          name: req.user.name, // Assuming you have user name in req.user from auth middleware
          rating: Number(rating),
          comment,
          user: req.user._id,
        };
  
        // 3. Update product fields
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        
        // Calculate Average Rating
        product.averageRating = 
          product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
  
        await product.save();
        res.status(201).json({ message: "Review added successfully" });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

exports.addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    // 🛡️ THE STRICT CHECK
    const eligibleOrder = await Order.findOne({
      user: userId,
      status: 'delivered',       // Must be delivered
      paymentStatus: 'paid',     // Must be paid
      'products.product': productId // Must contain this specific product
    });

    if (!eligibleOrder) {
      return res.status(403).json({ 
        success: false, 
        message: "Eligibility failed: You can only review products that are delivered and fully paid." 
      });
    }

    // Prevent duplicate reviews
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: "You have already reviewed this product." });
    }

    const newReview = new Review({
      product: productId,
      user: userId,
      rating,
      comment
    });

    await newReview.save();
    res.status(201).json({ success: true, message: "Review submitted successfully!" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { category, subCategory, search, sort, page = 1, limit = 8 } = req.query;
    
    let query = {};
    if (category && category !== "all") query.category = category;
    if (subCategory && subCategory !== "all") query.subCategory = subCategory;
    if (search) query.name = { $regex: search, $options: "i" };

    // ✅ Define sorting
    let sortOptions = {};
    if (sort === "priceLow") sortOptions = { price: 1 };
    else if (sort === "priceHigh") sortOptions = { price: -1 };
    else sortOptions = { createdAt: -1 }; // newest

    const products = await Product.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single product by its MongoDB _id
exports.getProductById = async (req, res) => {
  try {
    // req.params.id comes from the URL /api/products/:id
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    // This catches invalid MongoDB ID formats
    console.error("Error details:", err.message);
    res.status(500).json({ success: false, message: "Invalid ID format or server error" });
  }
};



exports.addProducts = async (req, res) => {
    try {
        // Destructure precisely what is sent from the frontend
        const { name, price, description, category, subCategory, stock, image } = req.body;

        const newProduct = new Product({
            name,
            price: Number(price),
            description,
            category,
            // Fallback to empty string if missing, then schema will handle lowercase/trim
            subCategory: subCategory || "", 
            stock: Number(stock) || 0,
            image: image || ""
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        console.error("Save Error:", err.message);
        res.status(400).json({ message: err.message });
    }
};
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, description, image, category, stock, brand } = req.body;
    
    const product = await Product.findById(req.params.id);

    if (product) {
      // Update fields if they are provided in the request body
      product.name = name || product.name;
      product.price = price !== undefined ? price : product.price; // Allows setting price to 0 if needed
      product.description = description || product.description;
      product.image = image || product.image;
      product.category = category || product.category;
      product.stock = stock !== undefined ? stock : product.stock;
      product.brand = brand || product.brand;

      const updatedProduct = await product.save();
      
      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
      });
    } else {
      res.status(404).json({ success: false, message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
