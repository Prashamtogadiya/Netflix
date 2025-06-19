import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import api from "../api";
import Navbar from "../components/Navbar";
import MovieCarousel from "../components/MovieCarousel";
import NetflixLoader from "../components/NetflixLoader";
import Footer from "../components/Footer";
import { clearUser } from "../features/user/userSlice";
import { clearProfiles } from "../features/profiles/profileSlice";
import ReviewSection from "../components/ReviewSection";

export default function MovieDetailPage() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get profile and avatar from Redux for Navbar
  const profile = useSelector((state) => state.profiles.selectedProfile);
  const profileURL =
    profile?.avatar || "https://placehold.co/120x120?text=User";
  const user = useSelector((state) => state.user.user);

  const [movie, setMovie] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myListMovies, setMyListMovies] = useState([]);
  const [myListLoading, setMyListLoading] = useState(true);

  // My List state
  const [inMyList, setInMyList] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // Fetch movie and all movies data
  useEffect(() => {
    setLoading(true);
    const MIN_LOADING_TIME = 1000; // 1 second
    const startTime = Date.now();

    const fetchData = async () => {
      try {
        const [movieRes, allMoviesRes] = await Promise.all([
          api.get(`/movies/${movieId}`),
          api.get("/movies"),
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

  // Fetch My List for the current profile
  useEffect(() => {
    if (!profile) return;
    setMyListLoading(true);
    api
      .get(`/profiles/${profile._id}/mylist`)
      .then((res) => setMyListMovies(res.data.myList || []))
      .catch(() => setMyListMovies([]))
      .finally(() => setMyListLoading(false));
  }, [profile]);

  // Check if movie is in My List for this profile
  useEffect(() => {
    if (!profile || !movie?._id) return;
    setListLoading(true);
    api
      .get(`/profiles/${profile._id}/mylist`)
      .then((res) => {
        const myList = res.data.myList || [];
        setInMyList(myList.some((m) => (m._id || m) === movie._id));
      })
      .catch(() => setInMyList(false))
      .finally(() => setListLoading(false));
  }, [profile, movie?._id]);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    dispatch(clearUser());
    dispatch(clearProfiles());
    localStorage.removeItem("user");
    localStorage.removeItem("selectedProfile");
    navigate("/login");
  };

  // Add to My List
  const handleAddToMyList = async () => {
    if (!profile || !movie) return;
    if (!window.confirm("Add this movie to your list?")) return;
    setListLoading(true);
    try {
      await api.post("/profiles/mylist/add", {
        profileId: profile._id,
        movieId: movie._id,
      });
      setInMyList(true);
    } catch (err) {
      console.error("Failed to add to My List:", err);
      alert("Failed to add to My List");
    }
    setListLoading(false);
  };

  // Remove from My List
  const handleRemoveFromMyList = async () => {
    if (!profile || !movie) return;
    if (!window.confirm("Remove this movie from your list?")) return;
    setListLoading(true);
    try {
      await api.post("/profiles/mylist/remove", {
        profileId: profile._id,
        movieId: movie._id,
      });
      setInMyList(false);
    } catch (err) {
      console.error("Failed to remove from My List:", err);
      alert("Failed to remove from My List");
    }
    setListLoading(false);
  };

  const actionMovies = movies.filter((m) =>
    m.Genre?.includes("Action")
  );

  if (loading) return <NetflixLoader />;
  if (!movie) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        <Navbar
          profile={profile}
          profileURL={profileURL}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xl">Movie not found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar
        profile={profile}
        profileURL={profileURL}
        onLogout={handleLogout}
      />
      {/* Video Player */}
      <div className="w-full flex justify-center bg-black pt-20 pb-8">
        <div className="w-full max-w-4xl aspect-video rounded-lg overflow-hidden shadow-lg">
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/d9MyW72ELq0?si=03ZmCfriWvOx2tGj"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            className="w-full h-full"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      {/* Movie Info */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-2">{movie.Title}</h1>
        <div className="flex items-center gap-4 mb-2">
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {movie.Rating || "N/A"}
          </span>
          <span className="text-gray-400">{movie.Year}</span>
          <span className="text-gray-400">{movie.Genre?.join(" · ")}</span>
        </div>
        <p className="text-gray-200 mb-4">{movie.Description}</p>
        <div className="flex items-center gap-4 mb-6">
          {inMyList ? (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded transition duration-200 font-semibold text-sm"
              title="Remove from My List"
              onClick={handleRemoveFromMyList}
              disabled={listLoading}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 6l12 12M6 18L18 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Remove</span>
            </button>
          ) : (
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded transition duration-200 font-semibold text-sm"
              title="Add to My List"
              onClick={handleAddToMyList}
              disabled={listLoading}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 5v14M5 12h14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>My List</span>
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-gray-400 mb-2">
          <span>
            <b>Director:</b> {movie.Director}
          </span>
          <span>
            <b>Actors:</b> {movie.Actors?.join(", ")}
          </span>
          <span>
            <b>Language:</b> {movie.Language?.join(", ")}
          </span>
          <span>
            <b>Awards:</b> {movie.Awards}
          </span>
        </div>
      </div>
      {/* Reviews Section */}
      <ReviewSection movieId={movieId} user={user} />

      {/* My List Section */}
      <div className="max-w-7xl mx-auto w-full px-4 mt-8">
        <h2 className="text-2xl font-bold mb-4">My List</h2>
        {myListLoading ? (
          <div className="text-gray-400 py-8">Loading your list...</div>
        ) : myListMovies.length === 0 ? (
          <div className="text-gray-400 py-8">No movies in your list yet.</div>
        ) : (
          <MovieCarousel
            movies={myListMovies}
            visibleCount={5}
            cardWidth={340}
          />
        )}
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
      <div className="max-w-7xl mx-auto w-full px-4 mt-8">
        <h2 className="text-2xl font-bold mb-4">Action Movies</h2>
        <MovieCarousel movies={actionMovies} visibleCount={5} cardWidth={340} />
      </div>
      <Footer />
    </div>
  );
}
  