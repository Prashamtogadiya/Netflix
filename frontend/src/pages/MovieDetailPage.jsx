import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import api from "../api";
import Navbar from "../components/Navbar";
import MovieCarousel from "../components/MovieCarousel";
import NetflixLoader from "../components/NetflixLoader";
import { clearUser } from "../features/user/userSlice";
import { clearProfiles } from "../features/profiles/profileSlice";

export default function MovieDetailPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get profile and avatar from Redux for Navbar
  const profile = useSelector((state) => state.profiles.selectedProfile);
  const profileURL = profile?.avatar || "https://placehold.co/120x120?text=User";

  const [movie, setMovie] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  setLoading(true);
  const MIN_LOADING_TIME = 1000; // 1 second
  const startTime = Date.now();

  const fetchData = async () => {
    try {
      const [movieRes, allMoviesRes] = await Promise.all([
        api.get(`/movies/${movieId}`),
        api.get("/movies")
      ]);
      setMovie(movieRes.data);
      setMovies(allMoviesRes.data);
    } catch (err) {
      console.error("Error fetching movie data:", err);
      setMovie(null);
      setMovies([]);
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);
      setTimeout(() => setLoading(false), remaining);
    }
  };

  fetchData();
}, [movieId]);


  const handleLogout = async () => {
    await api.post("/auth/logout");
    dispatch(clearUser());
    dispatch(clearProfiles());
    localStorage.removeItem("user");
    localStorage.removeItem("selectedProfile");
    navigate("/login");
  };

  if (loading) return <NetflixLoader />;
  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <Navbar profile={profile} profileURL={profileURL} onLogout={handleLogout} />
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xl">Movie not found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar profile={profile} profileURL={profileURL} onLogout={handleLogout} />
      {/* Video Player */}
      <div className="w-full flex justify-center bg-black pt-20 pb-8">
        <div className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden shadow-lg">
          <iframe
            src={movie.Video}
            title={movie.Title}
            allowFullScreen
            className="w-full h-full"
            
          />
        </div>
      </div>
      {/* Movie Info */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-2">{movie.Title}</h1>
        <div className="flex items-center gap-4 mb-2">
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">{movie.Rating || "N/A"}</span>
          <span className="text-gray-400">{movie.Year}</span>
          <span className="text-gray-400">{movie.Genre?.join(" · ")}</span>
        </div>
        <p className="text-gray-200 mb-4">{movie.Description}</p>
        <div className="flex items-center gap-4 mb-6">
          <button
            className="flex items-center justify-center bg-black/80 hover:bg-gray-900 text-white rounded-full w-12 h-12 transition border-2 border-white"
            title="Add to My List"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-gray-400 mb-2">
          <span><b>Director:</b> {movie.Director}</span>
          <span><b>Actors:</b> {movie.Actors?.join(", ")}</span>
          <span><b>Language:</b> {movie.Language?.join(", ")}</span>
          <span><b>Awards:</b> {movie.Awards}</span>
        </div>
      </div>
      {/* Carousels */}
      <div className="max-w-7xl mx-auto w-full px-4">
        <h2 className="text-2xl font-bold mb-4">More Like This</h2>
        <MovieCarousel movies={movies} visibleCount={5} cardWidth={340} />
      </div>
      <div className="max-w-7xl mx-auto w-full px-4 mt-8">
        <h2 className="text-2xl font-bold mb-4">Popular on Netflix</h2>
        <MovieCarousel movies={movies} visibleCount={5} cardWidth={340} />
      </div>
    </div>
  );
}
