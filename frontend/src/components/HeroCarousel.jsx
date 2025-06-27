import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function HeroCarousel({ movie, onPrev, onNext }) {
  const navigate = useNavigate();

  // Auto-advance to next movie every 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onNext && onNext();
    }, 6000);
    return () => clearTimeout(timer);
  }, [movie, onNext]);

  return (
    <section className="relative w-full h-[60vw] min-h-[400px] max-h-[729px] flex items-end justify-start overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: `url(${
            Array.isArray(movie.Image) && movie.Image.length > 0
              ? movie.Image[0]
              : "https://placehold.co/1280x720?text=No+Image"
          })`,
          filter: "brightness(0.5)",
        }}
      />
      {/* Overlay content at left bottom */}
      <div className="relative z-10 mb-12 ml-12 max-w-xl flex flex-col">
        {/* IMDb, rating, year row */}
        <div className="flex items-center gap-2 mb-2">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg"
            alt="IMDb"
            className="w-10 h-5 object-contain"
            style={{ background: "transparent" }}
          />
          <span className="text-lg font-semibold">{movie.Rating || "N/A"}</span>
          <span className="text-lg font-semibold">·</span>
          <span className="text-lg font-semibold">{movie.Title}</span>
          <span className="text-lg font-semibold">·</span>
          <span className="text-lg font-semibold">{movie.Year}</span>
        </div>
        <p className="text-base mb-4 text-gray-200">{movie.Description}</p>
        <div className="flex items-center gap-4 mb-4">
          {/* Download button (Netflix style, left of Watch Now) */}
          <button
            className="flex items-center justify-center bg-black/80 hover:bg-gray-900 text-white rounded-full w-10 h-10 transition "
            title="Download"
          >
            <svg
              className="w-5 h-5 opacity-80"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 16V4m0 12l-4-4m4 4l4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <rect
                x="6"
                y="18"
                width="12"
                height="2"
                rx="1"
                fill="currentColor"
              />
            </svg>
          </button>
          {/* Watch Now button */}
          <button
            className="flex items-center gap-2 bg-white text-black font-bold cursor-pointer px-6 py-2 rounded-full hover:bg-gray-200 transition w-fit"
            style={{ letterSpacing: "0.5px" }}
            onClick={() => navigate(`/movies/${movie._id}`)}
          >
            <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Watch Now
          </button>
          {/* Plus (Add to My List) button at right of Watch Now */}
          <button
            className="flex items-center justify-center bg-black/80 hover:bg-gray-900 text-white rounded-full w-10 h-10 transition"
            title="Add to My List"
          >
            <svg
              className="w-5 h-5 opacity-80"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 5v14M5 12h14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="text-sm">
            {Array.isArray(movie.Genre)
              ? movie.Genre.map((g) => (g.name || g)).join(" · ")
              : ""}
          </span>
        </div>
      </div>
      {/* Left/Right arrows */}
      <button
        onClick={onPrev}
        className="absolute left-4 bottom-1/2 z-20 bg-black/60 hover:bg-black text-white rounded-full p-3 text-2xl transition"
      >
        &#8592;
      </button>
      <button
        onClick={onNext}
        className="absolute right-4 bottom-1/2 z-20 bg-black/60 hover:bg-black text-white rounded-full p-3 text-2xl transition"
      >
        &#8594;
      </button>
    </section>
  );
}
