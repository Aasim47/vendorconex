# VenDorConeX

Vendorconex Backend
Welcome to the backend repository for Vendorconex, a robust e-commerce platform designed to facilitate product management, order processing, user authentication, and reviews/ratings. This backend serves as the API for a multi-vendor marketplace, providing all necessary data and logic for a dynamic frontend application.

Table of Contents
Features

Technology Stack

Getting Started

Prerequisites

Cloning the Repository

Backend Setup

Running the Backend

API Endpoints

Authentication & User Management

Product Management

Order Management

Reviews & Ratings

Future Enhancements

Contributing

License

Features
This backend provides comprehensive functionalities for an e-commerce platform, including:

User Authentication: Secure user registration and login with JWT (JSON Web Token) for session management.

Product Management (CRUD):

Create, Read (single, all, paginated), Update, and Delete products.

Search products by name (case-insensitive, partial match).

Filter products by category (case-insensitive).

Pagination for product listings.

Order Management:

Create new orders.

Retrieve specific order details.

Retrieve all orders for a specific user.

Retrieve all orders (admin/vendor view).

Update order status (e.g., Pending, Shipped, Delivered).

Reviews & Ratings:

Users can submit reviews and ratings (1-5 stars) for products.

Automatic calculation of product's average rating and total number of reviews.

Reviews are displayed when fetching product details.

Middleware: Implementation of authentication middleware to protect sensitive routes.

Technology Stack
Node.js: JavaScript runtime environment.

Express.js: Web application framework for Node.js.

MongoDB: NoSQL database for data storage.

Mongoose: ODM (Object Data Modeling) library for MongoDB and Node.js.

JWT (JSON Web Token): For secure authentication and authorization.

Bcrypt.js: For password hashing.

Dotenv: For managing environment variables.

CORS: For enabling Cross-Origin Resource Sharing.

Getting Started
Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

Prerequisites
Make sure you have the following installed:

Node.js (LTS version recommended)

MongoDB Community Server (running locally or accessible via a cloud service like MongoDB Atlas)

Git

Postman (for API testing)

Cloning the Repository
First, clone this repository to your local machine. Navigate to the directory where you want to store the project.

git clone https://github.com/Aasim47/vendorconex.git
cd vendorconex

Backend Setup
Navigate into the backend directory and install the necessary Node.js dependencies.

cd backend
npm install

Environment Variables (.env file)
Create a .env file in the backend directory. This file will store your sensitive configuration details.

MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/vendorconex?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here

Replace <username>, <password>, and <cluster-url> with your MongoDB connection details. If running locally, it might be mongodb://localhost:27017/vendorconex.

PORT: The port your server will run on.

JWT_SECRET: A strong, random string. You can generate one online or use a tool. Do NOT share this publicly.

Running the Backend
Once the dependencies are installed and the .env file is configured, you can start the backend server:

node server.js

You should see messages in your terminal indicating that MongoDB is connected and the server is running on the specified port (e.g., Vendorconex Backend Server started on port 5000).

API Endpoints
Here's a summary of the key API endpoints available in this backend. For detailed request bodies and responses, refer to the source code.

Base URL: http://localhost:5000/api

Authentication & User Management
Method

Path

Description

Access Level

POST

/auth/signup

Register a new user

Public

POST

/auth/login

Authenticate user & get JWT token

Public

GET

/users/profile

Get current user's profile

Private (Auth)

PUT

/users/profile

Update current user's profile

Private (Auth)

Product Management
Method

Path

Description

Access Level

POST

/products

Create a new product

Public (Auth recommended)

GET

/products

Get all products (with optional search/filter/pagination)

Public

GET

/products/:id

Get a single product by ID (with reviews)

Public

PUT

/products/:id

Update product details

Public (Auth recommended)

DELETE

/products/:id

Delete a product

Public (Auth recommended)

GET /products Query Parameters:

?name=keyword: Search products by name (case-insensitive, partial match).

?category=categoryName: Filter products by category (case-insensitive).

?page=1&limit=10: Paginate results (default: page 1, limit 10).

Example: /api/products?name=milk&category=dairy&page=2&limit=5

Order Management
Method

Path

Description

Access Level

POST

/orders

Create a new order

Public (Auth recommended)

GET

/orders/:id

Get a single order by ID

Public (Auth recommended)

GET

/users/:userId/orders

Get all orders for a specific user

Public (Auth recommended)

GET

/orders

Get all orders (Admin/Vendor view)

Public (Auth recommended)

PUT

/orders/:id/status

Update the status of an order

Public (Auth recommended)

Reviews & Ratings
Method

Path

Description

Access Level

POST

/products/:id/reviews

Submit a review and rating for a product

Private (Auth)

Future Enhancements
Role-Based Access Control (RBAC): Implement distinct user roles (e.g., customer, vendor, admin) to restrict access to specific routes and functionalities.

Image Upload Service: Integrate a cloud storage solution (e.g., Cloudinary, AWS S3) for handling product image uploads.

Shopping Cart/Wishlist: Implement dedicated APIs for managing user shopping carts and wishlists.

Payment Gateway Integration: Connect with popular payment services like Stripe or PayPal.

Advanced Search & Filtering: More complex query options for products and orders (e.g., price range, sorting).

Contributing
Contributions are welcome! If you have suggestions or find issues, please open an issue or submit a pull request.

License
This project is licensed under the MIT License - see the LICENSE.md file for details (if you add one).
