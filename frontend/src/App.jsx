import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import MakeNewProfile from "./pages/MakeNewProfile";
import MovieDetailPage from "./pages/MovieDetailPage";
import MyListPage from "./pages/MyListPage";
import RequireAuth from "./components/RequireAuth";
import RedirectIfAuth from "./components/RedirectIfAuth";
import { useDispatch } from "react-redux";
import { setSelectedProfile } from "./features/profiles/profileSlice";
import { setUser } from "./features/user/userSlice";
import Movies from "./pages/Movies";
import AllMoviesPage from "./pages/AllMoviesPage";
import AdminPanelPage from "./pages/AdminPanelPage";

function App() {
  const dispatch = useDispatch();
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    // Restore user from localStorage if present
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      dispatch(setUser(JSON.parse(storedUser)));
    }
    // Restore selectedProfile from localStorage if present
    const storedProfile = localStorage.getItem("selectedProfile");
    if (storedProfile) {
      dispatch(setSelectedProfile(JSON.parse(storedProfile)));
    }
    setRestored(true);
  }, [dispatch]);

  // Only render routes after restoration is complete
  if (!restored) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <RedirectIfAuth>
              <SignupPage />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectIfAuth>
              <LoginPage />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/signup"
          element={
            <RedirectIfAuth>
              <SignupPage />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/profiles"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/makenewprofile"
          element={
            <RequireAuth>
              <MakeNewProfile />
            </RequireAuth>
          }
        />
        <Route
          path="/movies/:movieId"
          element={
            <RequireAuth>
              <MovieDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/mylist"
          element={
            <RequireAuth>
              <MyListPage />
            </RequireAuth>
          }
        />
        <Route
          path="/movies"
          element={
            <RequireAuth>
              <Movies />
            </RequireAuth>
          }
        />
        <Route
          path="/allmovies"
          element={
            <RequireAuth>
              <AllMoviesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth adminOnly>
              <AdminPanelPage />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
