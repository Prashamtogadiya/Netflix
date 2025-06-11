// Import express for routing
const express = require('express');
// Import authentication controllers
const { signup, login, logout, refresh } = require('../controllers/auth.controller.js');
const { authenticate } = require('../middlewares/auth.middleware.js');
const router = express.Router();

// Route for user signup
router.post('/signup', signup);
// Route for user login
router.post('/login', login);
// Route for user logout
router.post('/logout', logout);
// Route for refreshing JWT tokens
router.post('/refresh', refresh);
// Route for checking if user is authenticated
router.get('/check', authenticate, (req, res) => {
  res.json({ authenticated: true, userId: req.user.userId, email: req.user.email });
});

// Export the router to be used in server.js
module.exports = router;