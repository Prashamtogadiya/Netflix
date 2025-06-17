import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../features/user/userSlice";
import { useNavigate } from "react-router-dom";
import { clearProfiles } from "../features/profiles/profileSlice";
import api from "../api";
import MovieCarousel from "../components/MovieCarousel";
import Navbar from "../components/Navbar";
import HeroCarousel from "../components/HeroCarousel";

export default function DashboardPage() {
  const profile = useSelector((state) => state.profiles.selectedProfile);
  const profileURL = useSelector(
    (state) => state.profiles.selectedProfile.avatar
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [startIdx, setStartIdx] = useState(0);
  const [heroIdx, setHeroIdx] = useState(0);

  const VISIBLE_COUNT = 6;
  const SHIFT_BY = 3;
  const CARD_WIDTH = 320;

  // Fetch movies on mount
  useEffect(() => {
    api
      .get("/movies")
      .then((res) => setMovies(res.data))
      .catch(() => setMovies([]));
  }, []);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    dispatch(clearUser());
    dispatch(clearProfiles());
    navigate("/login");
  };

  if (!profile) return null;

  // For main carousel
  const maxStartIdx = Math.max(0, movies.length - VISIBLE_COUNT);
  const handlePrev = () => setStartIdx((prev) => Math.max(prev - SHIFT_BY, 0));
  const handleNext = () => setStartIdx((prev) => Math.min(prev + SHIFT_BY, maxStartIdx));

  // For hero carousel
  const handleHeroPrev = () => setHeroIdx((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
  const handleHeroNext = () => setHeroIdx((prev) => (prev === movies.length - 1 ? 0 : prev + 1));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar
        profile={profile}
        profileURL={profileURL}
        onLogout={handleLogout}
      />

      {/* Hero Carousel */}
      {movies.length > 0 && (
        <HeroCarousel
          movie={movies[heroIdx]}
          onPrev={handleHeroPrev}
          onNext={handleHeroNext}
        />
      )}

      {/* Horizontal Carousel */}
      <section className="px-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Popular on Netflix</h2>
        <MovieCarousel
          movies={movies}
          visibleCount={VISIBLE_COUNT}
          cardWidth={CARD_WIDTH}
          startIdx={startIdx}
          onPrev={handlePrev}
          onNext={handleNext}
          maxStartIdx={maxStartIdx}
        />
      </section>

      {/* Second Carousel: All Movies */}
      <section className="px-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">All Movies</h2>
        <MovieCarouselSimple movies={movies} />
      </section>

      {/* Third Carousel: Actors */}
      <section className="px-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Popular Actors</h2>
        <ActorCarousel movies={movies} />
      </section>
    </div>
  );
}

// Carousel component for all movies
function MovieCarouselSimple({ movies }) {
  const [startIdx, setStartIdx] = useState(0);
  const VISIBLE_COUNT = 3; // Number of cards visible at once
  const CARD_WIDTH = 300 + 24; // Decreased width: 300px card + 1.5rem gap (gap-6)
  const navigate = useNavigate();

  const maxStartIdx = Math.max(0, movies.length - VISIBLE_COUNT);

  const handlePrev = () => setStartIdx((prev) => Math.max(prev - 1, 0));
  const handleNext = () => setStartIdx((prev) => Math.min(prev + 1, maxStartIdx));

  const translateX = -(startIdx * CARD_WIDTH);

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
        className="flex gap-6 transition-transform duration-500 ease-in-out py-4"
        style={{
          minWidth: `${VISIBLE_COUNT * CARD_WIDTH}px`,
          transform: `translateX(${translateX}px)`,
        }}
      >
        {movies.length === 0 && (
          <div className="text-gray-400">No movies found.</div>
        )}
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="flex flex-col hover:scale-105 cursor-pointer transition-transform duration-500 ease-in-out items-start bg-gray-900 rounded-lg shadow-lg min-w-[300px] max-w-[300px] overflow-hidden"
                        onClick={() => navigate(`/movies/${movie._id}`)}

          >
            {/* Movie image (top half) */}
            <div className="w-full h-44 bg-black flex items-center justify-center">
              <img
                src={
                  Array.isArray(movie.Image) && movie.Image.length > 0
                    ? movie.Image[0]
                    : "https://placehold.co/300x176?text=No+Image"
                }
                alt={movie.Title}
                className="object-cover w-full h-full"
              />
            </div>
            {/* Movie info */}
            <div className="w-full flex flex-col items-start px-4 py-3">
              <h3 className="text-lg font-bold mb-1 truncate w-full">{movie.Title}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-200 font-semibold mb-1">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg"
                  alt="IMDb"
                  className="w-8 h-4 object-contain"
                  style={{ background: "transparent" }}
                />
                <span>{movie.Rating || "N/A"}</span>
                <span>·</span>
                <span>{movie.Year}</span>
              </div>
              <p className="text-xs text-gray-300 mb-2 line-clamp-3">{movie.Description}</p>
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

function ActorCarousel({ movies }) {
  // Collect all actors and their images (now both are arrays)
  const actorList = [];
  movies.forEach(movie => {
    if (Array.isArray(movie.Actors) && Array.isArray(movie.ActorImage)) {
      for (let i = 0; i < Math.min(movie.Actors.length, movie.ActorImage.length); i++) {
        actorList.push({
          name: movie.Actors[i],
          img: movie.ActorImage[i] || "https://placehold.co/120x120?text=No+Image"
        });
      }
    }
  });

  // Carousel logic
  const [startIdx, setStartIdx] = useState(0);
  const VISIBLE_COUNT = 7;
  const CARD_WIDTH = 120 + 16; // 120px card + 1rem gap

  const maxStartIdx = Math.max(0, actorList.length - VISIBLE_COUNT);

  const handlePrev = () => setStartIdx((prev) => Math.max(prev - 1, 0));
  const handleNext = () => setStartIdx((prev) => Math.min(prev + 1, maxStartIdx));

  const translateX = -(startIdx * CARD_WIDTH);

  return (
    <div className="relative overflow-hidden">
      <button
        onClick={handlePrev}
        disabled={startIdx === 0}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-2 transition cursor-pointer ${
          startIdx === 0 ? "opacity-30 cursor-not-allowed" : ""
        }`}
        style={{ minWidth: 32 }}
        aria-label="Scroll left"
      >
        &#8592;
      </button>
      <div
        className="flex gap-4 transition-transform duration-500 ease-in-out py-4"
        style={{
          minWidth: `${VISIBLE_COUNT * CARD_WIDTH}px`,
          transform: `translateX(${translateX}px)`,
        }}
      >
        {actorList.length === 0 && (
          <div className="text-gray-400">No actors found.</div>
        )}
        {actorList.map((actor, idx) => (
          <div
            key={actor.name + idx}
            className="flex flex-col items-center transition-transform duration-500 ease-in-out cursor-pointer hover:scale-120 min-w-[120px] max-w-[120px]"
          >
            <img
              src={actor.img || "https://placehold.co/120x120?text=No+Image"}
              alt={actor.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-700 shadow mb-2"
            />
            <span className="text-sm text-center font-semibold truncate w-full">{actor.name}</span>
          </div>
        ))}
      </div>
      <button
        onClick={handleNext}
        disabled={startIdx >= maxStartIdx}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-2 transition cursor-pointer ${
          startIdx >= maxStartIdx ? "opacity-30 cursor-not-allowed" : ""
        }`}
        style={{ minWidth: 32 }}
        aria-label="Scroll right"
      >
        &#8594;
      </button>
    </div>
  );
}
