// Import mongoose for MongoDB object modeling
const mongoose = require('mongoose');

// This schema defines a single review for a movie
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The user who wrote the review
  rating: { type: Number, required: true }, // The rating given by the user (e.g., 1-5)
  comment: { type: String }, // The review text
  createdAt: { type: Date, default: Date.now } // When the review was created
});

// This schema defines a movie document in the database
const movieSchema = new mongoose.Schema({
  Title: String,                // Movie title
  Description: String,          // Movie description
  Director: String,          // List of directors
  Writers: [String],           // List of writers
  Actors: [String],             // List of actors
  Year: Number,         // Year the movie was released
  Language: [String],           // Languages available
  Genre: [String],              // Genres of the movie
  Awards: String,               // Awards won by the movie
  Types: [String],   
  Rating:Number,           // Types/categories (e.g., "Movie", "Series")
  Searches: Number,          // Top searches (optional)
  Image: [String],               // URL to the movie poster image
  Video: String,               // URL to the movie video file
  Reviews: [reviewSchema]       // List of reviews for this movie
});

// Export the Movie model, using the 'movies' collection in MongoDB
module.exports = mongoose.model('Movie', movieSchema, 'movies');