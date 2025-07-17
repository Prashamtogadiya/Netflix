import React from "react";
// import { useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";
import {  useDispatch } from "react-redux";

import api from "../api";
import { clearUser } from "../features/user/userSlice";
import { clearProfiles } from "../features/profiles/profileSlice";
import { useNavigate } from "react-router-dom";
export default function AdminNavbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
         