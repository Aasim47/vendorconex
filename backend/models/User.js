// File: codeZone/vendorconex/backend/models/User.js (Example - crucial for auth.js)
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // <--- Make sure this is imported

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        default: '',
    },
    // Add roles if you plan to differentiate users (e.g., 'customer', 'vendor', 'admin')
    role: {
        type: String,
        enum: ['customer', 'vendor', 'admin'],
        default: 'customer'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Hash password before saving (pre-save hook)
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);