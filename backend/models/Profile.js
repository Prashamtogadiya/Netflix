// Import mongoose for MongoDB object modeling
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for a Profile document
const profileSchema = new Schema({
  // Reference to the User who owns this profile
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Profile's display name
  name: String,
  // Profile's avatar image URL or path
  avatar: String,
  // Array of Movie ObjectIds in this profile's "My List"
  myList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  // Map of categories to store category watch counts for each profile
  watchedCategories: {
    type: Object,
    default: {},
  }
});

// Export the Profile model, using the 'profiles' collection in MongoDB
module.exports = mongoose.model('Profile', profileSchema, 'profiles');