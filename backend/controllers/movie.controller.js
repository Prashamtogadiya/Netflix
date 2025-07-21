// Import the Movie model for database operations
const { Movie, Genre, Actor } = require('../models/Movie.js');

// Create a new movie (admin or authorized user)
exports.createMovie = async (req, res) => {
  try {
    // Get movie data from request body
    const movieData = req.body;
    const movie = await Movie.create(movieData);
    res.status(201).json(movie);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create movie', error: err.message });
  }
};

// Get all movies
exports.getMovies = async (req, res) => {
  try {
    // Find all movies in the database and populate actors and genres
    const movies = await Movie.find()
      .populate('Actors', 'name')
      .populate('Genre', 'name');
    // Respond with the list of movies
    res.json(movies);
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: 'Failed to fetch movies', error: err.message });
  }
};

// Get a single movie by ID
exports.getMovieById = async (req, res) => {
  try {
    // Get movie ID from URL params
    const { id } = req.params;
    // Find the movie by ID and populate actors and genres
    const movie = await Movie.findById(id)
      .populate('Actors', 'name')
      .populate('Genre', 'name');
    // If not found, return 404
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    // Respond with the movie
    res.json(movie);
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: 'Failed to fetch movie', error: err.message });
  }
};

// Update a movie by ID (admin or authorized user)
exports.updateMovie = async (req, res) => {
  try {
    // Get movie ID from URL params and new data from body
    const { id } = req.params;
    const movieData = req.body;
    // Find and update the movie, then populate actors and genres
    const movie = await Movie.findByIdAndUpdate(id, movieData, { new: true })
      .populate('Actors', 'name')
      .populate('Genre', 'name');
    // If not found, return 404
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    // Respond with updated movie
    res.json(movie);
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: 'Failed to update movie', error: err.message });
  }
};

// Delete a movie by ID (admin or authorized user)
exports.deleteMovie = async (req, res) => {
  try {
    // Get movie ID from URL params
    const { id } = req.params;
    // Find and delete the movie
    const movie = await Movie.findByIdAndDelete(id);
    // If not found, return 404
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    // Respond with success message
    res.json({ message: 'Movie deleted' });
  } catch (err) {
    // Handle errors
    res.status(500).json({ message: 'Failed to delete movie', error: err.message });
  }
};



exports.searchMoviessByPrefix = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);
    // Case-insensitive prefix search on Title and genre name
    const regex = new RegExp(q, 'i');
    // Find genres matching the query
    const { Genre } = require('../models/Movie.js');
    const matchedGenres = await Genre.find({ name: { $regex: regex } });
    const genreIds = matchedGenres.map(g => g._id);

    const movies = await Movie.find({
      $or: [
        { Title: { $regex: regex } },
        { Genre: { $in: genreIds } }
      ]
    })
      .populate('Genre', 'name')
      .populate('Actors', 'name');
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Genre controllers
exports.getGenres = async (req, res) => {
  try {
    const genres = await Genre.find({});
    res.status(200).json(genres || []);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch genres" });
  }
};

exports.createGenre = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Genre name is required" });
    const existing = await Genre.findOne({ name });
    if (existing) return res.status(400).json({ message: "Genre already exists" });
    const genre = await Genre.create({ name });
    res.status(201).json(genre);
  } catch (err) {
    res.status(500).json({ message: "Failed to add genre", error: err.message });
  }
};

exports.updateGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const genre = await Genre.findByIdAndUpdate(id, { name }, { new: true });
    if (!genre) return res.status(404).json({ message: "Genre not found" });
    res.status(200).json({ message: "Genre updated", genre });
  } catch (error) {
    res.status(500).json({ message: "Failed to update genre", error: error.message });
  }
};

exports.deleteGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const genre = await Genre.findByIdAndDelete(id);
    if (!genre) return res.status(404).json({ message: "Genre not found" });
    res.status(200).json({ message: "Genre deleted", genre });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete genre", error: error.message });
  }
};


// Actor controllers
exports.getActors = async (req, res) => {
  try {
    const actors = await Actor.find({});
    res.status(200).json(actors || []);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch actors" });
  }
};

// Add new Actor
exports.createActor = async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await Actor.findOne({ name });
    if (existing) return res.status(400).json({ message: "Actor already exists" });
    const actor = await Actor.create({ name });
    res.status(201).json(actor);
  } catch (err) {
    res.status(500).json({ message: "Failed to add actor", error: err.message });
  }
};

exports.updateActor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const actor = await Actor.findByIdAndUpdate(id, { name }, { new: true });
    if (!actor) return res.status(404).json({ message: "Actor not found" });
    res.status(200).json({ message: "Actor updated", actor });
  } catch (error) {
    res.status(500).json({ message: "Failed to update actor", error: error.message });
  }
};


// Delete Actor
exports.deleteActor = async(req,res)=>{
  try{
    const actor = await Actor.findByIdAndDelete(req.params.id);
    if(!actor) return res.status(404).json({message:"Actor not found"});
    res.status(200).json({message:"Actor deleted", actor});
  }catch(error){
    res.status(500).json({message:"Failed to delete actor", error: error.message});
  }
}

// Upload movie images controller
exports.uploadMovieImages = (req, res) => {
  const files = req.files || [];
  res.json({ filenames: files.map(f => f.filename) });
};

// Upload actor images controller
exports.uploadActorImages = (req, res) => {
  const files = req.files || [];
  res.json({ filenames: files.map(f => f.filename) });
};

// Get movies for hero carousel based on current hero mode
exports.getHeroCarouselMovies = async (req, res) => {
  try {
    const Setting = require("../models/Setting");
    // Get current hero mode from settings
    const modesDoc = await Setting.findOne({ type: "modes" });
    let heroMode = modesDoc && modesDoc.mode ? modesDoc.mode : null;
    // fallback: first mode in array
    if (!heroMode && modesDoc && Array.isArray(modesDoc.modes) && modesDoc.modes.length > 0) {
      heroMode = modesDoc.modes[0];
    }
    let movies = [];
    if (heroMode && heroMode.toLowerCase() === "most rated") {
      movies = await Movie.find()
        .sort({ Rating: -1 })
        .limit(6)
        .populate('Actors', 'name')
        .populate('Genre', 'name');
    } else if (heroMode && heroMode.toLowerCase() === "recently added") {
      movies = await Movie.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('Actors', 'name')
        .populate('Genre', 'name');
    } else {
      // fallback: top 6 most rated
      movies = await Movie.find()
        .sort({ Rating: -1 })
        .limit(6)
        .populate('Actors', 'name')
        .populate('Genre', 'name');
    }
    res.json({ movies, heroMode });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch hero carousel movies", error: err.message });
  }
};


exports.incrementSearches = async(req,res)=>{
  try{
      const {id} = req.body;
      if(!id) return res.status(400).json({message:"Movie ID is required"});
      const movie = await Movie.findById(id);
      if(!movie) return res.status(404).json({message:"Movie not found"});
      // Increment the Searches field
      movie.Searches = (movie.Searches || 0) + 1;
      await movie.save();
      res.status(200).json({message:"Searches incremented", Searches: movie.Searches});
      
  }catch(error){
    console.error("Failed to increment searches:", err);
    res.status(500).json({ message: "Failed to increment searches", error: error.message });
  }
}
