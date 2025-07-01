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
const multer = require('multer');
const path = require('path');

// Multer config for movie and actor images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure the uploads directory exists
    const uploadPath = path.join(__dirname, '../uploads');
    const fs = require('fs');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Save with unique timestamp + original name
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});
const upload = multer({ storage });

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

// Upload movie images (multiple)
router.post('/upload/movie-images', upload.array('images', 5), (req, res) => {
  // Returns array of filenames
  const files = req.files || [];
  res.json({ filenames: files.map(f => f.filename) });
});

// Upload actor images (multiple)
router.post('/upload/actor-images', upload.array('images', 5), (req, res) => {
  const files = req.files || [];
  res.json({ filenames: files.map(f => f.filename) });
});

// Export the router to be used in server.js
module.exports = router;