import React from "react";

export default function Navbar({ profile, profileURL, onLogout }) {
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-transparent fixed w-full z-20">
      <div className="flex items-center gap-8">
        <span className="text-3xl font-extrabold text-red-600 tracking-wide">
          NETFLIX
        </span>
      </div>
      <div className="flex items-center gap-8">
        <a href="/dashboard" className="text-white font-semibold hover:text-red-500 transition">
          Home
        </a>
        <a href="/profiles" className="text-white font-semibold hover:text-red-500 transition">
          Profiles
        </a>
        <a href="/movies" className="text-white font-semibold hover:text-red-500 transition">
          Movies
        </a>
        <a href="/mylist" className="text-white font-semibold hover:text-red-500 transition">
          My List
        </a>
        <a href="/profiles" className="text-white font-semibold hover:text-red-500 transition">
          New & Popular
        </a>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <img src={profileURL} alt="" className="rounded-[50%] h-12 py-2" />
        <span className="font-semibold">{profile.name}</span>
        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}
