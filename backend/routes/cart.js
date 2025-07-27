// File: codeZone/vendorconex/backend/routes/cart.js

const express = require('express');
const router = express.Router();
const Cart = require('../models/cart'); // Import the new Cart model
const Product = require('../models/Product'); // Import Product model to check product existence and price
const Order = require('../models/Order'); // Import Order model for checkout
const { protect } = require('../middleware/authMiddleware'); // Import authentication middleware

// @route   GET /api/cart
// @desc    Get the current user's cart
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        // Find the cart for the logged-in user
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price imageUrl');

        // If no cart exists, return an empty cart
        if (!cart) {
            cart = { user: req.user._id, items: [] }; // Create a conceptual empty cart
            return res.status(200).json(cart);
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Server error: Could not retrieve cart.' });
    }
});

// @route   POST /api/cart
// @desc    Add a product to cart or update quantity if product already exists
// @access  Private
router.post('/', protect, async (req, res) => {
    const { productId, quantity } = req.body;

    // Basic validation
    if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({ message: 'Product ID and a quantity of at least 1 are required.' });
    }

    try {
        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Find the user's cart or create a new one if it doesn't exist
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            // Create a new cart for the user
            cart = new Cart({
                user: req.user._id,
                items: [{ product: productId, quantity }]
            });
        } else {
            // Check if the product already exists in the cart
            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

            if (itemIndex > -1) {
                // Product exists, update its quantity
                cart.items[itemIndex].quantity += quantity;
            } else {
                // Product does not exist, add it as a new item
                cart.items.push({ product: productId, quantity });
            }
        }

        await cart.save(); // Save the updated cart
        res.status(200).json({ message: 'Product added to cart successfully!', cart });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Server error: Could not add product to cart.' });
    }
});

// @route   PUT /api/cart/item/:productId
// @desc    Update the quantity of a specific product in the cart
// @access  Private
router.put('/item/:productId', protect, async (req, res) => {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (quantity === undefined || quantity < 0) {
        return res.status(400).json({ message: 'Quantity must be a non-negative number.' });
    }

    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user.' });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart.' });
        }

        if (quantity === 0) {
            // If quantity is 0, remove the item from the cart
            cart.items.splice(itemIndex, 1);
        } else {
            // Update the quantity
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        res.status(200).json({ message: 'Cart item quantity updated successfully!', cart });
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        res.status(500).json({ message: 'Server error: Could not update cart item quantity.' });
    }
});

// @route   DELETE /api/cart/item/:productId
// @desc    Remove a product from the cart
// @access  Private
router.delete('/item/:productId', protect, async (req, res) => {
    const { productId } = req.params;

    try {
        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user.' });
        }

        // Filter out the item to be removed
        const initialLength = cart.items.length;
        cart.items = cart.items.filter(item => item.product.toString() !== productId);

        if (cart.items.length === initialLength) {
            return res.status(404).json({ message: 'Product not found in cart.' });
        }

        await cart.save();
        res.status(200).json({ message: 'Product removed from cart successfully!', cart });
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ message: 'Server error: Could not remove product from cart.' });
    }
});

// @route   POST /api/cart/checkout
// @desc    Convert the cart contents into a new order and clear the cart
// @access  Private
router.post('/checkout', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty. Cannot checkout.' });
        }

        let totalAmount = 0;
        const orderProducts = [];

        // Calculate total amount and prepare products for the order
        for (const item of cart.items) {
            // Re-fetch product to get current price and ensure it still exists
            const product = await Product.findById(item.product._id);
            if (!product) {
                // Handle case where a product in cart no longer exists
                return res.status(404).json({ message: `Product with ID ${item.product._id} not found. Please review your cart.` });
            }
            const itemPrice = product.price; // Use current product price
            totalAmount += itemPrice * item.quantity;
            orderProducts.push({
                product: item.product._id,
                quantity: item.quantity,
                priceAtOrder: itemPrice // Store the price at the time of order
            });
        }

        // Create the new order
        const newOrder = new Order({
            user: req.user._id,
            products: orderProducts,
            totalAmount: totalAmount,
            // Assuming shippingAddress is provided by frontend during checkout, or a default
            // For simplicity, we'll use a placeholder or require it in req.body for now
            shippingAddress: {
                street: '123 Main St',
                city: 'Anytown',
                state: 'CA',
                zip: '90210',
                country: 'USA'
            },
            status: 'Pending'
        });

        await newOrder.save();

        // Clear the user's cart after successful checkout
        cart.items = [];
        await cart.save();

        res.status(201).json({ message: 'Order placed successfully!', order: newOrder });

    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ message: 'Server error: Could not complete checkout.' });
    }
});

module.exports = router;