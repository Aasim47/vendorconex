// File: codeZone/vendorconex/backend/server.js

require('dotenv').config(); // Load environment variables first (MUST BE AT THE VERY TOP)

const express = require("express");     // Import Express for building the web server
const mongoose = require("mongoose");   // Import Mongoose for MongoDB interactions
const cors = require("cors");           // Import CORS middleware for cross-origin requests

// --- IMPORTANT: ADD THESE MODEL IMPORTS HERE ---
// These imports ensure your Mongoose models are registered globally
// so populate() can find them.
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Cart = require('./models/cart'); // <--- ADDED FOR CART MODEL
// --- END OF IMPORTANT ADDITIONS ---

const app = express(); // Create an Express application instance
const PORT = process.env.PORT || 5000; // Get port from .env or default to 5000

// Middleware: Functions that run between the request and the final route handler
app.use(cors());            // Enable CORS for all routes (allows frontend to connect)
app.use(express.json());    // Enable parsing of JSON request bodies

// MongoDB Connection
// Connect to the MongoDB database using the URI from the .env file
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,    // Recommended option for parsing connection strings
  useUnifiedTopology: true, // Recommended option for managing server connections
})
.then(() => console.log("MongoDB Connected Successfully!")) // Log success message
.catch((err) => console.error("MongoDB connection error:", err)); // Log error if connection fails

// Import API Routes
// These lines import modular route definitions from other files
const authRoutes = require("./routes/auth");
const productsRoutes = require("./routes/products");
const ordersRoutes = require("./routes/orders");
const usersRoutes = require("./routes/users");
const chatRoutes = require("./routes/chat");
const cartRoutes = require("./routes/cart"); // <--- ADDED FOR CART ROUTES

// Use API Routes
// Attach the imported route handlers to specific URL paths (endpoints)
app.use("/api/auth", authRoutes); // All routes in auth.js will start with /api/auth
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/cart", cartRoutes); // <--- ADDED FOR CART ROUTES


// Basic Test Route (Optional, for checking if server is running)
app.get('/', (req, res) => {
    res.send('Vendorconex Backend API is running!');
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Vendorconex Backend Server started on port ${PORT}`);
});