// Import mongoose for MongoDB object modeling
const mongoose = require('mongoose');

// Define the schema for a User document
const userSchema = new mongoose.Schema({
  // User's email, must be unique and is required
  email: { type: String, required: true, unique: true },
  // User's hashed password, required
  password: { type: String, required: true },

   // New field: Role for admin/user
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  // User's display name, required
  name: { type: String, required: true },
  // Array of Profile ObjectIds belonging to this user
  profiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }],
  // Refresh token for JWT authentication
  refreshToken: { type: String }
});

// Export the User model, using the 'users' collection in MongoDB
module.exports = mongoose.model('User', userSchema, 'users');