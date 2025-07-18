const { Movie } = require('../models/Movie');
require('../models/User');
const mongoose = require('mongoose');

// Add a review to a movie
exports.addReview = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { rating, comment } = req.body; 
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    // Add the review to the movie's reviews array
    movie.Reviews.push({
      user: userId,
      rating,
      comment, 
      createdAt: new Date()
    });
    await movie.save();

    // Populate the user info for the new review
    const populatedMovie = await Movie.findById(movieId).populate('Reviews.user', 'name');
    res.status(201).json({ message: 'Review added', reviews: populatedMovie.Reviews });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add review', error: err.message });
  }
};

// Get all reviews for a movie (with user info)
exports.getReviews = async (req, res) => {
  try {
    const { movieId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }
    const movie = await Movie.findById(movieId).populate('Reviews.user', 'name');
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    res.json({ reviews: movie.Reviews });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: err.message });
  }
};
