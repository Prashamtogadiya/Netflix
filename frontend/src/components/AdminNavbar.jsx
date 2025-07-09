import React, { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";
import {  useDispatch } from "react-redux";

import api from "../api";
import { clearUser } from "../features/user/userSlice";
import { clearProfiles } from "../features/profiles/profileSlice";
import { useNavigate } from "react-router-dom";
export default function AdminNavbar({ onHeroModeChange }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [heroMode, setHeroMode] = useState(
    localStorage.getItem("heroCarouselMode") || "mostRated"
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (onHeroModeChange) onHeroModeChange(heroMode);
  }, [heroMode, onHeroModeChange]);

  const handleHeroModeChange = (mode) => {
    setHeroMode(mode);
    localStorage.setItem("heroCarouselMode", mode);
    setSettingsOpen(false);
    // Optionally, trigger a storage event for other tabs
    window.dispatchEvent(new Event("storage"));
  };

  const handleLogout = async () => {
    await api.post("/auth/logout");
    dispatch(clearUser());
    dispatch(clearProfiles());
    navigate("/login");
  };


  return (
    <nav className="fixed top-0 left-0 w-full z-30 bg-gray-950 border-b border-gray-800 flex items-center justify-between px-8 py-4">
      <div className="flex items-center gap-8">
        {/* Netflix logo with transparent background */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
          className="h-16 w-25"
          alt="Netflix"
          style={{ background: "transparent" }}
        />
        <a
          href="/dashboard"
          className="text-white font-semibold hover:text-red-500 transition"
        >
          Home
        </a>{" "}
      </div>
      <div className="flex items-center gap-4 relative">
        <div>
          <SearchBar />
        </div>
        {/* Settings dropdown */}
        <div className="relative">
          <button
            className="px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-700 transition"
            type="button"
            onClick={() => setSettingsOpen((open) => !open)}
          >
            Settings
          </button>
          {settingsOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-gray-900 rounded shadow-lg border border-gray-800 z-40 p-4 transition-all duration-150"
              onMouseLeave={() => setSettingsOpen(false)}
            >
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="heroMode"
                    checked={heroMode === "mostRated"}
                    onChange={() => handleHeroModeChange("mostRated")}
                  />
                  <span className="text-white">Most Rated (Top 6)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="heroMode"
                    checked={heroMode === "mostWatchedCategories"}
                    onChange={() => handleHeroModeChange("mostWatchedCategories")}
                  />
                  <span className="text-white">
                    Profile's Most Watched Genres (Top 6, 1 per genre)
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>
        {/* Profile avatar with dropdown */}
        <button
          onClick={() => {
            handleLogout();
          }}
          className="px-4 py-2 text-left text-white transition cursor-pointer bg-red-500 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
 