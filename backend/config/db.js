// Import mongoose for MongoDB connection
const mongoose = require('mongoose');

// Function to connect to MongoDB using Mongoose
const connectDB = async () => {
  try {
    // Connect to MongoDB using the URI from environment variables or default to local
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/netflix');
    console.log('MongoDB connected');
  } catch (err) {
    // If connection fails, log error and exit process
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Export the connectDB function for use in server.js
module.exports = connectDB;