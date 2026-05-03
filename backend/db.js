const mongoose = require('mongoose');

// Connect to MongoDB with error handling
mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/paytm', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// User Schema with validation and timestamps
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
        minLength: [3, 'Username must be at least 3 characters'],
        maxLength: [30, 'Username must not exceed 30 characters'],
        match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores']
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password by default in queries
    },

    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxLength: [50, 'First name must not exceed 50 characters']
    },

    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxLength: [50, 'Last name must not exceed 50 characters']
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        sparse: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Account Schema with validation
const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true // Index for faster queries
    },

    balance: {
        type: Number,
        required: [true, 'Balance is required'],
        default: 0,
        min: [0, 'Balance cannot be negative']
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Add indexes for common queries
accountSchema.index({ userId: 1 }, { unique: true });

// Create models
const User = mongoose.model('User', userSchema);
const Account = mongoose.model('Account', accountSchema);

module.exports = { User, Account };
