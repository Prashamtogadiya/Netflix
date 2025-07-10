// Import express for creating the server
const express = require('express');
// Import cookie-parser to parse cookies from requests
const cookieParser = require('cookie-parser');
// Import dotenv to load environment variables from .env file
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Import authentication and profile,movie routes
const authRoutes = require('./routes/auth.routes.js');
const profileRoutes = require('./routes/profile.routes.js');
const movieRoutes = require('./routes/movie.routes.js');
const reviewRoutes = require('./routes/review.routes.js');
const settingsRoutes = require('./routes/settings.routes');

// Import MongoDB connection function
const connectDB = require('./config/db.js');

// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app = express();
// Middleware to parse JSON bodies in requests
app.use(express.json());
// Middleware to parse cookies in requests
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount authentication routes at /api/auth
app.use('/api/auth', authRoutes);
// Mount profile routes at /api/profiles
app.use('/api/profiles', profileRoutes);
// Mount movie routes at /api/movies
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);


// Set the port from environment or default to 5000
const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});