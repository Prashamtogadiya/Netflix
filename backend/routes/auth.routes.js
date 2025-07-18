// // Import express for routing
// const express = require('express');
// // Import authentication controllers
// const { signup, login, logout, refresh } = require('../controllers/auth.controller.js');
// const { authenticate } = require('../middlewares/auth.middleware.js');
// const { checkAuth } = require('../controllers/auth.controller.js');
// const router = express.Router();

// // Route for user signup
// router.post('/signup', signup);
// // Route for user login
// router.post('/login', login);
// // Route for user logout
// router.post('/logout', logout);
// // Route for refreshing JWT tokens
// router.post('/refresh', refresh);
// // Route for checking if user is authenticated (works with access or refresh token)
// router.get('/check', checkAuth);

// // Export the router to be used in server.js
// module.exports = router;



// Example: backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login); // This is now for USERS only
router.post('/admin/login', authController.adminLogin); // NEW route for ADMINS
router.post('/logout', authController.logout);
router.get('/refresh', authController.refresh);
router.get('/check', authController.checkAuth);

module.exports = router;
