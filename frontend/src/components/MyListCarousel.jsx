import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

// Helper to convert runtime in minutes to "Xh Ym" format
function formatRuntime(runtime) {
  if (!runtime || isNaN(runtime)) return "N/A";
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;
}

export default function MyListCarousel({ movies }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const scrollBy = 336;

  const handlePrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= scrollBy;
    }
  };

  const handleNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += scrollBy;
    }
  };

  return (
    <div className="relative px-2">
      {/* Prev Button */}
      <button
        onClick={handlePrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white rounded-full p-3 text-2xl transition hidden md:flex items-center justify-center shadow-lg"
        style={{ minWidth: 40 }}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path
            d="M15 19l-7-7 7-7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {/* Next Button */}
      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-black text-white rounded-full p-3 text-2xl transition hidden md:flex items-center justify-center shadow-lg"
        style={{ minWidth: 40 }}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 5l7 7-7 7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory py-6 hide-scrollbar pl-8 pr-8"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>
          {`
            .hide-scrollbar::-webkit-scrollbar {
              display: none !important;
            }
          `}
        </style>
        {movies.length === 0 && (
          <div className="text-gray-400">No movies found.</div>
        )}
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="snap-start min-w-[260px] max-w-[260px] h-[400px] rounded-xl shadow-2xl flex-shrink-0 relative overflow-hidden group bg-gradient-to-br from-[#232526] to-[#414345] cursor-pointer border-2 border-transparent hover:border-red-600 transition-all duration-200"
            onClick={() => navigate(`/movies/${movie._id}`)}
            style={{
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* Movie Poster */}
            <div className="relative h-[70%] w-full overflow-hidden">
              <img
                src={
                  Array.isArray(movie.Image) && movie.Image.length > 0
                    ? movie.Image[0]
                    : "https://placehold.co/220x330?text=No+Image"
                }
                alt={movie.Title}
                className="w-full h-full object-cover rounded-t-xl group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  className="bg-white text-black rounded-full p-3 shadow-lg hover:bg-red-600 hover:text-white transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/movies/${movie._id}`);
                  }}
                  aria-label="Play"
                >
                  <svg
                    className="w-7 h-7"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
              {/* My List Badge */}
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full font-semibold tracking-wide shadow">
                My List
              </div>
            </div>
            {/* Info */}
            <div className="flex flex-col justify-between h-[30%] p-4">
              <h3 className="text-lg font-bold text-white truncate mb-1">
                {movie.Title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-300 font-semibold mb-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg"
                  alt="IMDb"
                  className="w-8 h-4 object-contain"
                />
                <span>{movie.Rating || "N/A"}</span>
                <span>·</span>
                <span>{movie.Year}</span>
                <span>·</span>
                <span>{formatRuntime(movie.Runtime)}</span>
              </div>
              <p className="text-xs text-gray-300 line-clamp-2">
                {movie.Description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
