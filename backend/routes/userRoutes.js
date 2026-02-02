const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator"); // ✅ Added for route-level validation
const {
    getUserProfile,
    updateUserProfile,
    resetPassword,
    forgotPassword
} = require("../controllers/userController");
const { verifyToken } = require("../middleware/auth");

// --- VALIDATION MIDDLEWARE ---
// This checks for errors and blocks the request if the data is bad
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: errors.array()[0].msg // Sends the first error message
        });
    }
    next();
};

// --- ROUTES ---

// Profile Routes (Protected)
router.get("/profile", verifyToken, getUserProfile);
router.put("/update", verifyToken, updateUserProfile);

// Password Reset Routes (Public)

// 1. Forgot Password (Validates email format)
router.post(
    "/forgot-password",
    [
        body("email").isEmail().withMessage("Please enter a valid email address.")
    ],
    validate,
    forgotPassword
);

// 2. Reset Password (Validates password strength)
// We use PUT because we are updating an existing user's password field
router.put(
    "/reset-password/:token",
    [
        body("password")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long.")
            .matches(/\d/)
            .withMessage("Password must contain at least one number.")
            .matches(/[a-zA-Z]/)
            .withMessage("Password must contain at least one letter.")
    ],
    validate,
    resetPassword
);

module.exports = router;