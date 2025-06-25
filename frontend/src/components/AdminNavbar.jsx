import React, { useState, useRef, useEffect } from "react";
// import { useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";
import api from "../api";
import { useNavigate } from "react-router-dom";
export default function AdminNavbar() {
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  //   const location = useLocation();

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

  const handleLogout = async () => {
      await api.post("/auth/logout");
     
      localStorage.removeItem("user");
      localStorage.removeItem("selectedProfile");
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
        <span className="text-xl font-bold text-white ml-4">Admin Panel</span>
      </div>
      <div className="flex items-center gap-4 relative">
        <div>
          <SearchBar />
        </div>
        {/* Profile avatar with dropdown */}
        <button
          onClick={() => {handleLogout();}}
          className="px-4 py-2 text-left text-white transition cursor-pointer bg-red-500 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
