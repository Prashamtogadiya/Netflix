import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as Progress from "@radix-ui/react-progress";

// Helper to convert runtime in minutes to "Xh Ym" format
function formatRuntime(runtime) {
  if (!runtime || isNaN(runtime)) return "N/A";
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;
}

export default function MyListCarousel({
  movies,
  watchHistory = [],
  onRemoveFromMyList = () => {},
}) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const scrollBy = 400; // Updated scroll distance for wider cards

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

  // Helper to get progress for a movie
  const getProgress = (movieId) => {
    const entry = watchHistory.find(
      (h) => (h.movie._id || h.movie) === movieId
    );
    if (entry && entry.duration > 0) {
      return Math.round((entry.progress / entry.duration) * 100);
    }
    return null;
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
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-6 hide-scrollbar pl-8 pr-8"
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
        {movies.map((movie) => {
          const progressValue = getProgress(movie._id);
          return (
            <div
              key={movie._id}
              className="snap-start min-w-[350px] max-w-[350px] h-[280px] rounded-xl shadow-2xl flex-shrink-0 relative overflow-hidden group bg-gradient-to-br from-[#232526] to-[#0a1827] cursor-pointer border-2 border-transparent  transition-all duration-200"
              onClick={() => navigate(`/movies/${movie._id}`)}
              style={{
                transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {/* Movie Poster - Top section with wider aspect ratio */}
              <div className="relative h-[65%] w-full overflow-hidden">
                <img
                  src={
                    Array.isArray(movie.Image) && movie.Image.length > 0
                      ? (
                          movie.Image[0].startsWith("http")
                            ? movie.Image[0]
                            : `http://localhost:5000/uploads/${movie.Image[0]}`
                        )
                      : "https://placehold.co/350x180?text=No+Image"
                  }
                  alt={movie.Title}
                  className="w-full h-full object-cover rounded-t-xl group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                {/* Progress bar if user has watched */}
                {progressValue !== null && (
                  <div className="absolute left-0 bottom-0 w-full px-2 pb-1 z-20">
                    <Progress.Root
                      value={progressValue}
                      className="w-full h-1 bg-gray-700 rounded"
                      style={{ maxWidth: "100%" }}
                    >
                      <Progress.Indicator
                        className="h-1 rounded bg-red-500 transition-all"
                        style={{ width: `${progressValue}%` }}
                      />
                    </Progress.Root>
                  </div>
                )}
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    className="bg-white text-black rounded-full p-2.5 shadow-lg hover:bg-red-600 hover:text-white transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/movies/${movie._id}`);
                    }}
                    aria-label="Play"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
                {/* My List Badge */}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full font-semibold tracking-wide shadow z-20">
                  My List
                </div>
                {/* Remove from My List Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromMyList(movie._id);
                  }}
                  className="absolute top-2 right-2 z-20 bg-black/70 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                  aria-label="Remove from My List"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Info Section - Bottom section */}
              <div className="flex flex-col justify-between h-[35%] p-3">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 line-clamp-2 leading-tight">
                    {movie.Title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-300 font-semibold mb-2">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg"
                      alt="IMDb"
                      className="w-6 h-2.5 object-contain"
                    />
                    <span>{movie.Rating || "N/A"}</span>
                    <span>·</span>
                    <span>{movie.Year}</span>
                    <span>·</span>
                    <span>{formatRuntime(movie.Runtime)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-300 line-clamp-2 leading-tight">
                  {movie.Description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
