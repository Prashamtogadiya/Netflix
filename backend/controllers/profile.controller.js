// Import Profile and User models for database operations
const Profile = require('../models/Profile.js');
const User = require('../models/User.js');
// FIX: Only import Movie, not destructure
const Movie = require('../models/Movie.js').Movie;

// Create a new profile for the logged-in user
exports.createProfile = async (req, res) => {
  try {
    // Get name and avatar from request body
    const { name, avatar } = req.body;
    // Get userId from JWT payload set by auth middleware
    const userId = req.user.userId;
    // Create the profile in the database
    const profile = await Profile.create({ userId, name, avatar, myList: [] });

    // Add the new profile's ID to the user's profiles array
    await User.findByIdAndUpdate(
      userId,
      { $push: { profiles: profile._id } },
      { new: true }
    );

    // Respond with the created profile
    res.status(201).json(profile);
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: 'Failed to create profile', error: err.message });
  }
};

// Get all profiles for the logged-in user
exports.getProfiles = async (req, res) => {
  try {
    // Get userId from JWT payload
    const userId = req.user.userId;
    // Find all profiles belonging to this user
    const profiles = await Profile.find({ userId });
    // Respond with the profiles
    res.json(profiles);
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: 'Failed to fetch profiles', error: err.message });
  }
};

// Update a profile (only if it belongs to the logged-in user)
exports.updateProfile = async (req, res) => {
  try {
    // Get profile ID from URL params and new data from body
    const { id } = req.params;
    const { name, avatar } = req.body;
    const userId = req.user.userId;
    // Find and update the profile if it belongs to the user
    const profile = await Profile.findOneAndUpdate(
      { _id: id, userId },
      { name, avatar },
      { new: true }
    );
    // If profile not found, return 404
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    // Respond with updated profile
    res.json(profile);
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

// Delete a profile (only if it belongs to the logged-in user)
exports.deleteProfile = async (req, res) => {
  try {
    // Get profile ID from URL params and userId from JWT
    const { id } = req.params;
    const userId = req.user.userId;
    // Find and delete the profile if it belongs to the user
    const profile = await Profile.findOneAndDelete({ _id: id, userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    // Remove the profile's ID from the user's profiles array
    await User.findByIdAndUpdate(
      userId,
      { $pull: { profiles: id } }
    );

    // Respond with success message
    res.json({ message: 'Profile deleted' });
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: 'Failed to delete profile', error: err.message });
  }
};


// Add a movie to a profile's myList
exports.addMovieToMyList = async (req, res) => {
  try {
    const { profileId, movieId } = req.body; // Get from body
    const userId = req.user.userId;

    // Ensure the profile belongs to the logged-in user
    const profile = await Profile.findOne({ _id: profileId, userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found or unauthorized' });

    // Add movieId to myList if not already present
    if (!profile.myList.includes(movieId)) {
      profile.myList.push(movieId);
      await profile.save();
    }

    res.json({ message: 'Movie added to My List', myList: profile.myList });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add movie to My List', error: err.message });
  }
};

// Remove a movie from a profile's myList
exports.removeMovieFromMyList = async (req, res) => {
  try {
    const { profileId, movieId } = req.body; // Get from body
    const userId = req.user.userId;

    // Ensure the profile belongs to the logged-in user
    const profile = await Profile.findOne({ _id: profileId, userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found or unauthorized' });

    // Remove movieId from myList
    profile.myList = profile.myList.filter(id => id.toString() !== movieId);
    await profile.save();

    res.json({ message: 'Movie removed from My List', myList: profile.myList });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove movie from My List', error: err.message });
  }
};

// Get all movies in a profile's myList (with movie details)
exports.getMyList = async (req, res) => {
  try {
    const { profileId } = req.params;
    const userId = req.user.userId;

    // Ensure the profile belongs to the logged-in user
    const profile = await Profile.findOne({ _id: profileId, userId }).populate('myList');
    if (!profile) return res.status(404).json({ message: 'Profile not found or unauthorized' });

    res.json({ myList: profile.myList });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch My List', error: err.message });
  }
};


// Update the watched categories map for a profile
exports.updateWatchedCategories = async (req, res) => {
  const { profileId, movieId } = req.body;
  try {
    if (!profileId || !movieId) {
      console.error("Missing profileId or movieId", { profileId, movieId });
      return res.status(400).json({ message: 'profileId and movieId are required' });
    }
    const profile = await Profile.findById(profileId);
    const movie = await Movie.findById(movieId).populate('Genre', 'name');
    if (!profile || !movie) {
      console.error("Profile or movie not found", { profile, movie });
      return res.status(404).json({ message: 'Profile or movie not found' });
    }
    // Ensure watchedCategories is an object
    if (!profile.watchedCategories || typeof profile.watchedCategories !== 'object') {
      profile.watchedCategories = {};
    }
    // Defensive: handle Genre as array of objects, strings, or ObjectIds
    let updated = false;
    if (Array.isArray(movie.Genre)) {
      movie.Genre.forEach((genre) => {
        let name = "";
        if (typeof genre === "object" && genre !== null) {
          name = genre.name || genre.toString();
        } else if (typeof genre === "string") {
          name = genre;
        }
        if (!name) return;
        profile.watchedCategories[name] = (profile.watchedCategories[name] || 0) + 1;
        updated = true;
      });
    } else if (movie.Genre) {
      let name = "";
      if (typeof movie.Genre === "object" && movie.Genre !== null) {
        name = movie.Genre.name || movie.Genre.toString();
      } else if (typeof movie.Genre === "string") {
        name = movie.Genre;
      }
      if (name) {
        profile.watchedCategories[name] = (profile.watchedCategories[name] || 0) + 1;
        updated = true;
      }
    }
    if (updated) {
      profile.markModified('watchedCategories');
      await profile.save();
    }
    res.json({ message: 'Watched categories updated', watchedCategories: profile.watchedCategories });
  } catch (err) {
    console.error("updateWatchedCategories error:", err); // <-- Add this for debugging
    res.status(500).json({ message: 'Failed to update watched categories', error: err.message });
  }
}

exports.getWatchedCategories = async (req, res) => {
  const { profileId} = req.body;
  try{
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    } 
    res.json({watchedCategories: profile.watchedCategories});
  }catch (err) {
    res.status(500).json({ message: 'Failed to fetch watched categories', error: err.message });
  }
}
