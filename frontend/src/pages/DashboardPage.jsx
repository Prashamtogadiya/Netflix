import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../features/user/userSlice";
import { useNavigate } from "react-router-dom";
import { clearProfiles } from "../features/profiles/profileSlice";
import api from "../api";
import MovieCarousel from "../components/MovieCarousel";
import Navbar from "../components/Navbar";
import HeroCarousel from "../components/HeroCarousel";
import NetflixLoader from "../components/NetflixLoader";
import Footer from "../components/Footer";

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
  const [loading, setLoading] = useState(true);

  const VISIBLE_COUNT = 6;
  const SHIFT_BY = 3;
  const CARD_WIDTH = 320;

  // Fetch movies on mount
  useEffect(() => {
  setLoading(true);
  const MIN_LOADING_TIME = 4000; // 1 second
  const startTime = Date.now();

  api
    .get("/movies")
    .then((res) => setMovies(res.data))
    .catch(() => setMovies([]))
    .finally(() => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);

      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    });
}, []);


  const handleLogout = async () => {
    await api.post("/auth/logout");
    dispatch(clearUser());
    dispatch(clearProfiles());
    navigate("/login");
  };

  if (!profile) return null;
  if (loading) return <NetflixLoader />;

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

      <Footer/>
    </div>
  );
}

// Carousel component for all movies
function MovieCarouselSimple({ movies }) {
  const navigate = useNavigate();

  return (
    <div className="relative px-4">
      <div
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide py-4"
        style={{
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge
        }}
      >
        {movies.length === 0 && (
          <div className="text-gray-400">No movies found.</div>
        )}
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="snap-start flex flex-col hover:scale-105 cursor-pointer transition-transform duration-500 ease-in-out items-start bg-gray-900 rounded-lg shadow-lg min-w-[300px] max-w-[300px] overflow-hidden"
            onClick={() => navigate(`/movies/${movie._id}`)}
          >
            {/* Movie image */}
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
        ))}
      </div>
    </div>
  );
}

function ActorCarousel({ movies }) {
  // Collect all actors and their images
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

  return (
    <div className="relative px-4">
      <div
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 scrollbar-hide"
        style={{
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge
        }}
      >
        {actorList.length === 0 && (
          <div className="text-gray-400">No actors found.</div>
        )}
        {actorList.map((actor, idx) => (
          <div
            key={actor.name + idx}
            className="snap-start flex flex-col items-center transition-transform duration-500 ease-in-out cursor-pointer hover:scale-110 min-w-[120px] max-w-[120px]"
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
    </div>
  );
}
