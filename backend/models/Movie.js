// Import mongoose for MongoDB object modeling
const mongoose = require('mongoose');

// Actor and Genre schemas
const genreSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true }
});
const actorSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true }
});

// This schema defines a single review for a movie
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// This schema defines a movie document in the database
const movieSchema = new mongoose.Schema({
  Title: String,                // Movie title
  Description: String,          // Movie description
  Director: String,          // List of directors
  Writers: [String],           // List of writers
  // Reference Actor and Genre collections
  Actors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Actor' }],             // List of actors
  Year: Number,         // Year the movie was released
  Language: [String],           // Languages available
  Genre: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],              // Genres of the movie
  Awards: String,               // Awards won by the movie
  Types: [String],   
  Rating:String,           // Types/categories (e.g., "Movie", "Series")
  Searches: Number,          // Top searches (optional)
  Image: [String],               // URL to the movie poster image
  Video: String,               // URL to the movie video file
  Reviews: [reviewSchema],
  Runtime:Number,
  ActorImage:[String]
},{timestamps: true});

// Export models
module.exports.Movie = mongoose.model('Movie', movieSchema, 'movies');
module.exports.Genre = mongoose.model('Genre', genreSchema, 'genres');
module.exports.Actor = mongoose.model('Actor', actorSchema, 'actors');