import React from "react";
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

// This component protects routes that require authentication.
// If the user is not logged in, redirect to /login.
// If accessing /dashboard without a selected profile, redirect to /profiles.
export default function RequireAuth({ children, adminOnly }) {
  const user = useSelector(state => state.user.user); // Get user from Redux
  const selectedProfile = useSelector(state => state.profiles.selectedProfile); // Get selected profile from Redux
  const location = useLocation();

  // Only redirect to login if user is truly missing
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Only redirect to profiles if on dashboard and profile is missing
  if (
    location.pathname.startsWith('/dashboard') &&
    !selectedProfile
  ) {
    return <Navigate to="/profiles" replace />;
  }

  // Fix: Check for admin role robustly (handle undefined/null role)
  if (adminOnly && (!user.role || user.role !== "admin")) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the protected children
  return children;
}