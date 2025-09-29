const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = async (MONGO_URI) => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}
module.exports = connectDB;