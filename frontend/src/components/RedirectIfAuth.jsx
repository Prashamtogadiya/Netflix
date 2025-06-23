import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import api from '../api';
import { setUser } from '../features/user/userSlice';

// This component prevents logged-in users from accessing login/signup pages.
// If the user is authenticated, they are redirected to /profiles.
export default function RedirectIfAuth({ children }) {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(!!user);

  useEffect(() => {
    // If user is not in Redux, check with backend if user is authenticated
    if (!user) {
      api.get('/auth/check')
        .then(res => {
          if (res.data.authenticated) {
            // Also store the user's role if available
            dispatch(setUser({
              userId: res.data.userId,
              email: res.data.email,
              role: res.data.role // <-- make sure backend sends this!
            }));
            setIsAuth(true);
          } else {
            setIsAuth(false);
          }
        })
        .catch(err => {
          if (err.response && err.response.status !== 401) {
            // Optionally log other errors
          }
          setIsAuth(false);
        })
        .finally(() => setChecking(false));
    } else {
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