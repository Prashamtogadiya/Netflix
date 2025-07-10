import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function HeroCarousel({ movies = [] }) {
  const navigate = useNavigate();
  const [activeIdx, setActiveIdx] = useState(0);

  if (!movies.length) return null;

  return (
    <section className="relative w-full h-[60vw] min-h-[400px] max-h-[729px] flex items-end justify-start overflow-hidden">
      <Swiper
        modules={[Autoplay, Navigation]}
        slidesPerView={1}
        navigation
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        loop
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
        onSlideChange={(swiper) => setActiveIdx(swiper.realIndex)}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={700}
      >
        {movies.map((movie, idx) => (
          <SwiperSlide key={movie._id || idx}>
            {/* Background image with fade transition */}
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700 opacity-100"
              style={{
                backgroundImage: `url(${
                  Array.isArray(movie.Image) && movie.Image.length > 0
                    ? movie.Image[0].startsWith("http")
                      ? movie.Image[0]
                      : `http://localhost:5000/uploads/${movie.Image[0]}`
                    : "https://placehold.co/220x330?text=No+Image"
                })`,
                filter: "brightness(0.5)",
                zIndex: 1,
                transition: "opacity 0.7s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
            {/* Movie info at bottom left */}
            <div className="absolute bottom-12 left-12 z-10 max-w-xl flex flex-col animate-fadein">
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
                {/* Download button */}
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
                {/* Plus (Add to My List) button */}
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
          </SwiperSlide>
        ))}
      </Swiper>
      {/* Custom progress bar pagination */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {movies.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 rounded transition-all duration-300 ${
              idx === activeIdx
                ? "bg-red-600 w-12"
                : "bg-white/40 w-6"
            }`}
            style={{
              opacity: idx === activeIdx ? 1 : 0.6,
            }}
          />
        ))}
      </div>
      {/* Swiper navigation arrows are still shown by Swiper */}
      <style>
  {`
    .swiper-button-next,
    .swiper-button-prev {
      color: white !important;
    }

    .swiper-button-next::after,
    .swiper-button-prev::after {
      font-size: 20px !important;
      font-weight: bold;
    }
  `}
</style>
    </section>
  );
}


