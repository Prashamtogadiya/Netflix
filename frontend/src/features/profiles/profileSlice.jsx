import { createSlice } from '@reduxjs/toolkit';

// This slice manages the state for user profiles and the currently selected profile.
const profileSlice = createSlice({
  name: 'profiles',
  // Initial state: an array of all profiles and the selected profile (null by default)
  initialState: { profiles: [], selectedProfile: null },
  reducers: {
    // Set the list of all profiles
    setProfiles: (state, action) => { state.profiles = action.payload; },
    // Set the currently selected profile
    setSelectedProfile: (state, action) => { 
      state.selectedProfile = action.payload;
      // Persist selectedProfile to localStorage
      localStorage.setItem("selectedProfile", JSON.stringify(action.payload));
    },
    // Clear all profiles and the selected profile (used on logout)
    clearProfiles: (state) => { 
      state.profiles = []; 
      state.selectedProfile = null;
      // Remove selectedProfile from localStorage
      localStorage.removeItem("selectedProfile");
    },
  },
});

// Export the actions for use in components
export const { setProfiles, setSelectedProfile, clearProfiles } = profileSlice.actions;
// Export the reducer to be included in the Redux store
export default profileSlice.reducer;