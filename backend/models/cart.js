// File: codeZone/vendorconex/backend/models/Cart.js

const mongoose = require('mongoose');

// Define the schema for individual items within the cart
const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Product model
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1 // Quantity must be at least 1
    }
}, { _id: false }); // Do not create a separate _id for each cart item subdocument

// Define the main Cart schema
const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User model
        ref: 'User',
        required: true,
        unique: true // Ensures each user has only one cart document
    },
    items: [cartItemSchema], // An array of cart items
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update 'updatedAt' timestamp on save
cartSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Cart', cartSchema);