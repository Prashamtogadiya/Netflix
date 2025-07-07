import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import api from "../api";
import Navbar from "../components/Navbar";
import MovieCarousel from "../components/MovieCarousel";
import NetflixLoader from "../components/NetflixLoader";
import Footer from "../components/Footer";
import { clearUser } from "../features/user/userSlice";
import { clearProfiles } from "../features/profiles/profileSlice";
import ReviewSection from "../components/ReviewSection";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

// Add this Flex component for layout (since shadcn/radix UI uses Flex in the example)
function Flex({ children, gap = "3", mt = "0", justify = "start", ...props }) {
  const gapClass = gap === "3" ? "gap-3" : "";
  const mtClass = mt === "4" ? "mt-4" : mt === "3" ? "mt-3" : "";
  const justifyClass =
    justify === "end"
      ? "justify-end"
      : justify === "center"
      ? "justify-center"
      : "justify-start";
  return (
    <div className={`flex ${gapClass} ${mtClass} ${justifyClass}`} {...props}>
      {children}
    </div>
  );
}

export default function MovieDetailPage() {
  const { movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const profile = useSelector((state) => state.profiles.selectedProfile);
  const profileURL =
    profile?.avatar || "https://placehold.co/120x120?text=User";
  const user = useSelector((state) => state.user.user);

  const [movie, setMovie] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myListMovies, setMyListMovies] = useState([]);
  const [myListLoading, setMyListLoading] = useState(true);

  const [inMyList, setInMyList] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState("add"); // "add" or "remove"
  const [pendingAction, setPendingAction] = useState(null);
  const [watchedCategories, setWatchedCategories] = useState({});

  // Combine reset and fetch logic into one effect
  useEffect(() => {
    setMovie(null);
    setLoading(true);
    const MIN_LOADING_TIME = 1000; 
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
  }, [movieId, location.key]);

  useEffect(() => {
    if (!profile) return;
    setMyListLoading(true);
    api
      .get(`/profiles/${profile._id}/mylist`)
      .then((res) => setMyListMovies(res.data.myList || []))
      .catch(() => setMyListMovies([]))
      .finally(() => setMyListLoading(false));
  }, [profile]);

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

  useEffect(() => {
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
      .catch(() => setMovies([]));
  }, []);

  // Track watched category when movie is loaded and profile exists
  useEffect(() => {
    if (!profile || !movie?._id) return;
    api.post("/profiles/watched/update", {
      profileId: profile._id,
      movieId: movie._id,
    }).catch(() => {});
  }, [profile, movie?._id]);

  // Fetch watched categories for the current profile
  useEffect(() => {
    if (!profile) return;
    api.post("/profiles/watched", { profileId: profile._id })
      .then((res) => {
        setWatchedCategories(res.data.watchedCategories || {});
      })
      .catch(() => {});
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

  const hasGenre = (movie, genre) =>
    Array.isArray(movie.Genre) &&
    movie.Genre.some((g) => g.name === genre);

  // Filter movies for "Action" genre
  const actionMovies = Array.isArray(movies)
    ? movies.filter((m) => hasGenre(m, "Action"))
    : [];

  // const safeMovies = Array.isArray(movies) ? movies : [];

const safeMovies = Array.isArray(movies)&& movie
  ? movies.filter((m) => m._id !== movie._id) // filter out current movie
  : [];

  // Prioritize movies from most-watched category for "More Like This"
  const prioritizedMovies = mostWatchedCategory
    ? [
        ...safeMovies.filter((m) => hasGenre(m, mostWatchedCategory)),
        ...safeMovies.filter((m) => !hasGenre(m, mostWatchedCategory)),
      ]
    : safeMovies;

  const handleLogout = async () => {
    await api.post("/auth/logout");
    dispatch(clearUser());
    dispatch(clearProfiles());
    localStorage.removeItem("user");
    localStorage.removeItem("selectedProfile");
    navigate("/login");
  };

  const handleAddToMyList = () => {
    setAlertType("add");
    setPendingAction(() => async () => {
      setListLoading(true);
      try {
        await api.post("/profiles/mylist/add", {
          profileId: profile._id,
          movieId: movie._id,
        });
        setInMyList(true);
      } catch (err) {
        console.error("Error adding to My List:", err);
        // Optionally show an error message to the user
      }
      setListLoading(false);
    });
    setAlertOpen(true);
  };

  const handleRemoveFromMyList = () => {
    setAlertType("remove");
    setPendingAction(() => async () => {
      setListLoading(true);
      try {
        await api.post("/profiles/mylist/remove", {
          profileId: profile._id,
          movieId: movie._id,
        });
        setInMyList(false);
      } catch (err) {
        console.error("Error removing from My List:", err);
        // Optionally show an error message to the user
      }
      setListLoading(false);
    });
    setAlertOpen(true);
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
      <div className="pt-18">
        <div className="w-full h-[calc(100vh-64px)] bg-gray-950">
          <iframe
            src={movie.Video}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            className="w-full h-full"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-2">{movie.Title}</h1>
        <div className="flex items-center gap-4 mb-2">
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {movie.Rating || "N/A"}
          </span>
          <span className="text-gray-400">{movie.Year}</span>
          {/* Fix genre display: show names if objects */}
          <span className="text-gray-400">
            {Array.isArray(movie.Genre)
              ? movie.Genre.map((g) => (g && g.name ? g.name : g)).join(" · ")
              : ""}
          </span>
        </div>
        <p className="text-gray-200 mb-4">{movie.Description}</p>
        <div className="flex items-center gap-4 mb-6">
          <AlertDialog.Root open={alertOpen} onOpenChange={setAlertOpen}>
            <AlertDialog.Trigger asChild>
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
            </AlertDialog.Trigger>

            {/* Backdrop overlay */}
            <AlertDialog.Overlay className="fixed inset-0 z-[99] bg-black/80" />

            <AlertDialog.Content className="fixed z-[100] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-zinc-800">
                  <AlertDialog.Title className="text-xl font-semibold text-white">
                    {alertType === "add" ? "Add to My List" : "Remove from My List"}
                  </AlertDialog.Title>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                  <AlertDialog.Description className="text-zinc-300 text-base leading-relaxed">
                    {alertType === "add" 
                      ? `Are you sure you want to add "${movie?.Title || 'this movie'}" to your list?`
                      : `Are you sure you want to remove "${movie?.Title || 'this movie'}" from your list?`
                    }
                  </AlertDialog.Description>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-800 flex justify-end gap-3">
                  <AlertDialog.Cancel asChild>
                    <button
                      className="px-4 py-2 text-zinc-300 hover:text-white font-medium transition-colors duration-200"
                      type="button"
                    >
                      Cancel
                    </button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action asChild>
                    <button
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors duration-200"
                      type="button"
                      onClick={async () => {
                        setAlertOpen(false);
                        if (pendingAction) await pendingAction();
                      }}
                    >
                      {alertType === "add" ? "Add" : "Remove"}
                    </button>
                  </AlertDialog.Action>
                </div>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Root>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-gray-400 mb-2">
          <span>
            <b>Director:</b> {movie.Director}
          </span>
          <span>
            <b>Actors:</b>{" "}
            {Array.isArray(movie.Actors)
              ? movie.Actors.map((a) => (a && a.name ? a.name : a)).join(", ")
              : ""}
          </span>
          <span>
            <b>Language:</b> {movie.Language?.join(", ")}
          </span>
          <span>
            <b>Awards:</b> {movie.Awards}
          </span>
        </div>
      </div>
      <ReviewSection movieId={movieId} user={user} />

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

      <div className="max-w-7xl mx-auto w-full px-4">
        <h2 className="text-2xl font-bold mb-4">
          {mostWatchedCategory
            ? `More ${mostWatchedCategory} Movies`
            : "More Like This"}
        </h2>
        <MovieCarousel movies={prioritizedMovies} visibleCount={5} cardWidth={340} />
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