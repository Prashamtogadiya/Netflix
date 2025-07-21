// filepath: c:\Users\PRASHAM\Desktop\Netflix\frontend\src\pages\TVShows.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import NetflixLoader from "../components/NetflixLoader";
import MovieCarousel from "../components/MovieCarousel";
import Navbar from "../components/Navbar";
import { clearUser } from "../features/user/userSlice";
import { clearProfiles } from "../features/profiles/profileSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import HeroCarousel from "../components/HeroCarousel";

export default function TVShows() {
  const [shows, setShows] = useState([]);
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
        // Filter for TV Shows only
        const all = Array.isArray(res.data) ? res.data : [];
        const filtered = all.filter(
          (m) =>
            Array.isArray(m.Types) &&
            m.Types.some(
              (t) =>
                typeof t === "string" &&
                t.trim() === "TV Show"
            )
        );
        setShows(filtered);
      })
      .catch(() => {
        setShows([]);
      })
      .finally(() => {
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);
        setTimeout(() => {
          setLoading(false);
        }, remainingTime);
      });
  }, []);

  useEffect(() => {
    api
      .get("/settings/hero-mode")
      .then((res) => setHeroMode(res.data.heroMode || "Most Rated"))
      .catch(() => setHeroMode("Most Rated"));
  }, []);

  // Compute hero carousel TV Shows based on heroMode and shows
  const heroCarouselShows = React.useMemo(() => {
    if (!Array.isArray(shows) || shows.length === 0) return [];
    if (heroMode.toLowerCase() === "recently added") {
      return [...shows]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
    }
    if (heroMode.toLowerCase() === "most searched") {
      return [...shows].sort((a, b) => b.Searches - a.Searches).slice(0, 6);
    }
    return [...shows].sort((a, b) => b.Rating - a.Rating).slice(0, 6);
  }, [shows, heroMode]);

  useEffect(() => {
    if (!profile) return;
    api
      .post("/profiles/watched", { profileId: profile._id })
      .then((res) => {
        setWatchedCategories(res.data.watchedCategories || {});
      })
      .catch(() => {});
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    api
      .post("/profiles/get-watch-history", { profileId: profile._id })
      .then((res) => setHistory(res.data.watchHistory || []))
      .catch(() => setHistory([]));
  }, [profile]);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    dispatch(clearUser());
    dispatch(clearProfiles());
    navigate("/login");
  };

  // Sorted watched categories by count descending
  const sortedWatchedCategories = React.useMemo(() => {
    if (!watchedCategories) return [];
    return Object.entries(watchedCategories)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);
  }, [watchedCategories]);

  // Helper to check genre match (handles both string and object)
  const hasGenre = (show, genre) =>
    Array.isArray(show.Genre) &&
    show.Genre.some(
      (g) =>
        (typeof g === "object" && g !== null && g.name
          ? g.name
          : typeof g === "string"
          ? g
          : "") === genre
    );

  // TV Shows by watched categories, in order
  const showsByCategory = sortedWatchedCategories.map((cat) => ({
    category: cat,
    shows: shows.filter(
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
  })).filter(({ shows }) => shows.length > 0);

  // Predefined genre carousels
  const actionShows = shows.filter((show) => hasGenre(show, "Action"));
  const dramaShows = shows.filter((show) => hasGenre(show, "Drama"));
  const adventureShows = shows.filter((show) => hasGenre(show, "Adventure"));
  const crimeShows = shows.filter((show) => hasGenre(show, "Crime"));
  const comedyShows = shows.filter((show) => hasGenre(show, "Comedy"));

  if (loading) return <NetflixLoader />;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center">
      <Navbar
        profile={profile}
        profileURL={profileURL}
        onLogout={handleLogout}
      />
      {/* Hero Carousel (only TV Shows) */}
      {heroCarouselShows.length > 0 && (
        <HeroCarousel movies={heroCarouselShows} mode={heroMode} />
      )}
      <div className="pt-22 max-w-7xl mx-auto w-full px-4 flex-1">
        {/* Recommended carousels for each watched category */}
        {showsByCategory.length > 0 ? (
          showsByCategory.map(({ category, shows }) => (
            <section className="w-full max-w-7xl px-4 mt-8" key={category}>
              <h2 className="text-2xl font-bold mb-4">
                {category} TV Shows
              </h2>
              <MovieCarousel
                movies={shows}
                category={category}
                watchHistory={history}
                viewMoreType="tvshows"
              />
            </section>
          ))
        ) : (
          <section className="w-full max-w-7xl px-4 mt-8">
            <h2 className="text-2xl font-bold mb-4">All TV Shows</h2>
            <MovieCarousel
              movies={shows}
              category="TV Show"
              watchHistory={history}
              viewMoreType="tvshows"
            />
          </section>
        )}
        {/* Predefined genre carousels */}
        <section className="w-full max-w-7xl px-4 mt-8">
          <h2 className="text-2xl font-bold mb-4">Action TV Shows</h2>
          <MovieCarousel movies={actionShows} category="Action" watchHistory={history} viewMoreType="tvshows" />
        </section>
        <section className="w-full max-w-7xl px-4 mt-8">
          <h2 className="text-2xl font-bold mb-4">Drama TV Shows</h2>
          <MovieCarousel movies={dramaShows} category="Drama" watchHistory={history} viewMoreType="tvshows" />
        </section>
        <section className="w-full max-w-7xl px-4 mt-8">
          <h2 className="text-2xl font-bold mb-4">Adventure TV Shows</h2>
          <MovieCarousel movies={adventureShows} category="Adventure" watchHistory={history} viewMoreType="tvshows" />
        </section>
        <section className="w-full max-w-7xl px-4 mt-8">
          <h2 className="text-2xl font-bold mb-4">Crime TV Shows</h2>
          <MovieCarousel movies={crimeShows} category="Crime" watchHistory={history} viewMoreType="tvshows" />
        </section>
        <section className="w-full max-w-7xl px-4 mt-8">
          <h2 className="text-2xl font-bold mb-4">Comedy TV Shows</h2>
          <MovieCarousel movies={comedyShows} category="Comedy" watchHistory={history} viewMoreType="tvshows" />
        </section>
      </div>
      <Footer />
    </div>
  );
}
