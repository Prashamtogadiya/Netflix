// Import User model for database operations
const User = require('../models/User.js')
// Import bcryptjs for password hashing and comparison
const bcrypt = require('bcryptjs');
// Import jsonwebtoken for JWT creation and verification
const jwt = require('jsonwebtoken');

// Get secrets from environment variables or use defaults
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

// Helper function to generate access and refresh tokens for a user
const generateTokens = (user) => {
  // Create access token with userId and email, expires in 15 minutes
  const accessToken = jwt.sign(
    { userId: user._id, email: user.email },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );
  // Create refresh token with userId and email, expires in 7 days
  const refreshToken = jwt.sign(
    { userId: user._id, email: user.email },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

// Controller for user signup/registration
exports.signup = async (req, res) => {
  // Destructure email, password, and name from request body
  const { email, password, name } = req.body;
  try {
    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create the user in the database
    const user = await User.create({ email, password: hashedPassword, name });

    // Generate tokens and save refresh token in DB
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    // Set tokens as HTTP-only cookies
    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'strict' });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' });
    // Respond with success and user ID
    res.status(201).json({ message: 'User created', userId: user._id });
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

// Controller for user login
exports.login = async (req, res) => {
  // Destructure email and password from request body
  const { email, password } = req.body;
  try {
    // Check if both fields are present
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Compare password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate tokens and save refresh token in DB
    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    // Set tokens as HTTP-only cookies
    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'strict' });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' });
    // Respond with success and user ID
    res.status(200).json({ message: 'Login successful', userId: user._id });
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// Controller for user logout
exports.logout = async (req, res) => {
  // Get refreshToken from cookies
  const { refreshToken } = req.cookies;
  try {
    // If refreshToken exists, find user and remove it from DB
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }
    // Clear cookies on client
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    // Respond with success
    res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
};

// Controller to refresh access token using refresh token
exports.refresh = async (req, res) => {
  // Get refreshToken from cookies
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

  try {
    // Verify refresh token
    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    // Find user with matching ID and refresh token
    const user = await User.findOne({ _id: payload.userId, refreshToken });
    if (!user) return res.status(403).json({ message: 'Invalid refresh token' });

    // Generate new tokens and save new refresh token in DB
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new tokens as HTTP-only cookies
    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'strict' });
    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, sameSite: 'strict' });
    // Respond with success
    res.status(200).json({ message: 'Token refreshed' });
  } catch (err) {
    // Handle errors
    res.status(403).json({ message: 'Invalid refresh token', error: err.message });
  }
};

// Controller to check authentication status
exports.checkAuth = async (req, res) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;
  try {
    // Try access token first
    if (accessToken) {
      try {
        const payload = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
        return res.json({ authenticated: true, userId: payload.userId, email: payload.email });
      } catch (err) {
        // If token expired, continue to refresh
        if (err.name !== "TokenExpiredError") {
          return res.status(401).json({ authenticated: false, message: "Invalid access token" });
        }
      }
    }
    // Try refresh token
    if (refreshToken) {
      try {
        const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        // Find user with matching ID and refresh token
        const user = await User.findOne({ _id: payload.userId, refreshToken });
        if (!user) return res.status(403).json({ authenticated: false, message: 'Invalid refresh token' });

        // Generate new tokens and save new refresh token in DB
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);
        user.refreshToken = newRefreshToken;
        await user.save();

        // Set new tokens as HTTP-only cookies
        res.cookie('accessToken', newAccessToken, { httpOnly: true, sameSite: 'strict' });
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, sameSite: 'strict' });

        return res.json({ authenticated: true, userId: user._id, email: user.email });
      } catch (err) {
        return res.status(403).json({ authenticated: false, message: 'Invalid refresh token' });
      }
    }
    return res.status(401).json({ authenticated: false, message: "No valid token" });
  } catch (err) {
    return res.status(500).json({ authenticated: false, message: "Auth check failed", error: err.message });
  }
};