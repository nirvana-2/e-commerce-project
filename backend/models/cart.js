const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
    },
  ],
  // CHANGE THIS LINE: remove required, add default
  total: { type: Number, default: 0 }, 
  status: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
}, { timestamps: true });
module.exports = mongoose.models.Cart ||mongoose.model("Cart", cartSchema);