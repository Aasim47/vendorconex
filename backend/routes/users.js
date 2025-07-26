// File: codeZone/vendorconex/backend/routes/users.js

const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the User model
const Order = require('../models/Order'); // Import the Order model

// @route   GET /api/users/:userId/orders
// @desc    Get all orders for a specific user
// @access  Public (for now, will add authentication/authorization later)
router.get('/:userId/orders', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Optional: Check if the user exists (good practice)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Find all orders associated with this user ID
        const orders = await Order.find({ user: userId })
                                .populate('products.product', 'name price imageUrl') // Populate product details
                                .sort({ orderDate: -1 }); // Sort by most recent order first

        if (orders.length === 0) {
            return res.status(200).json({ message: 'No orders found for this user.', orders: [] });
        }

        res.status(200).json(orders);

    } catch (err) {
        console.error('Error fetching user orders:', err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }
        res.status(500).json({ message: 'Server error: Could not retrieve user orders.' });
    }
});

module.exports = router;