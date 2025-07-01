import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);
    if (value.trim().length === 0) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/api/movies/search?q=${encodeURIComponent(value)}`
      );
      const data = await res.json();
      setResults(data);
      setShowDropdown(true);
    } catch {
      setResults([]);
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full max-w-md transition-all duration-300">
      {/* Search input container */}
      <div className="flex items-center bg-[#141414] border border-gray-700 rounded-full px-4 py-1 focus-within:border-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-400 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Titles, people, genres"
          className="w-full bg-transparent outline-none text-white placeholder-gray-400"
          value={search}
          onChange={handleSearchChange}
          onFocus={() => search && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        />
      </div>

      {/* Search results */}
      {showDropdown && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-[#1f1f1f] border border-gray-700 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.map((movie) => (
            <div
              key={movie._id}
              className="flex items-center px-4 py-2 hover:bg-[#333] cursor-pointer transition"
              onMouseDown={() => {
                setShowDropdown(false);
                setSearch("");
                navigate(`/movies/${movie._id}`, { state: { movie: movie } });
              }}
            >
              <img
                 src={
                Array.isArray(movie.Image) && movie.Image.length > 0
                  ? (
                      movie.Image[0].startsWith("http")
                        ? movie.Image[0]
                        : `http://localhost:5000/uploads/${movie.Image[0]}`
                    )
                  : "https://placehold.co/220x330?text=No+Image"
              }
                alt={movie.Title}
                className="w-10 h-14 object-cover rounded-sm mr-4"
              />
              <div className="flex flex-col">
                <span className="text-white font-semibold">{movie.Title}</span>
                {Array.isArray(movie.Genre) &&
                  movie.Genre.map((genre, idx) => (
                    <span key={idx} className="text-xs text-gray-400">
                      {(genre.name || genre)}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
