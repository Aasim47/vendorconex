// File: codeZone/vendorconex/backend/routes/orders.js

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');   // Import the Order model
const Product = require('../models/Product'); // Import Product model to check product details
const User = require('../models/User');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Public (for now, will add authentication later)
router.post('/', async (req, res) => {
    const { userId, products, shippingAddress } = req.body;

    if (!userId || !products || products.length === 0 || !shippingAddress) {
        return res.status(400).json({ message: 'Please provide user ID, products, and shipping address.' });
    }
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
        return res.status(400).json({ message: 'Please provide complete shipping address (street, city, state, zip).' });
    }

    let totalAmount = 0;
    const productsForOrder = [];

    try {
        // Validate products and calculate total amount
        for (let item of products) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.productId} not found.` });
            }
            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({ message: `Not enough stock for product: ${product.name}. Available: ${product.stockQuantity}` });
            }

            // Deduct stock (simple example, ideally in a transaction)
            product.stockQuantity -= item.quantity;
            await product.save();

            totalAmount += product.price * item.quantity;
            productsForOrder.push({
                product: item.productId,
                quantity: item.quantity,
                priceAtOrder: product.price // Store the price at the time of order
            });
        }

        const newOrder = new Order({
            user: userId,
            products: productsForOrder,
            totalAmount,
            shippingAddress
        });

        await newOrder.save();
        res.status(201).json({
            message: 'Order placed successfully!',
            order: newOrder
        });

    } catch (err) {
        console.error('Error creating order:', err);
        // Handle Mongoose validation errors or other specific errors
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid ID format for user or product.' });
        }
        res.status(500).json({ message: 'Server error: Could not place order. Please try again.' });
    }
});


// File: codeZone/vendorconex/backend/routes/orders.js (continuation)

// @route   GET /api/orders/:id
// @desc    Get a single order by ID
// @access  Public (for now, will add authentication/authorization later)
router.get('/:id', async (req, res) => {
    try {
        // Find order by ID, and populate 'user' and 'product' fields
        // .populate('user', 'name email') means fetch the user object and only include name and email fields
        // .populate('products.product', 'name price') means for each item in products array, fetch the product object and only include name and price
        const order = await Order.findById(req.params.id)
                                .populate('user', 'name email')
                                .populate('products.product', 'name price imageUrl');

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        res.status(200).json(order); // Send the order details

    } catch (err) {
        console.error('Error fetching single order:', err);
        // Check if it's a CastError (invalid ID format)
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid order ID format.' });
        }
        res.status(500).json({ message: 'Server error: Could not retrieve order.' });
    }
});

// File: codeZone/vendorconex/backend/routes/orders.js (continuation)

// @route   GET /api/orders
// @desc    Get all orders (Admin/Vendor View)
// @access  Public (for now, will add authentication/authorization later)
router.get('/', async (req, res) => {
    try {
        // Find all orders, populate user and product details, and sort by most recent
        const orders = await Order.find({})
                                .populate('user', 'name email') // Populate user details
                                .populate('products.product', 'name price imageUrl') // Populate product details for each item
                                .sort({ orderDate: -1 }); // Sort by most recent first

        if (orders.length === 0) {
            return res.status(200).json({ message: 'No orders found.', orders: [] });
        }

        res.status(200).json(orders);

    } catch (err) {
        console.error('Error fetching all orders:', err);
        res.status(500).json({ message: 'Server error: Could not retrieve orders.' });
    }
});

// ... (your existing POST /api/orders and GET /api/orders/:id routes will be here) ...

// module.exports = router; // This line should remain at the very end of the file

// ... (your existing POST /api/orders route will be here) ...

// module.exports = router; // This line should remain at the very end of the file

// File: codeZone/vendorconex/backend/routes/orders.js (continuation)

// @route   PUT /api/orders/:id/status
// @desc    Update the status of an order
// @access  Public (for now, will add authentication/authorization later)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body; // Expecting { "status": "Shipped" } in the request body
        const orderId = req.params.id;

        if (!status) {
            return res.status(400).json({ message: 'Please provide a new status for the order.' });
        }

        // Optional: Define allowed statuses
        const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        // Update the status
        order.status = status;
        await order.save();

        res.status(200).json({
            message: `Order status updated to "${status}" successfully!`,
            order
        });

    } catch (err) {
        console.error('Error updating order status:', err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid order ID format.' });
        }
        res.status(500).json({ message: 'Server error: Could not update order status.' });
    }
});

// module.exports = router; // This line should remain at the very end of the file
module.exports = router;