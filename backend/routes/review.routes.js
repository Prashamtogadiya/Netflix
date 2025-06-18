const express = require('express');
const { addReview, getReviews } = require('../controllers/review.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const router = express.Router();

// Add a review to a movie (protected)
router.post('/:movieId', authenticate, addReview);
router.get('/:movieId', getReviews);

module.exports = router;
