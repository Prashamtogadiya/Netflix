import React from "react";

export default function HeroCarousel({ movie, onPrev, onNext }) {
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
          <span className="text-lg font-semibold">
            {movie.Rating || "N/A"}
          </span>
          <span className="text-lg font-semibold">·</span>
          <span className="text-lg font-semibold">{movie.Title}</span>
          <span className="text-lg font-semibold">·</span>
          <span className="text-lg font-semibold">{movie.Year}</span>
        </div>
        <p className="text-base mb-4 text-gray-200">{movie.Description}</p>
        <button
          className="flex items-center gap-2 bg-white text-black font-bold cursor-pointer px-6 py-2 rounded-full hover:bg-gray-200 transition mb-4 w-fit"
          style={{ letterSpacing: "0.5px" }}
        >
          <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Watch Now
        </button>
        <div className="flex flex-wrap gap-3">
          <span className="text-sm">{movie.Genre?.join(" · ")}</span>
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
