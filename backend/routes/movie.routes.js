// Import express for routing
const express = require('express');
const router = express.Router();
const {
  createMovie,
  getMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
  searchMoviessByPrefix,
  createGenre,
  createActor,
  getGenres,
  getActors
} = require('../controllers/movie.controller.js');
const { authenticate, verifyAdmin } = require('../middlewares/auth.middleware.js');

// Genre and Actor routes (controllers handle logic)
router.get('/genres', getGenres);
router.post('/genres', createGenre);
router.get('/actors', getActors);
router.post('/actors', createActor);

// Search
router.get('/search', searchMoviessByPrefix);

// Movie CRUD
router.post('/', authenticate, verifyAdmin, createMovie);
router.get('/', getMovies);
router.get('/:id', getMovieById);
router.put('/:id', authenticate, verifyAdmin, updateMovie);
router.delete('/:id', authenticate, verifyAdmin, deleteMovie);

// Export the router to be used in server.js
module.exports = router;