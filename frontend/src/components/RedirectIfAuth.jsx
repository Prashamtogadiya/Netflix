import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import api from '../api';
import { setUser } from '../features/user/userSlice';

// This component prevents logged-in users from accessing login/signup pages.
// If the user is authenticated, they are redirected to /profiles.
export default function RedirectIfAuth({ children }) {
  const user = useSelector(state => state.user.user); // Get user from Redux
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(true); // Track if auth check is in progress
  const [isAuth, setIsAuth] = useState(!!user);   // Track if user is authenticated

  useEffect(() => {
    // If user is not in Redux, check with backend if user is authenticated
    if (!user) {
      api.get('/auth/check')
        .then(res => {
          // If authenticated, update Redux and set isAuth to true
          if (res.data.authenticated) {
            dispatch(setUser({ userId: res.data.userId, email: res.data.email }));
            setIsAuth(true);
          } else {
            setIsAuth(false);
          }
        })
        .catch(err => {
          // Suppress 401 error log for /auth/check (not logged in is normal)
          if (err.response && err.response.status !== 401) {
            // Optionally log other errors
            console.error(err);
          }
          setIsAuth(false);
        })
        .finally(() => setChecking(false)); // Done checking
    } else {
      // If user is already in Redux, no need to check backend
      setChecking(false);
      setIsAuth(true);
    }
  }, [user, dispatch]);

  // While checking authentication, render nothing (or a spinner)
  if (checking) return null;

  // If authenticated, redirect to /profiles
  if (isAuth) {
    return <Navigate to="/profiles" replace />;
  }
  // Otherwise, render the children (login/signup page)
  return children;
}