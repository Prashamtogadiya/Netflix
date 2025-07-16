import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";

export default function Navbar({ profile, profileURL, onLogout }) {
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdown(false);
      }
    }
    if (dropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdown]);

  const safeProfileName = profile && profile.name ? profile.name : "Profile";
  const safeProfileURL = profileURL || "https://placehold.co/120x120?text=User";

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-transparent fixed w-full z-20">
      <div className="flex items-center gap-8">
        {/* Netflix logo with transparent background */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
          className="h-16 w-25"
          alt="Netflix"
          style={{ background: "transparent" }}
        />
      </div>
      <div className="flex items-center gap-8">
        {/* Only show Home if not on /dashboard */}
        {location.pathname !== "/dashboard" && (
          <a
            href="/dashboard"
            className="text-white font-semibold hover:text-red-500 transition"
          >
            Home
          </a>
        )}
        <a
          href="/tvshows"
          className="text-white font-semibold hover:text-red-500 transition"
        >
          TV Shows
        </a>
        {location.pathname !== "/history" && (
          <a
            href="/history"
            className="text-white font-semibold hover:text-red-500 transition"
          >
            History
          </a>
        )}
        <a
          href="/movies"
          className="text-white font-semibold hover:text-red-500 transition"
        >
          Movies
        </a>
        <a
          href="/mylist"
          className="text-white font-semibold hover:text-red-500 transition"
        >
          My List
        </a>
      </div>
      <div className="flex items-center gap-4 relative">
        <div>
          <SearchBar />
        </div>
        {/* Profile avatar with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <img
            src={safeProfileURL}
            alt="profile"
            className="rounded-full h-12 w-12 object-cover cursor-pointer border-2 border-transparent hover:border-white transition"
            onMouseEnter={() => setDropdown(true)}
            onClick={() => setDropdown((prev) => !prev)}
          />
          {/* Dropdown */}
          {dropdown && (
            <div
              className="absolute right-0 mt-2 w-40 bg-gray-900 rounded shadow-lg border border-gray-800 z-30 animate-fade-in"
              onMouseLeave={() => setDropdown(false)}
            >
              <div className="flex flex-col">
                <a
                  href="/profiles"
                  className="px-4 py-3 hover:bg-gray-800 text-white text-left transition"
                  onClick={() => setDropdown(false)}
                >
                  My Profile
                </a>
                <a
                  href="/profiles"
                  className="px-4 py-3 hover:bg-gray-800 text-white text-left transition"
                >
                  Profiles
                </a>
                <hr className="h-px bg-gray-200 border-0 dark:bg-gray-700" />

                <button
                  onClick={() => {
                    setDropdown(false);
                    onLogout && onLogout();
                  }}
                  className="px-4 py-3 text-left text-white transition hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
        <span className="font-semibold hidden md:block">{safeProfileName}</span>
      </div>
    </nav>
  );
}
