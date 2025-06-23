// Import express for routing
const express = require('express');
// Import movie controllers
const { createMovie, getMovies, getMovieById, updateMovie, deleteMovie, searchMoviessByPrefix } = require('../controllers/movie.controller.js');
// Import authentication middleware (optional, for protected routes)
const { authenticate, verifyAdmin } = require('../middlewares/auth.middleware.js');
const router = express.Router();


router.get('/search', searchMoviessByPrefix );

// Route to create a new movie (protected, admin only)
router.post('/', authenticate, verifyAdmin, createMovie);
// Route to get all movies (public)
router.get('/', getMovies);
// Route to get a single movie by ID (public)
router.get('/:id', getMovieById);
// Route to update a movie by ID (protected, admin only)
router.put('/:id', authenticate, verifyAdmin, updateMovie);
// Route to delete a movie by ID (protected, admin only)
router.delete('/:id', authenticate, verifyAdmin, deleteMovie);

// Export the router to be used in server.js
module.exports = router;