// Import Profile and User models for database operations
const Profile = require("../models/Profile.js");
const User = require("../models/User.js");
// FIX: Only import Movie, not destructure
const Movie = require("../models/Movie.js").Movie;

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
    res
      .status(500)
      .json({ message: "Failed to create profile", error: err.message });
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
    res
      .status(500)
      .json({ message: "Failed to fetch profiles", error: err.message });
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
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    // Respond with updated profile
    res.json(profile);
  } catch (err) {
    // Handle errors
    res
      .status(500)
      .json({ message: "Failed to update profile", error: err.message });
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
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // Remove the profile's ID from the user's profiles array
    await User.findByIdAndUpdate(userId, { $pull: { profiles: id } });

    // Respond with success message
    res.json({ message: "Profile deleted" });
  } catch (err) {
    // Handle errors
    res
      .status(500)
      .json({ message: "Failed to delete profile", error: err.message });
  }
};

// Add a movie to a profile's myList
exports.addMovieToMyList = async (req, res) => {
  try {
    const { profileId, movieId } = req.body; // Get from body
    const userId = req.user.userId;

    // Ensure the profile belongs to the logged-in user
    const profile = await Profile.findOne({ _id: profileId, userId });
    if (!profile)
      return res
        .status(404)
        .json({ message: "Profile not found or unauthorized" });

    // Add movieId to myList if not already present
    if (!profile.myList.includes(movieId)) {
      profile.myList.push(movieId);
      await profile.save();
    }

    res.json({ message: "Movie added to My List", myList: profile.myList });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add movie to My List", error: err.message });
  }
};

// Remove a movie from a profile's myList
exports.removeMovieFromMyList = async (req, res) => {
  try {
    const { profileId, movieId } = req.body; // Get from body
    const userId = req.user.userId;

    // Ensure the profile belongs to the logged-in user
    const profile = await Profile.findOne({ _id: profileId, userId });
    if (!profile)
      return res
        .status(404)
        .json({ message: "Profile not found or unauthorized" });

    // Remove movieId from myList
    profile.myList = profile.myList.filter((id) => id.toString() !== movieId);
    await profile.save();

    res.json({ message: "Movie removed from My List", myList: profile.myList });
  } catch (err) {
    res.status(500).json({
      message: "Failed to remove movie from My List",
      error: err.message,
    });
  }
};

// Get all movies in a profile's myList (with movie details)
exports.getMyList = async (req, res) => {
  try {
    const { profileId } = req.params;
    const userId = req.user.userId;

    // Ensure the profile belongs to the logged-in user
    const profile = await Profile.findOne({ _id: profileId, userId }).populate(
      "myList"
    );
    if (!profile)
      return res
        .status(404)
        .json({ message: "Profile not found or unauthorized" });

    res.json({ myList: profile.myList });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch My List", error: err.message });
  }
};

// Update the watched categories map for a profile
exports.updateWatchedCategories = async (req, res) => {
  // Get profileId and movieId from the request body
  const { profileId, movieId } = req.body;
  try {
    // Check if both profileId and movieId are provided
    if (!profileId || !movieId) {
      // If missing, send a 400 error
      console.error("Missing profileId or movieId", { profileId, movieId });
      return res
        .status(400)
        .json({ message: "profileId and movieId are required" });
    }
    // Find the profile by its ID
    const profile = await Profile.findById(profileId);
    // Find the movie by its ID and get its Genre field
    const movie = await Movie.findById(movieId).populate("Genre", "name");
    // If either profile or movie is not found, return 404
    if (!profile || !movie) {
      console.error("Profile or movie not found", { profile, movie });
      return res.status(404).json({ message: "Profile or movie not found" });
    }
    // Make sure watchedCategories exists and is an object
    if (
      !profile.watchedCategories ||
      typeof profile.watchedCategories !== "object"
    ) {
      profile.watchedCategories = {};
    }
    // This flag checks if we actually update anything
    let updated = false;
    // If the movie has multiple genres (array), handle each one
      movie.Genre.forEach((genre) => {
        if (genre && genre.name) {
          const name = genre.name;
          profile.watchedCategories[name] =
            (profile.watchedCategories[name] || 0) + 1;
          updated = true;
        }
      });
    
    // If we updated watchedCategories, save the profile
    if (updated) {
      profile.markModified("watchedCategories");
      await profile.save();
    }
    // Send back the updated watchedCategories
    res.json({
      message: "Watched categories updated",
      watchedCategories: profile.watchedCategories,
    });
  } catch (err) {
    // Log and send error if something goes wrong
    console.error("updateWatchedCategories error:", err);
    res.status(500).json({
      message: "Failed to update watched categories",
      error: err.message,
    });
  }
};

// Get watched Categories for a profile
exports.getWatchedCategories = async (req, res) => {
  // Get profileId from the request body
  const { profileId } = req.body;
  try {
    // Find the profile by its ID
    const profile = await Profile.findById(profileId);
    // If profile is not found, return 404
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    // Send back the watchedCategories object
    res.json({ watchedCategories: profile.watchedCategories });
  } catch (err) {
    // Send error if something goes wrong
    res.status(500).json({
      message: "Failed to fetch watched categories",
      error: err.message,
    });
  }
};


exports.addOrUpdateWatchHistory = async (req,res)=>{
  try{
    const {profileId,movieId,progress,duration}=req.body
    if(!profileId || !movieId){
      return res.status(400).json({message:"profileId and movieId are required"})
    }
    const profile = await Profile.findById(profileId);
    if(!profile){
      return res.status(404).json({message:"Profile not found"})
    }

    profile.watchHistory = profile.watchHistory.filter(
      (entry) => entry.movie.toString() !== movieId
    );
    profile.watchHistory.unshift({
      movie: movieId,
      watchedAt: new Date(), // <-- fix typo here
      progress: progress || 0,
      duration: duration || 0
    });

    profile.watchHistory = profile.watchHistory.slice(0, 100); // Keep only the last 100 entries
    await profile.save();
    res.json({message:"Watch history updated", watchHistory: profile.watchHistory});
  }catch(err){
    console.error("Failed to update watch history:", err);
    res.status(500).json({message:"Failed to update watch history", error: err.message});
  }
}

exports.getWatchHistory = async(req,res)=>{
  try{
    const {profileId} = req.body;
    if(!profileId){
      return res.status(400).json({message:"profileId is required"});
    }
    const profile = await Profile.findById(profileId).populate("watchHistory.movie");
    if(!profile){
      return res.status(404).json({message:"Profile not found"});
    }
    res.json({watchHistory: profile.watchHistory});
  }catch(err){
    console.error("Failed to fetch watch history:", err);
    res.status(500).json({message:"Failed to fetch watch history", error: err.message});
  }
}
