import { createSlice } from '@reduxjs/toolkit';

// This slice manages the state for movies.
const movieSlice = createSlice({
  name: 'movies',
  // Initial state: an array of movies
  initialState: { movies: [] },
  reducers: {
    // Set the list of movies
    setMovies: (state, action) => { state.movies = action.payload; },
    // Clear the list of movies
    clearMovies: (state) => { state.movies = []; },
  },
});

// Export the actions for use in components
export const { setMovies, clearMovies } = movieSlice.actions;
// Export the reducer to be included in the Redux store
export default movieSlice.reducer;