import React, { useState, useRef, useEffect } from "react";

export default function Navbar({ profile, profileURL, onLogout }) {
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
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

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-transparent fixed w-full z-20">
      <div className="flex items-center gap-8">
        <span className="text-3xl font-extrabold text-red-600 tracking-wide">
          NETFLIX
        </span>
      </div>
      <div className="flex items-center gap-8">
        <a
          href="/dashboard"
          className="text-white font-semibold hover:text-red-500 transition"
        >
          Home
        </a>
        <a
          href="/profiles"
          className="text-white font-semibold hover:text-red-500 transition"
        >
          Profiles
        </a>
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
        <a
          href="/profiles"
          className="text-white font-semibold hover:text-red-500 transition"
        >
          New & Popular
        </a>
      </div>
      <div className="flex items-center gap-4 relative">
        {/* Notification Button */}
        <button
          className="relative bg-black/60 hover:bg-black rounded-full p-2 transition"
          aria-label="Notifications"
        >
          {/* Netflix-style bell icon */}
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </button>
        {/* Profile avatar with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <img
            src={profileURL}
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
                <hr class="h-px bg-gray-200 border-0 dark:bg-gray-700"/>

                <button
                  onClick={() => {
                    setDropdown(false);
                    onLogout();
                  }}
                  className="px-4 py-3 text-left text-white transition hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
        <span className="font-semibold hidden md:block">{profile.name}</span>
      </div>
    </nav>
  );
}
