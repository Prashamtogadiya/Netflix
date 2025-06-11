// Import mongoose for MongoDB object modeling
const mongoose = require('mongoose');

// Define the schema for a Movie document
const movieSchema = new mongoose.Schema({
  // Movie title
  title: String,
  // Movie description
  description: String,
  // Release date of the movie
  releaseDate: Date,
  // Thumbnail image URL or path
  thumbnailUrl: String,
  // Video file URL or path
  videoUrl: String,
  // Array of genres for the movie
  genres: [String],
  // Array of cast members
  cast: [String],
  // Movie rating (e.g., IMDb)
  rating: Number,
  // Is the movie trending?
  isTrending: Boolean,
  // Is the movie featured?
  isFeatured: Boolean
});

// Export the Movie model, using the 'movies' collection in MongoDB
module.exports = mongoose.model('Movie', movieSchema, 'movies');