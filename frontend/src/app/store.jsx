import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user/userSlice';
import profileReducer from '../features/profiles/profileSlice';

// This is the main Redux store for the app.
// It combines all the reducers (user, profiles, movies) into a single store.
const store = configureStore({
  reducer: {
    user: userReducer,        // Handles user authentication state
    profiles: profileReducer, // Handles profiles and selected profile state
  },
});

export default store;