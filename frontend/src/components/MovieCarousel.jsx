import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MovieCarousel({
  movies,
  visibleCount = 6,
  cardWidth = 472,
  startIdx: controlledStartIdx,
  onPrev,
  onNext,
  maxStartIdx: controlledMaxStartIdx,
}) {
  const [internalStartIdx, setInternalStartIdx] = useState(0);
  const startIdx = controlledStartIdx !== undefined ? controlledStartIdx : internalStartIdx;
  const maxStartIdx =
    controlledMaxStartIdx !== undefined
      ? controlledMaxStartIdx
      : Math.max(0, movies.length - visibleCount);

  const navigate = useNavigate();

  const handlePrev = () => {
    if (onPrev) onPrev();
    else setInternalStartIdx((prev) => Math.max(prev - 1, 0));
  };
  const handleNext = () => {
    if (onNext) onNext();
    else setInternalStartIdx((prev) => Math.min(prev + 1, maxStartIdx));
  };

  const translateX = -(startIdx * cardWidth);

  return (
    <div className="relative overflow-hidden">
      <button
        onClick={handlePrev}
        disabled={startIdx === 0}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-2 transition cursor-pointer ${
          startIdx === 0 ? "opacity-30 cursor-not-allowed" : ""
        }`}
        style={{ minWidth: 40 }}
        aria-label="Scroll left"
      >
        &#8592;
      </button>
      <div
        className="flex gap-4 py-4 transition-transform duration-500 ease-in-out"
        style={{
          minWidth: `${visibleCount * cardWidth}px`,
          transform: `translateX(${translateX}px)`,
        }}
      >
        {movies.length === 0 && (
          <div className="text-gray-400">No movies found.</div>
        )}
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="min-w-[320px] max-w-[320px] h-50 rounded-lg shadow-lg flex-shrink-0 relative overflow-hidden group bg-gray-900 cursor-pointer"
            style={{
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              width: cardWidth,
              minWidth: cardWidth,
              maxWidth: cardWidth,
            }}
            onClick={() => navigate(`/movies/${movie._id}`)}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.07)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            {/* Background image */}
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
            {/* Overlay gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-lg"></div>
            {/* Movie info at bottom left */}
            <div className="absolute left-0 bottom-0 z-10 p-3 w-full">
              <h3 className="text-2xl truncate mb-1">{movie.Title}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-200 font-semibold">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg"
                  alt="IMDb"
                  className="w-8 h-4 object-contain"
                  style={{ background: "transparent" }}
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
      <button
        onClick={handleNext}
        disabled={startIdx >= maxStartIdx}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-2 transition cursor-pointer ${
          startIdx >= maxStartIdx ? "opacity-30 cursor-not-allowed" : ""
        }`}
        style={{ minWidth: 40 }}
        aria-label="Scroll right"
      >
        &#8594;
      </button>
    </div>
  );
}
