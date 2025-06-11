// Import express for routing
const express = require('express');
// Import profile controllers
const { createProfile, getProfiles, updateProfile, deleteProfile } = require('../controllers/profile.controller.js');
const { addMovieToMyList, removeMovieFromMyList, getMyList } = require('../controllers/profile.controller.js');

// Import authentication middleware to protect routes
const { authenticate } = require('../middlewares/auth.middleware.js');
const router = express.Router();

// All routes below require authentication
router.use(authenticate);

// Route to create a new profile
router.post('/', createProfile);
// Route to get all profiles for the logged-in user
router.get('/', getProfiles);
// Route to update a profile by ID
router.put('/:id', updateProfile);
// Route to delete a profile by ID
router.delete('/:id', deleteProfile);
// Route to add a movie to a profile's myList
router.post('/mylist/add', addMovieToMyList);

// Route to remove a movie from a profile's myList
router.post('/mylist/remove', removeMovieFromMyList);
// Route to get all movies in a profile's myList (with details)
router.get('/:profileId/mylist', getMyList);

// Export the router to be used in server.js
module.exports = router;