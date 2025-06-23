// Import the Movie model for database operations
const Movie = require('../models/Movie.js');

// Create a new movie (admin or authorized user)
exports.createMovie = async (req, res) => {
  try {
    // Get movie data from request body
    const movieData = req.body;
    // Create the movie in the database
    const movie = await Movie.create(movieData);
    // Respond with the created movie
    res.status(201).json(movie);
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: 'Failed to create movie', error: err.message });
  }
};

// Get all movies
exports.getMovies = async (req, res) => {
  try {
    // Find all movies in the database
    const movies = await Movie.find();
    // Respond with the list of movies
    res.json(movies);
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: 'Failed to fetch movies', error: err.message });
  }
};

// Get a single movie by ID
exports.getMovieById = async (req, res) => {
  try {
    // Get movie ID from URL params
    const { id } = req.params;
    // Find the movie by ID
    const movie = await Movie.findById(id);
    // If not found, return 404
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    // Respond with the movie
    res.json(movie);
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: 'Failed to fetch movie', error: err.message });
  }
};

// Update a movie by ID (admin or authorized user)
exports.updateMovie = async (req, res) => {
  try {
    // Get movie ID from URL params and new data from body
    const { id } = req.params;
    const movieData = req.body;
    // Find and update the movie
    const movie = await Movie.findByIdAndUpdate(id, movieData, { new: true });
    // If not found, return 404
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    // Respond with updated movie
    res.json(movie);
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: 'Failed to update movie', error: err.message });
  }
};

// Delete a movie by ID (admin or authorized user)
exports.deleteMovie = async (req, res) => {
  try {
    // Get movie ID from URL params
    const { id } = req.params;
    // Find and delete the movie
    const movie = await Movie.findByIdAndDelete(id);
    // If not found, return 404
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    // Respond with success message
    res.json({ message: 'Movie deleted' });
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: 'Failed to delete movie', error: err.message });
  }
};



exports.searchMoviessByPrefix = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);
    // Case-insensitive prefix search on name or category
    const regex = new RegExp('^' + q, 'i');
    const movies = await Movie.find({
      $or: [
        { Title: { $regex: regex } },
        { Genre: { $regex: regex } }
      ]
    });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
