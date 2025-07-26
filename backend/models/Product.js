// File: codeZone/vendorconex/backend/models/Product.js

const mongoose = require('mongoose');

// 1. Define the Review Schema (sub-document schema)
const reviewSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to the User model
    },
    name: { // Store user's name directly for easier display in reviews
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1, // Minimum rating (e.g., 1 star)
        max: 5, // Maximum rating (e.g., 5 stars)
    },
    comment: {
        type: String,
        required: true,
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields to each review
});


// 2. Define the Product Schema, incorporating reviews and overall rating fields
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
        default: 0, // Added default for consistency and safety
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0, // Added default for consistency and safety
    },
    // To link products to a specific vendor/user
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Refers to the User model (who created this product)
        required: true
    },
    imageUrl: {
        type: String,
        default: 'https://via.placeholder.com/150', // Set a default placeholder image URL
    },
    // --- NEW FIELDS FOR REVIEWS AND RATINGS ---
    reviews: [reviewSchema], // An array of review sub-documents
    rating: { // The average rating of the product based on all reviews
        type: Number,
        required: true,
        default: 0, // Default to 0 if no reviews yet
    },
    numReviews: { // The total number of reviews received for the product
        type: Number,
        required: true,
        default: 0, // Default to 0 if no reviews yet
    },
    // --- END NEW FIELDS ---
}, {
    // Add timestamps to the main product schema as well, if not already handled by 'createdAt' directly
    // If you prefer Mongoose's automatic timestamps, remove your manual 'createdAt' field above
    timestamps: true, // This will add 'createdAt' and 'updatedAt'
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;