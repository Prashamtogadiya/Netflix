import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../api";
import NetflixLoader from "../components/NetflixLoader";
import Navbar from "../components/Navbar";
import { clearUser } from "../features/user/userSlice";
import { clearProfiles } from "../features/profiles/profileSlice";
import Footer from "../components/Footer";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import * as Progress from "@radix-ui/react-progress";

// Helper to get query params from the URL
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PAGE_SIZE = 24; // Number of movies to fetch per page

export default function AllMoviesPage() {
  // State for movies, loading, pagination, etc.
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [watchedCategories, setWatchedCategories] = useState({});
  const [history, setHistory] = useState([]);

  // Redux and router hooks
  const profile = useSelector((state) => state.profiles.selectedProfile);
  const profileURL = profile?.avatar || "https://placehold.co/120x120?text=User";
  const navigate = useNavigate();
  const query = useQuery();
  const dispatch = useDispatch();
  const category = query.get("category");

  const loaderRef = useRef();

  // Fetch movies from the server with pagination and filtering
  const fetchMovies = useCallback(
    async (pageNum) => {
      if (fetchingMore) return;
      if (pageNum === 1) setLoading(true);
      else setFetchingMore(true);

      try {
        // Get all movies from the backend
        const res = await api.get("/movies");
        let data = Array.isArray(res.data) ? res.data : [];
        // Filter by category if needed
        if (category && category !== "All" && category !== "Most Rated") {
          data = data.filter(
            (movie) =>
              Array.isArray(movie.Genre) &&
              movie.Genre.some(
                (g) =>
                  ((typeof g === "object" && g !== null && g.name
                    ? g.name
                    : typeof g === "string"
                    ? g
                    : ""
                  ).trim().toLowerCase() === category.trim().toLowerCase())
              )
          );
        } else if (category === "Most Rated") {
          // Sort by rating if "Most Rated"
          data = [...data].sort((a, b) => b.Rating - a.Rating);
        }
        // Pagination logic: slice the data for the current page
        const start = (pageNum - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const pageData = data.slice(start, end);
        if (pageNum === 1) setMovies(pageData);
        else setMovies((prev) => [...prev, ...pageData]);
        setHasMore(end < data.length);
      } catch {
        if (pageNum === 1) setMovies([]);
      } finally {
        setLoading(false);
        setFetchingMore(false);
      }
    },
    [category, fetchingMore]
  );

  // Fetch watched categories for the current profile
  useEffect(() => {
    if (!profile) return;
    api.post("/profiles/watched", { profileId: profile._id })
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
        ...movies.filter(
          (movie) =>
            Array.isArray(movie.Genre) &&
            movie.Genre.some(
              (g) =>
                (typeof g === "object" && g !== null && g.name
                  ? g.name
                  : typeof g === "string"
                  ? g
                  : ""
                ).trim().toLowerCase() === mostWatchedCategory.trim().toLowerCase()
            )
        ),
        ...movies.filter(
          (movie) =>
            !(
              Array.isArray(movie.Genre) &&
              movie.Genre.some(
                (g) =>
                  (typeof g === "object" && g !== null && g.name
                    ? g.name
                    : typeof g === "string"
                    ? g
                    : ""
                  ).trim().toLowerCase() === mostWatchedCategory.trim().toLowerCase()
              )
            )
        ),
      ]
    : movies;

  // Fetch first page or when category changes
  useEffect(() => {
    setPage(1);
    fetchMovies(1);
    // eslint-disable-next-line
  }, [category]);

  // Infinite scroll: load more when user scrolls to the bottom
  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fetchingMore) {
          setPage((prev) => {
            const nextPage = prev + 1;
            fetchMovies(nextPage);
            return nextPage;
          });
        }
      },
      { threshold: 1 }
    );
    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);
    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [fetchingMore, hasMore, loading, fetchMovies]);

  // Logout handler
  const handleLogout = async () => {
    await api.post("/auth/logout");
    dispatch(clearUser());
    dispatch(clearProfiles());
    localStorage.removeItem("user");
    localStorage.removeItem("selectedProfile");
    navigate("/login");
  };

  // Helper to get progress for a movie
  const getProgress = (movieId) => {
    const entry = history.find(
      (h) => (h.movie._id || h.movie) === movieId
    );
    if (entry && entry.duration > 0) {
      return Math.round((entry.progress / entry.duration) * 100);
    }
    return null;
  };

  // Show loader while loading the first page
  if (loading && page === 1) return <NetflixLoader />;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Top navigation bar */}
      <Navbar profile={profile} profileURL={profileURL} onLogout={handleLogout} />
      <div className="pt-24 max-w-7xl mx-auto w-full px-4 flex-1">
        {/* Page heading */}
        <h2 className="text-3xl font-bold mb-8">
          {category && category !== "All"
            ? category === "Most Rated"
              ? "Most Rated Movies"
              : `All ${category} Movies`
            : "All Movies"}
        </h2>
        {/* Movie grid - Optimized for wider, shorter cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {/* Show message if no movies */}
          {prioritizedMovies.length === 0 && !loading && (
            <div className="text-gray-400 col-span-full text-center">
              No movies found.
            </div>
          )}
          {/* Render each movie card */}
          {prioritizedMovies.map((movie) => {
            const progressValue = getProgress(movie._id);
            return (
              <div
                key={movie._id}
                className="bg-gray-900 rounded-lg shadow-lg overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-105 hover:shadow-xl relative"
                onClick={() => navigate(`/movies/${movie._id}`)}
              >
                <div className="relative">
                  {/* Much shorter and wider image for better aspect ratio */}
                  <img
                    src={
                      Array.isArray(movie.Image) && movie.Image.length > 0
                        ? (
                            movie.Image[0].startsWith("http")
                              ? movie.Image[0]
                              : `http://localhost:5000/uploads/${movie.Image[0]}`
                          )
                        : "https://placehold.co/400x225?text=No+Image"
                    }
                    alt={movie.Title}
                    className="w-full h-50 object-cover" // Reduced from h-40 to h-32 for wider aspect ratio
                  />
                  
                  {/* Play button overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-80 transition-all duration-300 flex items-center justify-center">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Progress bar if user has watched */}
                  {progressValue !== null && (
                    <div className="absolute left-0 bottom-0 w-full px-2 pb-1 z-20">
                      <Progress.Root
                        value={progressValue}
                        className="w-full h-1 bg-gray-700 rounded"
                        style={{ maxWidth: "100%" }}
                      >
                        <Progress.Indicator
                          className="h-1 rounded bg-red-500 transition-all"
                          style={{ width: `${progressValue}%` }}
                        />
                      </Progress.Root>
                    </div>
                  )}
                </div>
                
                {/* Compact movie info section */}
                <div className="p-3">
                  <h3 className="text-sm font-bold mb-1 truncate">{movie.Title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-300 mb-1">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg"
                      alt="IMDb"
                      className="w-5 h-2.5 object-contain"
                    />
                    <span>{movie.Rating || "N/A"}</span>
                    <span>·</span>
                    <span>{movie.Year}</span>
                    <span>·</span>
                    <span>
                      {movie.Runtime && !isNaN(movie.Runtime)
                        ? `${Math.floor(movie.Runtime / 60)}h ${movie.Runtime % 60}m`
                        : "N/A"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-tight">{movie.Description}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Loader for infinite scroll */}
        {hasMore && (
          <div ref={loaderRef} className="flex justify-center py-8">
            {fetchingMore ? (
              <div className="flex items-center justify-center">
                {/* Simple spinner for loading more */}
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <span className="text-gray-400">Loading more...</span>
            )}
          </div>
        )}
      </div>
      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
}
