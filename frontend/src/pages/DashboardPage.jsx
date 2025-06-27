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
    const MIN_LOADING_TIME = 1500;
    const startTime = Date.now();

    api
      .get("/movies")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setMovies(res.data);
        } else if (res.data && Array.isArray(res.data.movies)) {
          setMovies(res.data.movies);
        } else {
          setMovies([]);
        }
      })
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

  const safeMovies = Array.isArray(movies) ? movies : [];

  // Helper to check genre match (handles both string and object)
  const hasGenre = (movie, genre) =>
  Array.isArray(movie.Genre) &&
  movie.Genre.some(g => g.name === genre);

  const actionMovies = safeMovies.filter((movie) => hasGenre(movie, "Action"));
  const dramaMovies = safeMovies.filter((movie) => hasGenre(movie, "Drama"));
  const adventureMovies = safeMovies.filter(
    (movie) => hasGenre(movie, "Adventure")
  );
  const crimeMovies = safeMovies.filter((movie) => hasGenre(movie, "Crime"));
  const comedyMovies = safeMovies.filter((movie) => hasGenre(movie, "Comedy"));
  // const mostSearchedMovies = safeMovies
  //   .filter((movie) => movie.Searches)
  //   .sort((a, b) => b.Searches - a.Searches)
  //   .slice(0, 10);

  if (!profile) return null;
  if (loading) return <NetflixLoader />;

  // For main carousel
  const maxStartIdx = Math.max(0, safeMovies.length - VISIBLE_COUNT);
  const handlePrev = () => setStartIdx((prev) => Math.max(prev - SHIFT_BY, 0));
  const handleNext = () =>
    setStartIdx((prev) => Math.min(prev + SHIFT_BY, maxStartIdx));

  // For hero carousel
  const handleHeroPrev = () =>
    setHeroIdx((prev) => (prev === 0 ? safeMovies.length - 1 : prev - 1));
  const handleHeroNext = () =>
    setHeroIdx((prev) => (prev === safeMovies.length - 1 ? 0 : prev + 1));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar
        profile={profile}
        profileURL={profileURL}
        onLogout={handleLogout}
      />

      {/* Hero Carousel */}
      {safeMovies.length > 0 && (
        <HeroCarousel
          movie={safeMovies[heroIdx]}
          onPrev={handleHeroPrev}
          onNext={handleHeroNext}
        />
      )}

      {/* Horizontal Carousel */}
      <section className="px-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Popular on Netflix</h2>
        <MovieCarousel
          movies={safeMovies}
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
        <MovieCarouselSimple movies={safeMovies} />
      </section>

      {/* Third Carousel: Actors */}
      <section className="px-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Popular Actors</h2>
        <ActorCarousel movies={safeMovies} />
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

      <section className="px-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Adventure Movies</h2>
        <MovieCarousel movies={adventureMovies} />
      </section>

      <section className="px-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Crime Movies</h2>
        <MovieCarousel movies={crimeMovies} />
      </section>

      <section className="px-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Comedy Movies</h2>
        <MovieCarousel movies={comedyMovies} />
      </section>

      <Footer />
    </div>
  );
}
