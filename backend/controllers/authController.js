const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const sendMail = require("../utils/sendEmail");


exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        // 1. Check for existing user
        const existingUser = await User.findOne({ email });
        // Fixed: changed 'json' to 'res'
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 3. Create user
        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            role: role === "admin" ? "admin" : "user" 
        });
        await newUser.save();

          // 4. Send email notification to admin
    // await sendMail(
    //     "admin@example.com", // Replace with your admin email
    //     "New User Registered",
    //     `User ${name} (${email}) has registered in your app.`
    //   );


        // 4. Generate Token (Ensure JWT_SECRET is in your .env)
        const token = jwt.sign(
            { id: newUser._id }, 
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: "1h" }
        );

        // Fixed: Status should be 201 for success, not 500
        res.status(201).json({ user: newUser, token });
        
    } catch (err) {
        console.error("Registration Error:", err); // Log to terminal so you can see it
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET || 'fallback_secret', 
            { expiresIn: "1h" }
        );

        res.status(200).json({ user, token });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: err.message });
    }
};