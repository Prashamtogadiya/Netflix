import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Helper to format runtime in minutes to "Xh Ym"
function formatRuntime(runtime) {
  if (!runtime || isNaN(runtime)) return "N/A";
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;
}

// Shows a horizontal carousel of movie cards with navigation arrows and "View More" button.
export default function MovieCarousel({ movies, category }) {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [atEnd, setAtEnd] = useState(false);

  // Amount to scroll by one card width (320px + 16px gap)
  const scrollBy = 336;

  // Scrolls carousel left
  const handlePrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= scrollBy;
      setAtEnd(false);
    }
  };

  // Scrolls carousel right and checks if at end
  const handleNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += scrollBy;
      setTimeout(() => {
        if (
          scrollRef.current.scrollLeft + scrollRef.current.clientWidth >=
          scrollRef.current.scrollWidth - 10
        ) {
          setAtEnd(true);
        }
      }, 200);
    }
  };

  // Checks if carousel is at the end when scrolling
  const handleScroll = () => {
    if (
      scrollRef.current.scrollLeft + scrollRef.current.clientWidth >=
      scrollRef.current.scrollWidth - 10
    ) {
      setAtEnd(true);
    } else {
      setAtEnd(false);
    }
  };

  // Try to infer category if not passed
  let inferredCategory = category;
  if (!inferredCategory && movies && movies.length > 0) {
    // If all movies have the same genre, use that
    const allGenres = movies.flatMap((m) =>
      Array.isArray(m.Genre) ? m.Genre : []
    );
    const genreCounts = {};
    allGenres.forEach((g) => {
      if (g) genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
    const sorted = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0 && sorted[0][1] === movies.length) {
      inferredCategory = sorted[0][0];
    }
  }

  // Navigates to the "View More" page for the category
  const handleViewMore = () => {
    if (inferredCategory) {
      navigate(`/allmovies?category=${encodeURIComponent(inferredCategory)}`);
    } else {
      navigate("/allmovies");
    }
  };

  return (
    <div className="relative px-5">
      {/* Left arrow button */}
      <button
        onClick={handlePrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-3 text-2xl transition hidden md:block cursor-pointer"
        style={{ minWidth: 40 }}
        aria-label="Scroll left"
      >
        &#8592;
      </button>
      {/* Right arrow button or View More button */}
      {!atEnd ? (
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-3 text-2xl transition hidden md:block cursor-pointer"
          style={{ minWidth: 40 }}
          aria-label="Scroll right"
        >
          &#8594;
        </button>
      ) : (
        <button
          onClick={handleViewMore}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white font-semibold w-12 h-12 rounded-full  items-center justify-center shadow-md transition-all text-xs tracking-tight hidden md:flex"
          title="View More"
        >
          &gt;
        </button>
      )}
      {/* The scrollable row of movie cards */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 hide-scrollbar pl-4 pr-4"
        style={{
          scrollbarWidth: "none", // Hide scrollbar in Firefox
          msOverflowStyle: "none", // Hide scrollbar in IE/Edge
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
        {/* Show a message if there are no movies */}
        {movies.length === 0 && (
          <div className="text-gray-400">No movies found.</div>
        )}
        {/* Render up to 10 movie cards */}
        {movies.slice(0, 10).map((movie) => (
          <div
            key={movie._id}
            className="snap-start min-w-[320px] max-w-[320px] h-50 rounded-lg shadow-lg flex-shrink-0 relative overflow-hidden group bg-gray-900 truncate cursor-pointer"
            onClick={() => navigate(`/movies/${movie._id}`)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.07)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            style={{
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* Movie poster image */}
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
            {/* Overlay for gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-lg"></div>
            {/* Movie info at the bottom */}
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
                <span>{formatRuntime(movie.Runtime)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
