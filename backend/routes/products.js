// File: codeZone/vendorconex/backend/routes/products.js (FULLY CORRECTED AND UPDATED)

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware'); // <--- ENSURE THIS IS UNCOMMENTED AND AUTHMIDDLEWARE IS SET UP

// @route   POST /api/products
// @desc    Create a new product
// @access  Public (will be protected if you use authMiddleware)
// router.post('/', protect, async (req, res) => { // Use this line if you want to protect the route
router.post('/', async (req, res) => { // Use this line if not protecting yet
    const { name, description, price, category, stockQuantity, vendor, imageUrl } = req.body;

    // Basic validation
    if (!name || !description || !price || !category || !stockQuantity || !vendor) {
        return res.status(400).json({ message: 'Please provide all required product fields: name, description, price, category, stockQuantity, and vendor.' });
    }

    try {
        const newProduct = new Product({
            name,
            description,
            price,
            category,
            stockQuantity,
            vendor, // This 'vendor' field should be the userId of the vendor
            imageUrl
        });

        await newProduct.save();
        res.status(201).json({
            message: 'Product created successfully!',
            product: newProduct
        });

    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ message: 'Server error: Could not create product. Please try again.' });
    }
});

// @route   GET /api/products
// @desc    Get all products with optional search, filter, and pagination
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { name, category, page, limit } = req.query; // Extract query parameters including page and limit

        let query = {}; // Initialize an empty query object for filtering

        // Add search by 'name' if provided
        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }

        // Add filter by 'category' if provided
        if (category) {
            query.category = { $regex: category, $options: 'i' };
        }

        // Pagination logic
        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * pageSize;

        const totalProducts = await Product.countDocuments(query);

        const products = await Product.find(query)
                                    .skip(skip)
                                    .limit(pageSize);

        if (products.length === 0 && totalProducts > 0) {
            return res.status(200).json({
                message: `No products found on page ${pageNumber} matching your criteria.`,
                products: [],
                currentPage: pageNumber,
                totalPages: Math.ceil(totalProducts / pageSize),
                totalItems: totalProducts
            });
        } else if (products.length === 0 && totalProducts === 0) {
            return res.status(200).json({
                message: 'No products found matching your criteria.',
                products: [],
                currentPage: pageNumber,
                totalPages: 0,
                totalItems: 0
            });
        }

        res.status(200).json({
            message: 'Products retrieved successfully!',
            products: products,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalProducts / pageSize),
            totalItems: totalProducts
        });

    } catch (err) {
        console.error('Error fetching all products with pagination:', err);
        res.status(500).json({ message: 'Server error: Could not retrieve products.' });
    }
});

// @route   GET /api/products/:id
// @desc    Get a single product by ID, populated with reviews
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        // Populate the 'reviews.user' field to get user's name and ID from the User model
        const product = await Product.findById(req.params.id).populate('reviews.user', 'name');

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        res.status(200).json(product); // Send the product details

    } catch (err) {
        console.error('Error fetching single product:', err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid product ID format.' });
        }
        res.status(500).json({ message: 'Server error: Could not retrieve product.' });
    }
});

// @route   POST /api/products/:id/reviews
// @desc    Create a new review for a product
// @access  Private (requires JWT and user to be logged in)
router.post('/:id/reviews', protect, async (req, res) => {
    const { rating, comment } = req.body;

    // Basic validation for review
    if (rating === undefined || rating < 1 || rating > 5 || !comment || comment.trim() === '') {
        return res.status(400).json({ message: 'Please provide a valid rating (1-5) and a comment.' });
    }

    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            // 1. Check if the user has already reviewed this product
            const alreadyReviewed = product.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Product already reviewed by this user.' });
            }

            // 2. Create the new review object
            const review = {
                name: req.user.name, // Get user's name from req.user (attached by protect middleware)
                rating: Number(rating),
                comment,
                user: req.user._id, // Get user's ID from req.user
            };

            // 3. Add the new review to the product's reviews array
            product.reviews.push(review);
            product.numReviews = product.reviews.length; // Update total number of reviews

            // 4. Calculate new average rating
            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            // 5. Save the updated product document
            await product.save();
            res.status(201).json({ message: 'Review added successfully!' });

        } else {
            res.status(404).json({ message: 'Product not found.' });
        }
    } catch (error) {
        console.error('Error adding review:', error);
        // More specific error handling if needed, e.g., for Mongoose validation errors
        res.status(500).json({ message: 'Server error: Could not add review.' });
    }
});


// @route   PUT /api/products/:id
// @desc    Update a product by ID
// @access  Public (will be protected if you use authMiddleware)
// router.put('/:id', protect, async (req, res) => { // Use this line if you want to protect the route
router.put('/:id', async (req, res) => { // Use this line if not protecting yet
    const { name, description, price, category, stockQuantity, imageUrl } = req.body; // vendor field usually not updated here

    try {
        const product = await Product.findById(req.params.id); // Find the product by ID

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Update product fields if they are provided in the request body
        if (name) product.name = name;
        if (description) product.description = description;
        if (price !== undefined) product.price = price; // Check for undefined, allows 0
        if (category) product.category = category;
        if (stockQuantity !== undefined) product.stockQuantity = stockQuantity; // Allows 0
        if (imageUrl) product.imageUrl = imageUrl;

        await product.save(); // Save the updated product
        res.status(200).json({
            message: 'Product updated successfully!',
            product: product
        });

    } catch (err) {
        console.error('Error updating product:', err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid product ID format.' });
        }
        res.status(500).json({ message: 'Server error: Could not update product.' });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product by ID
// @access  Public (will be protected if you use authMiddleware)
// router.delete('/:id', protect, async (req, res) => { // Use this line if you want to protect the route
router.delete('/:id', async (req, res) => { // Use this line if not protecting yet
    try {
        const product = await Product.findByIdAndDelete(req.params.id); // Find and delete the product

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        res.status(200).json({ message: 'Product deleted successfully!', deletedProduct: product });

    } catch (err) {
        console.error('Error deleting product:', err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid product ID format.' });
        }
        res.status(500).json({ message: 'Server error: Could not delete product.' });
    }
});

module.exports = router;