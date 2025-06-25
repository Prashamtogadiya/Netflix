import React from "react";
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAuth({ children, adminOnly }) {
  const user = useSelector(state => state.user.user); // Get user from Redux
  const selectedProfile = useSelector(state => state.profiles.selectedProfile); // Get selected profile from Redux
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
    location.pathname.startsWith('/dashboard') &&
    !selectedProfile
  ) {
    return <Navigate to="/profiles" replace />;
  }

  if (adminOnly && (!user.role || user.role !== "admin")) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}