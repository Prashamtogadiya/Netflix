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
  getActors,
  deleteActor,
  updateActor,
  uploadMovieImages,
  uploadActorImages,
  getHeroCarouselMovies,
  incrementSearches,
  deleteGenre,
  updateGenre
} = require('../controllers/movie.controller.js');
const { authenticate, verifyAdmin } = require('../middlewares/auth.middleware.js');
const multer = require('multer');
const path = require('path');

// Multer config for movie and actor images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 1. This function tells Multer where to save uploaded files.
    // It sets the destination to the 'uploads' folder in backend.
    // If the folder doesn't exist, it creates it.
    const uploadPath = path.join(__dirname, '../uploads');
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath); // cb(null, folderPath) tells Multer where to save the file
  },
  filename: function (req, file, cb) {
    // 2. This function tells Multer how to name each uploaded file.
    // It uses the current timestamp + field name + original extension.
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
    // The filename is what gets stored in the DB
  }
});
const upload = multer({ storage });

// Genre and Actor routes 
router.get('/genres', getGenres);
router.post('/genres', createGenre);
router.put('/genres/update/:id', authenticate, verifyAdmin, updateGenre)
router.delete('/genres/delete/:id', authenticate, verifyAdmin,deleteGenre)
router.get('/actors', getActors);
router.post('/actors', createActor);
router.put('/actors/update/:id', authenticate, verifyAdmin, updateActor)
router.delete('/actors/delete/:id', authenticate, verifyAdmin, deleteActor)

// Search
router.get('/search', searchMoviessByPrefix);

// Movie CRUD
router.post('/', authenticate, verifyAdmin, createMovie);

router.get('/', getMovies);
router.get('/:id', getMovieById);
router.put('/:id', authenticate, verifyAdmin, updateMovie);
router.delete('/:id', authenticate, verifyAdmin, deleteMovie);

// Upload movie images (multiple)
router.post(
  '/upload/movie-images',
  upload.array('images', 5), 
  uploadMovieImages
);

// Upload actor images (multiple)
router.post(
  '/upload/actor-images',
  upload.array('images', 5), 
  uploadActorImages
);

// Hero carousel movies
router.get('/hero-carousel', getHeroCarouselMovies);

router.post('/increment-searches', authenticate, incrementSearches);

// Export the router to be used in server.js
module.exports = router;