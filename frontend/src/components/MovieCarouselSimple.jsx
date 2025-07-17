import React from "react";
import { useNavigate } from "react-router-dom";
import * as Progress from "@radix-ui/react-progress";

export default function MovieCarouselSimple({ movies, watchHistory = [] }) {
  const navigate = useNavigate();
  const scrollRef = React.useRef(null);
  const scrollBy = 336; // 320px + 16px gap

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
    <div className="relative px-4">
      {/* Prev Button */}
      <button
        onClick={handlePrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-2 text-xl transition hidden md:block"
        style={{ minWidth: 32 }}
      >
        &#8592;
      </button>
      {/* Next Button */}
      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-2 text-xl transition hidden md:block"
        style={{ minWidth: 32 }}
      >
        &#8594;
      </button>
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 pl-6 pr-6"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Hide scrollbar for Chrome, Safari, Opera */}
        <style>
          {`
            .scrollbar-hide::-webkit-scrollbar {
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
              className="snap-start flex flex-col hover:scale-105 cursor-pointer transition-transform duration-500 ease-in-out items-start bg-gray-900 rounded-lg shadow-lg min-w-[300px] max-w-[300px] overflow-hidden"
              onClick={() => navigate(`/movies/${movie._id}`)}
            >
              {/* Movie image with progress bar fixed at bottom */}
              <div className="w-full h-51 bg-black flex items-center justify-center relative">
                <img
                  src={
                    Array.isArray(movie.Image) && movie.Image.length > 0
                      ? movie.Image[0].startsWith("http")
                        ? movie.Image[0]
                        : `http://localhost:5000/uploads/${movie.Image[0]}`
                      : "https://placehold.co/220x330?text=No+Image"
                  }
                  alt={movie.Title}
                  className="w-full h-full object-cover rounded-lg"
                />
                {/* Progress bar if user has watched */}
                {progressValue !== null && (
                  <div className="absolute left-0 bottom-0 w-full z-20">
                    <Progress.Root
                      value={progressValue}
                      className="w-full h-1 bg-gray-700"
                    >
                      <Progress.Indicator
                        className="h-1 bg-red-500 transition-all"
                        style={{ width: `${progressValue}%` }}
                      />
                    </Progress.Root>
                  </div>
                )}
              </div>
              {/* Movie info */}
              <div className="w-full flex flex-col items-start px-4 py-4">
                <h3 className="text-lg font-bold mb-1 truncate w-full">
                  {movie.Title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-200 font-semibold mb-1">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg"
                    alt="IMDb"
                    className="w-8 h-4 object-contain"
                  />
                  <span>{movie.Rating || "N/A"}</span>
                  <span>·</span>
                  <span>{movie.Year}</span>
                </div>
                <p className="text-xs text-gray-300 mb-2 line-clamp-3">
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
