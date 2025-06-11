import { createSlice } from '@reduxjs/toolkit';

// This slice manages the state for the authenticated user.
const userSlice = createSlice({
  name: 'user',
  // Initial state: user is null (not logged in)
  initialState: { user: null },
  reducers: {
    // Set the user object (after login or signup)
    setUser: (state, action) => { 
      state.user = action.payload;
      // Persist user to localStorage
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    // Clear the user object (on logout)
    clearUser: (state) => { 
      state.user = null;
      // Remove user from localStorage
      localStorage.removeItem("user");
    },
  },
});

// Export the actions for use in components
export const { setUser, clearUser } = userSlice.actions;
// Export the reducer to be included in the Redux store
export default userSlice.reducer;