// Import express for routing
const express = require('express');
// Import movie controllers
const { createMovie, getMovies, getMovieById, updateMovie, deleteMovie } = require('../controllers/movie.controller.js');
// Import authentication middleware (optional, for protected routes)
const { authenticate } = require('../middlewares/auth.middleware.js');
const router = express.Router();

// Route to create a new movie (protected, e.g., admin only)
router.post('/', authenticate, createMovie);
// Route to get all movies (public)
router.get('/', getMovies);
// Route to get a single movie by ID (public)
router.get('/:id', getMovieById);
// Route to update a movie by ID (protected, e.g., admin only)
router.put('/:id', authenticate, updateMovie);
// Route to delete a movie by ID (protected, e.g., admin only)
router.delete('/:id', authenticate, deleteMovie);

// Export the router to be used in server.js
module.exports = router;