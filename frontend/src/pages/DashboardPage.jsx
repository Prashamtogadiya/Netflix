import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../features/user/userSlice";
import { clearProfiles } from "../features/profiles/profileSlice";
import api from "../api";
import MovieCarousel from "../components/MovieCarousel";
import Navbar from "../components/Navbar";
import HeroCarousel from "../components/HeroCarousel";
import NetflixLoader from "../components/NetflixLoader";
import Footer from "../components/Footer";
import MovieCarouselSimple from "../components/MovieCarouselSimple";
import ActorCarousel from "../components/ActorCarousel";

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
    const MIN_LOADING_TIME = 1500; // 1 second
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

  const actionMovies = movies.filter((movie) => movie.Genre.includes("Action"));
  const dramaMovies = movies.filter((movie) => movie.Genre.includes("Drama"));

  if (!profile) return null;
  if (loading) return <NetflixLoader />;

  // For main carousel
  const maxStartIdx = Math.max(0, movies.length - VISIBLE_COUNT);
  const handlePrev = () => setStartIdx((prev) => Math.max(prev - SHIFT_BY, 0));
  const handleNext = () =>
    setStartIdx((prev) => Math.min(prev + SHIFT_BY, maxStartIdx));

  // For hero carousel
  const handleHeroPrev = () =>
    setHeroIdx((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
  const handleHeroNext = () =>
    setHeroIdx((prev) => (prev === movies.length - 1 ? 0 : prev + 1));

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

      {/* Fourth Carousel: Action Movies */}
      <section className="px-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Action Movies</h2>
        <MovieCarousel movies={actionMovies} />
      </section>

      {/* Fifth Carousel: Drama Movies */}
      <section className="px-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Drama Movies</h2>
        <MovieCarousel movies={dramaMovies} />
      </section>

      <Footer />
    </div>
  );
}
