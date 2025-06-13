import axios from 'axios';
import store from '../app/store';
import { clearUser } from '../features/user/userSlice';
import { clearProfiles } from '../features/profiles/profileSlice';

// Create an Axios instance for making API requests to the backend
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Base URL for all API requests
  withCredentials: true, // Send cookies with requests (for auth)
});

// Add a response interceptor to handle token refresh logic
api.interceptors.response.use(
  response => response, // If response is OK, just return it
  async error => {
    const originalRequest = error.config;
    
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.endsWith('/auth/refresh') &&
      !originalRequest.url.endsWith('/auth/logout') &&
      !originalRequest.url.endsWith('/auth/check')
    ) {
      originalRequest._retry = true; // Mark this request as a retry
      try {
        // Try to refresh the access token
        console.log("Refreshing access token...");
        await api.post('/auth/refresh');
        // Retry the original request after refreshing token
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear user/profile from Redux and localStorage
        store.dispatch(clearUser());
        store.dispatch(clearProfiles());
        localStorage.removeItem("user");
        localStorage.removeItem("selectedProfile");
        // Redirect to login (unless already on login/signup)
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    // For all other errors, just reject the promise
    return Promise.reject(error);
  }
);

export default api;