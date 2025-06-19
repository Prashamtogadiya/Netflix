import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function MovieCarousel({ movies }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Scroll by one card width (320px + 16px gap)
  const scrollBy = 336;

  const handlePrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollBy, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollBy, behavior: "smooth" });
    }
  };

  return (
    <div className="relative px-5">
      {/* Prev Button */}
      <button
        onClick={handlePrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-3 text-2xl transition hidden md:block"
        style={{ minWidth: 40 }}
        aria-label="Scroll left"
      >
        &#8592;
      </button>
      {/* Next Button */}
      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-3 text-2xl transition hidden md:block"
        style={{ minWidth: 40 }}
        aria-label="Scroll right"
      >
        &#8594;
      </button>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 hide-scrollbar pl-4 pr-4"
        style={{
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge
        }}
      >
        {/* Hide scrollbar for Chrome, Safari, Opera */}
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
            className="snap-start min-w-[320px] max-w-[320px] h-50 rounded-lg shadow-lg flex-shrink-0 relative overflow-hidden group bg-gray-900 cursor-pointer"
            onClick={() => navigate(`/movies/${movie._id}`)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.07)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
            style={{
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <img
              src={
                Array.isArray(movie.Image) && movie.Image.length > 0
                  ? movie.Image[0]
                  : "https://placehold.co/220x330?text=No+Image"
              }
              alt={movie.Title}
              className="absolute inset-0 w-full h-full object-cover rounded-lg"
              style={{ transition: "filter 0.3s" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-lg"></div>
            <div className="absolute left-0 bottom-0 z-10 p-3 w-full">
              <h3 className="text-2xl truncate mb-1">{movie.Title}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-200 font-semibold">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg"
                  alt="IMDb"
                  className="w-8 h-4 object-contain"
                />
                <span>{movie.Rating || "N/A"}</span>
                <span>·</span>
                <span>{movie.Year}</span>
                <span>·</span>
                <span>{movie.Runtime || "N/A"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
