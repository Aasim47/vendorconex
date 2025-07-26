// File: codeZone/vendorconex/backend/routes/auth.js

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // <--- NEW: For password hashing
const jwt = require("jsonwebtoken"); // <--- NEW: For generating JSON Web Tokens
const User = require("../models/User");

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post("/signup", async (req, res) => {
    const { name, email, password, location } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please provide name, email, and password." });
    }

    try {
        // Check if user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists." });
        }

        // Create new user instance (password will be hashed by pre-save hook in User model)
        const newUser = new User({ name, email, password, location });

        // Save the user to the database
        await newUser.save();

        // Generate JWT token for the new user immediately upon signup (optional, but common)
        const payload = {
            id: newUser._id,
            // You can add other details to the payload if needed, e.g., role: newUser.role
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret key from .env
            { expiresIn: '1h' }, // Token expiration (e.g., 1 hour)
            (err, token) => {
                if (err) throw err;
                res.status(201).json({
                    message: "User registered successfully!",
                    userId: newUser._id,
                    userName: newUser.name,
                    token: token // <--- NEW: Return the token
                });
            }
        );

    } catch (err) {
        console.error("Error during user registration:", err);
        // Check for specific Mongoose validation errors if needed
        res.status(500).json({ message: "Server error during registration. Please try again." });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: "Please provide email and password." });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials: User not found." });
        }

        // Compare provided password with hashed password in DB using the method from User model
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials: Incorrect password." });
        }

        // Generate JWT Token
        const payload = {
            id: user._id,
            // You can add other details to the payload if needed, e.g., role: user.role
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET, // Your secret key from .env
            { expiresIn: '1h' }, // Token expiration (e.g., 1 hour)
            (err, token) => {
                if (err) throw err;
                // Send back the token and user info
                res.status(200).json({
                    message: "Login successful!",
                    userName: user.name,
                    userId: user._id,
                    token: token // <--- NEW: Return the token
                });
            }
        );

    } catch (err) {
        console.error("Error during user login:", err);
        res.status(500).json({ message: "Server error during login. Please try again." });
    }
});

module.exports = router;