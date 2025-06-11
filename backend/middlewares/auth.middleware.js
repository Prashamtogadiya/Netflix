// Import jsonwebtoken for JWT verification
const jwt = require('jsonwebtoken');
// Get access token secret from environment or use default
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';

// Middleware to authenticate requests using JWT in cookies
exports.authenticate = (req, res, next) => {
  // Get access token from cookies
  const token = req.cookies.accessToken;
  // If no token, respond with 401 Unauthorized
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    // Verify the token and get the payload (user info)
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    // Attach user info to request object for use in controllers
    req.user = payload;
    // Continue to next middleware or route handler
    next();
  } catch (err) {
    // If token is invalid, respond with 401 Unauthorized
    res.status(401).json({ message: 'Invalid token' });
  }
};