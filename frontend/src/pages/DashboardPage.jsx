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
  const [heroMode, setHeroMode] = useState(""); // <-- only heroMode, not heroCarouselMovies
  const [startIdx, setStartIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [watchedCategories, setWatchedCategories] = useState({});
  const [history, setHistory] = useState([]);
  const VISIBLE_COUNT = 6;
  const SHIFT_BY = 3;
  const CARD_WIDTH = 320;

  // Define safeMovies FIRST so it can be used in hooks below
  const safeMovies = React.useMemo(() => (Array.isArray(movies) ? movies : []), [movies]);

  useEffect(() => {
    if (!profile) return;
    api.post("/profiles/watched", { profileId: profile._id })
      .then((res) => {
        setWatchedCategories(res.data.watchedCategories || {});
      })
      .catch((err) => {
        console.error("Failed to fetch watched categories:", err);
      });
  }, [profile]);

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

  // Helper to check genre match (handles both string and object)
  const hasGenre = (movie, genre) =>
    Array.isArray(movie.Genre) &&
    movie.Genre.some(
      (g) =>
        (typeof g === "object" && g !== null && g.name
          ? g.name
          : typeof g === "string"
          ? g
          : ""
        ) === genre
    );

  // Fetch hero mode on mount
  useEffect(() => {
    api
      .get("/settings/hero-mode")
      .then((res) => setHeroMode(res.data.heroMode || "Most Rated"))
      .catch(() => setHeroMode("Most Rated"));
  }, []);

  // Compute hero carousel movies based on heroMode and movies
  const heroCarouselMovies = React.useMemo(() => {
    if (!Array.isArray(movies) || movies.length === 0) return [];
    if (heroMode.toLowerCase() === "recently added") {
      // Sort by createdAt descending
      return [...movies]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
    }
    if(heroMode.toLowerCase()==="most searched"){
      // Sort by search count 
      return [...movies]
        .sort((a, b) => b.Searches  - a.Searches )
        .slice(0, 6);
    }
    // Default: Most Rated
    return [...movies].sort((a, b) => b.Rating - a.Rating).slice(0, 6);
  }, [movies, heroMode]);

  // Sort watched categories by count descending
  const mostWatchedCategory = sortedWatchedCategories[0] || null;

  // Movies prioritized by watched categories order
  const prioritizedMovies = React.useMemo(() => {
    if (!sortedWatchedCategories.length) return safeMovies;
    const seen = new Set();
    const prioritized = [];
    // Add movies for each watched category in order
    sortedWatchedCategories.forEach((cat) => {
      safeMovies.forEach((movie) => {
        if (
          Array.isArray(movie.Genre) &&
          movie.Genre.some(
            (g) =>
              (typeof g === "object" && g !== null && g.name
                ? g.name
                : typeof g === "string"
                ? g
                : ""
              ) === cat
          ) &&
          !seen.has(movie._id)
        ) {
          prioritized.push(movie);
          seen.add(movie._id);
        }
      });
    });
    // Add remaining movies
    safeMovies.forEach((movie) => {
      if (!seen.has(movie._id)) {
        prioritized.push(movie);
        seen.add(movie._id);
      }
    });
    return prioritized;
  }, [safeMovies, sortedWatchedCategories]);

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

  const actionMovies = safeMovies.filter((movie) => hasGenre(movie, "Action"));
  const dramaMovies = safeMovies.filter((movie) => hasGenre(movie, "Drama"));
  const adventureMovies = safeMovies.filter(
    (movie) => hasGenre(movie, "Adventure")
  );
  const crimeMovies = safeMovies.filter((movie) => hasGenre(movie, "Crime"));
  const comedyMovies = safeMovies.filter((movie) => hasGenre(movie, "Comedy"));
  if (!profile) return null;
  if (loading) return <NetflixLoader />;

  // For main carousel
  const maxStartIdx = Math.max(0, safeMovies.length - VISIBLE_COUNT);
  const handlePrev = () => setStartIdx((prev) => Math.max(prev - SHIFT_BY, 0));
  const handleNext = () =>
    setStartIdx((prev) => Math.min(prev + SHIFT_BY, maxStartIdx));

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar
        profile={profile}
        profileURL={profileURL}
        onLogout={handleLogout}
      />

      {/* Hero Carousel */}
      {heroCarouselMovies.length > 0 && (
        <HeroCarousel movies={heroCarouselMovies} mode={heroMode} />
      )}

     <section className="px-8 mt-8">
  <h2 className="text-2xl font-bold mb-4">
    {mostWatchedCategory
      ? `Recommended: ${mostWatchedCategory} Movies`
      : "Popular on Netflix"}
  </h2>
  <MovieCarousel
    movies={prioritizedMovies}
    visibleCount={VISIBLE_COUNT}
    cardWidth={CARD_WIDTH}
    startIdx={startIdx}
    onPrev={handlePrev}
    onNext={handleNext}
    maxStartIdx={maxStartIdx}
    watchHistory={history} // <-- pass watchHistory here
  />
</section>

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
          watchHistory={history} // <-- pass watchHistory here
        />
      </section>

      {/* Second Carousel: All Movies */}
      <section className="px-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">All Movies</h2>
        <MovieCarouselSimple movies={safeMovies} watchHistory={history} />
      </section>

      {/* Third Carousel: Actors */}
      <section className="px-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Popular Actors</h2>
        <ActorCarousel movies={safeMovies} />
      </section>

      {/* Fourth Carousel: Action Movies */}
      <section className="px-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Action Movies</h2>
        <MovieCarousel movies={actionMovies} watchHistory={history} />
      </section>

      {/* Fifth Carousel: Drama Movies */}
      <section className="px-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Drama Movies</h2>
        <MovieCarousel movies={dramaMovies} watchHistory={history} />
      </section>

      <section className="px-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Adventure Movies</h2>
        <MovieCarousel movies={adventureMovies} watchHistory={history} />
      </section>

      <section className="px-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Crime Movies</h2>
        <MovieCarousel movies={crimeMovies} watchHistory={history} />
      </section>

      <section className="px-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Comedy Movies</h2>
        <MovieCarousel movies={comedyMovies} watchHistory={history} />
      </section>

      <Footer />
    </div>
  );
}
