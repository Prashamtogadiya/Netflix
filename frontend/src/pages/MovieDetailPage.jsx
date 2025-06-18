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

function ReviewSection({ movieId, user }) {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Fetch reviews
  useEffect(() => {
    setLoadingReviews(true);
    api
      .get(`/reviews/${movieId}`)
      .then((res) => setReviews(res.data.reviews || []))
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false));
  }, [movieId]);

  // Submit review
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/reviews/${movieId}`, { rating, comment });
      setComment("");
      setRating(5);
      // Refetch reviews after submit
      const res = await api.get(`/reviews/${movieId}`);
      setReviews(res.data.reviews || []);
      setShowAll(false); // Reset to show only 3 after new review
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert("Failed to submit review");
    }
    setSubmitting(false);
  };

  // Show only 3 reviews unless showAll is true
  const reviewsToShow = showAll
    ? reviews.slice().reverse()
    : reviews.slice().reverse().slice(0, 3);

  return (
    <div className="w-[95%] md:w-[60%] mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">Reviews</h2>
      {/* Add Review Form */}
      {user && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 flex flex-col gap-2 bg-gray-900 rounded-lg p-4"
        >
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-200">Your Rating:</span>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="bg-gray-800 text-white rounded px-2 py-1"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} ★
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a public review..."
            className="bg-gray-800 text-white rounded px-3 py-2 mt-2 resize-none"
            rows={2}
            maxLength={300}
            required
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded transition disabled:opacity-50"
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      )}
      {/* Reviews List */}
      <div className="flex flex-col gap-4">
        {loadingReviews ? (
          <div className="text-gray-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-gray-400">
            No reviews yet. Be the first to review!
          </div>
        ) : (
          <>
            {reviewsToShow.map((review, idx) => (
              <div
                key={review._id || idx}
                className="flex gap-3 items-start bg-gray-900 rounded-lg p-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-lg">
                  {review.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-200">
                      {review.user?.name || "User"}
                    </span>
                    <span className="text-yellow-400 text-sm">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleString()
                        : ""}
                    </span>
                  </div>
                  <div className="text-gray-100 mt-1">{review.comment}</div>
                </div>
              </div>
            ))}
            {reviews.length > 3 && !showAll && (
              <button
                className="mt-2 text-red-500 hover:underline font-semibold self-center"
                onClick={() => setShowAll(true)}
              >
                View more reviews
              </button>
            )}
            {showAll && reviews.length > 3 && (
              <button
                className="mt-2 text-gray-400 hover:underline font-semibold self-center"
                onClick={() => setShowAll(false)}
              >
                Show less
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

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
              className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12 transition border-2 border-white"
              title="Remove from My List"
              onClick={handleRemoveFromMyList}
              disabled={listLoading}
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 6l12 12M6 18L18 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : (
            <button
              className="flex items-center justify-center bg-black/80 hover:bg-gray-900 text-white rounded-full w-12 h-12 transition border-2 border-white"
              title="Add to My List"
              onClick={handleAddToMyList}
              disabled={listLoading}
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 5v14M5 12h14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
          <MovieCarousel movies={myListMovies} visibleCount={5} cardWidth={340} />
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
      <Footer />
    </div>
  );
}
