const jwt = require("jsonwebtoken");
const User = require("../models/users"); // make sure your model filename matches

// -------------------- VERIFY JWT TOKEN --------------------
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    const existingUser = await User.findById(decoded.id).select("-password"); // exclude password
    if (!existingUser) return res.status(401).json({ message: "User not found" });

    req.user = existingUser;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// -------------------- ADMIN CHECK --------------------
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  next();
};

module.exports = { verifyToken, isAdmin };
