// File: codeZone/vendorconex/backend/models/Order.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { // The customer who placed the order
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Products in the order
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', // Reference to the Product model
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            priceAtOrder: { // Store price at time of order in case product price changes
                type: Number,
                required: true,
                min: 0
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, required: true, default: 'India' } // Assuming India for now
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    // Optional: for tracking if needed
    trackingNumber: {
        type: String,
        default: ''
    },
    // You might also want a 'vendor' field here if an order is for a single vendor,
    // or a way to link products to their respective vendors. For simplicity, we'll
    // assume one customer placing an order for potentially multiple products from various vendors,
    // and vendor handling would be separate or inferred from products.
    // For now, it's just from user to products.
});

module.exports = mongoose.model('Order', orderSchema);