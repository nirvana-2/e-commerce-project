const User = require("../models/users");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

// --- VALIDATION HELPER ---
const validateInput = (email, password) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Min 8 chars, 1 letter, 1 number
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (email && !emailRegex.test(email)) return "Invalid email format.";
    if (password && !passwordRegex.test(password)) return "Password must be 8+ characters with a letter and a number.";
    return null;
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Validate Email Format
        const validationError = validateInput(email, null);
        if (validationError) return res.status(400).json({ success: false, message: validationError });

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 2. Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // 3. Hash and set to user collection
        const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        // ✅ FIXED: You were missing these assignments before user.save()
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordTokenExpiry = Date.now() + 3600000; // 1 hour expiry

        await user.save();

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        const htmlContent = `
            <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #0d9488; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">MyShop</h1>
                </div>
                <div style="padding: 30px; line-height: 1.6; color: #334155;">
                    <h2>Password Reset Request</h2>
                    <p>Hello ${user.fullName || 'User'},</p>
                    <p>We received a request to reset your password. Click the button below to set a new one. <strong>This link expires in 1 hour.</strong></p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset My Password</a>
                    </div>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; 2026 MyShop Nepal</p>
                </div>
            </div>
        `;

        try {
            await sendEmail(user.email, "Password Reset Request", `Reset Link: ${resetUrl}`, htmlContent);
            res.status(200).json({ success: true, message: "Password reset email sent successfully" });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordTokenExpiry = undefined;
            await user.save();
            console.error("Error sending email:", error);
            res.status(500).json({ success: false, message: "Failed to send email" });
        }
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { password } = req.body; // ✅ Added extraction of password from body

        // 1. Validate New Password Strength
        const validationError = validateInput(null, password);
        if (validationError) return res.status(400).json({ success: false, message: validationError });

        const hasedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hasedToken,
            resetPasswordTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        // 2. Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 3. Clear token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiry = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully. You can now login."
        });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const { fullName, phoneNumber, address } = req.body;

        // ✅ FIXED: Added 'User.' prefix to findByIdAndUpdate
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { fullName, phoneNumber, address },
            { new: true, runValidators: true }
        ).select("-password");

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};