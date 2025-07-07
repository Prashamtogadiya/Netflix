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

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchedCategories, setWatchedCategories] = useState({});
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
        setMovies(res.data);
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

  // Fetch watched categories for the current profile
  useEffect(() => {
    if (!profile) return;
    api.post("/profiles/watched", { profileId: profile._id })
      .then((res) => {
        setWatchedCategories(res.data.watchedCategories || {});
      })
      .catch(() => {});
  }, [profile]);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    dispatch(clearUser());
    dispatch(clearProfiles());
    navigate("/login");
  };

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

  const actionMovies = movies.filter((movie) => hasGenre(movie, "Action"));
  const dramaMovies = movies.filter((movie) => hasGenre(movie, "Drama"));
  const adventureMovies = movies.filter((movie) => hasGenre(movie, "Adventure"));
  const crimeMovies = movies.filter((movie) => hasGenre(movie, "Crime"));
  const comedyMovies = movies.filter((movie) => hasGenre(movie, "Comedy"));
  const mostRated = [...movies];
  const mostRatedMovies = mostRated.sort((a, b) => b.Rating - a.Rating);

  const mostWatchedCategory = React.useMemo(() => {
    if (!watchedCategories) return null;
    let max = 0, result = null;
    for (const [cat, count] of Object.entries(watchedCategories)) {
      if (count > max) {
        max = count;
        result = cat;
      }
    }
    return result;
  }, [watchedCategories]);

  // Prioritize movies from most-watched category
  const prioritizedMovies = mostWatchedCategory
    ? [
        ...movies.filter((movie) => hasGenre(movie, mostWatchedCategory)),
        ...movies.filter((movie) => !hasGenre(movie, mostWatchedCategory)),
      ]
    : movies;

  if (loading) return <NetflixLoader />;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center">
      <Navbar
        profile={profile}
        profileURL={profileURL}
        onLogout={handleLogout}
      />
      <div className="pt-22 max-w-7xl mx-auto w-full px-4 flex-1">
        <section className="w-full max-w-7xl px-8 mt-8">
          <h2 className="text-2xl font-bold mb-4">
            {mostWatchedCategory
              ? `Recommended: ${mostWatchedCategory} Movies`
              : "All Movies"}
          </h2>
          <MovieCarousel movies={prioritizedMovies} category={mostWatchedCategory || "All"} />
        </section>
        <section className="w-full max-w-7xl px-8 mt-8">
          <h2 className="text-2xl font-bold mb-4">Most Rated Movies</h2>
          <MovieCarousel movies={mostRatedMovies} category="Most Rated" />
        </section>
        <section className="w-full max-w-7xl px-8 mt-8">
          <h2 className="text-2xl font-bold mb-4">Action Movies</h2>
          <MovieCarousel movies={actionMovies} category="Action" />
        </section>
        <section className="w-full max-w-7xl px-8 mt-8">
          <h2 className="text-2xl font-bold mb-4">Drama Movies</h2>
          <MovieCarousel movies={dramaMovies} category="Drama" />
        </section>
        <section className="w-full max-w-7xl px-8 mt-8">
          <h2 className="text-2xl font-bold mb-4">Crime Movies</h2>
          <MovieCarousel movies={crimeMovies} category="Crime" />
        </section>
        <section className="w-full max-w-7xl px-8 mt-8">
          <h2 className="text-2xl font-bold mb-4">Adventure Movies</h2>
          <MovieCarousel movies={adventureMovies} category="Adventure" />
        </section>
        <section className="w-full max-w-7xl px-8 mt-8">
          <h2 className="text-2xl font-bold mb-4">Comedy Movies</h2>
          <MovieCarousel movies={comedyMovies} category="Comedy" />
        </section>
      </div>
      <Footer />
    </div>
  );
}