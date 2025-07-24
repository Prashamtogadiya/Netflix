import React, { useEffect, useState } from "react";
import api from "../api";
import NetflixLoader from "../components/NetflixLoader";
import MovieCarousel from "../components/MovieCarousel";
import Navbar from "../components/Navbar";
import HeroCarousel from "../components/HeroCarousel";
import { clearUser } from "../features/user/userSlice";
import { clearProfiles } from "../features/profiles/profileSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchedCategories, setWatchedCategories] = useState({});
  const [history, setHistory] = useState([]);
  const [heroMode, setHeroMode] = useState("");
  const profile = useSelector((state) => state.profiles.selectedProfile);
  const profileURL = useSelector(
    (state) => state.profiles.selectedProfile.avatar
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    setLoading(true);
    const MIN_LOADING_TIME = 1000;
    const startTime = Date.now();
    api
      .get("/movies")
      .then((res) => {
        // Filter for movies, series, documentry (exclude TV Show)
        const all = Array.isArray(res.data) ? res.data : [];
        const filtered = all.filter(
          (m) =>
            Array.isArray(m.Types) &&
            m.Types.some(
              (t) =>
                typeof t === "string" &&
                ["movie", "series", "Documentry"].includes(t.trim())
            )
        );
        setMovies(filtered);
      })
      .catch(() => {
        setMovies([]);
      })
      .finally(() => {
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);
        setTimeout(() => {
          setLoading(false);
        }, remainingTime);
      });
  }, []);

  // Fetch hero mode on mount (same as dashboard)
  useEffect(() => {
    api
      .get("/settings/hero-mode")
      .then((res) => setHeroMode(res.data.heroMode || "Most Rated"))
      .catch(() => setHeroMode("Most Rated"));
  }, []);

  // Fetch watched categories for the current profile
  useEffect(() => {
    if (!profile) return;
    api
      .post("/profiles/watched", { profileId: profile._id })
      .then((res) => {
        setWatchedCategories(res.data.watchedCategories || {});
      })
      .catch(() => {});
  }, [profile]);

  // Fetch watch history
  useEffect(() => {
    if (!profile) return;
    api
      .post("/profiles/get-watch-history", { profileId: profile._id })
      .then((res) => setHistory(res.data.watchHistory || []))
      .catch(() => setHistory([]));
  }, [profile]);

  // Sorted watched categories by count descending
  const sortedWatchedCategories = React.useMemo(() => {
    if (!watchedCategories) return [];
    return Object.entries(watchedCategories)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);
  }, [watchedCategories]);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    dispatch(clearUser());
    dispatch(clearProfiles());
    navigate("/login");
  };

  // Helper to check genre match (handles both string and object)
  
  const mostRated = [...movies];
  const mostRatedMovies = mostRated.sort((a, b) => b.Rating - a.Rating);
 
  // Movies by watched categories, in order
  const moviesByCategory = sortedWatchedCategories.map((cat) => ({
    category: cat,
    movies: movies.filter(
      (m) =>
        Array.isArray(m.Genre) &&
        m.Genre.some(
          (g) =>
            (typeof g === "object" && g !== null && g.name
              ? g.name
              : typeof g === "string"
              ? g
              : "") === cat
        )
    ),
  })).filter(({ movies }) => movies.length > 0);

  // Compute hero carousel movies based on heroMode and movies
  const heroCarouselMovies = React.useMemo(() => {
    if (!Array.isArray(movies) || movies.length === 0) return [];
    if (heroMode.toLowerCase() === "recently added") {
      // Sort by createdAt descending
      return [...movies]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
    }
    if (heroMode.toLowerCase() === "most searched") {
      // Sort by search count
      return [...movies].sort((a, b) => b.Searches - a.Searches).slice(0, 6);
    }
    // Default: Most Rated
    return [...movies].sort((a, b) => b.Rating - a.Rating).slice(0, 6);
  }, [movies, heroMode]);

  if (loading) return <NetflixLoader />;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center">
      <Navbar
        profile={profile}
        profileURL={profileURL}
        onLogout={handleLogout}
      />
      {/* Hero Carousel (exclude TV Shows) */}
      {heroCarouselMovies.length > 0 && (
        <HeroCarousel movies={heroCarouselMovies} mode={heroMode} />
      )}
      <div className="pt-22 max-w-7xl mx-auto w-full px-4 flex-1">
        {/* Recommended carousels for each watched category */}
        {moviesByCategory.length > 0 ? (
          moviesByCategory.map(({ category, movies }) => (
            <section className="w-full max-w-7xl px-5 mt-8" key={category}>
              <h2 className="text-2xl font-bold mb-4">
                 {category} Movies
              </h2>
              <MovieCarousel movies={movies} category={category} watchHistory={history} />
            </section>
          ))
        ) : (
          <section className="w-full max-w-7xl px-5 mt-8">
            <h2 className="text-2xl font-bold mb-4">All Movies</h2>
            <MovieCarousel movies={movies} category="All" watchHistory={history} />
          </section>
        )}
        <section className="w-full max-w-7xl px-5 mt-8">
          <h2 className="text-2xl font-bold mb-4">Most Rated Movies</h2>
          <MovieCarousel movies={mostRatedMovies} category="Most Rated" watchHistory={history} />
        </section>
      </div>
      <Footer />
    </div>
  );
}