// File: codeZone/vendorconex/backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming your User model is in backend/models/User.js

const protect = async (req, res, next) => {
    let token;

    // Check if authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (format: "Bearer TOKEN")
            token = req.headers.authorization.split(' ')[1];

            // Verify token using JWT_SECRET from .env
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user by ID from the token payload and attach to req object
            // .select('-password') ensures the password hash is not returned
            req.user = await User.findById(decoded.id).select('-password');

            // Proceed to the next middleware/route handler
            next();

        } catch (error) {
            console.error('Not authorized, token failed:', error);
            res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }

    // If no token is provided in the header
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token.' });
    }
};

module.exports = { protect };