const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, default: "" },
  address: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin"], default: "user" },

  resetPasswordToken: { type: String },
  resetPasswordTokenExpiry: { type: Date },
  // STYLE PERKS FIELDS
  rewards: {
    points: {
      type: Number,
      default: 0 // New users start with 0
    },
  },
  isVerified: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);