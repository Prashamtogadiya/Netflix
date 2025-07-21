import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../api";
import NetflixLoader from "../components/NetflixLoader";
import Navbar from "../components/Navbar";
import { clearUser } from "../features/user/userSlice";
import { clearProfiles } from "../features/profiles/profileSlice";
import Footer from "../components/Footer";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as Progress from "@radix-ui/react-progress";

const PAGE_SIZE = 24;

export default function AllTVShowsPage() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState([]);
  const profile = useSelector((state) => state.profiles.selectedProfile);
  const profileURL = profile?.avatar || "https://placehold.co/120x120?text=User";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loaderRef = useRef();

  // Fetch TV Shows with pagination
  const fetchShows = useCallback(
    async (pageNum) => {
      if (fetchingMore) return;
      if (pageNum === 1) setLoading(true);
      else setFetchingMore(true);

      try {
        const res = await api.get("/movies");
        let data = Array.isArray(res.data) ? res.data : [];
        // Filter for TV Shows only
        data = data.filter(
          (m) =>
            Array.isArray(m.Types) &&
            m.Types.some(
              (t) => typeof t === "string" && t.trim() === "TV Show"
            )
        );
        // Pagination logic
        const start = (pageNum - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const pageData = data.slice(start, end);
        if (pageNum === 1) setShows(pageData);
        else setShows((prev) => [...prev, ...pageData]);
        setHasMore(end < data.length);
      } catch {
        if (pageNum === 1) setShows([]);
      } finally {
        setLoading(false);
        setFetchingMore(false);
      }
    },
    [fetchingMore]
  );

  useEffect(() => {
    setPage(1);
    fetchShows(1);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!profile) return;
    api
      .post("/profiles/get-watch-history", { profileId: profile._id })
      .then((res) => setHistory(res.data.watchHistory || []))
      .catch(() => setHistory([]));
  }, [profile]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fetchingMore) {
          setPage((prev) => {
            const nextPage = prev + 1;
            fetchShows(nextPage);
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
  }, [fetchingMore, hasMore, loading, fetchShows]);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    dispatch(clearUser());
    dispatch(clearProfiles());
    navigate("/login");
  };

  // Helper to get progress for a show
  const getProgress = (showId) => {
    const entry = history.find(
      (h) => (h.movie._id || h.movie) === showId
    );
    if (entry && entry.duration > 0) {
      return Math.round((entry.progress / entry.duration) * 100);
    }
    return null;
  };

  if (loading && page === 1) return <NetflixLoader />;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar profile={profile} profileURL={profileURL} onLogout={handleLogout} />
      <div className="pt-24 max-w-7xl mx-auto w-full px-4 flex-1">
        <h2 className="text-3xl font-bold mb-8">All TV Shows</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
          {shows.length === 0 && !loading && (
            <div className="text-gray-400 col-span-full text-center">
              No TV Shows found.
            </div>
          )}
          {shows.map((show) => {
            const progressValue = getProgress(show._id);
            return (
              <div
                key={show._id}
                className="bg-gray-900 rounded-xl shadow-lg overflow-hidden cursor-pointer group transition hover:scale-105 relative flex flex-col h-[370px]"
                onClick={() => navigate(`/movies/${show._id}`)}
              >
                <div className="relative w-full h-[220px]">
                  <img
                    src={
                      Array.isArray(show.Image) && show.Image.length > 0
                        ? (
                            show.Image[0].startsWith("http")
                              ? show.Image[0]
                              : `http://localhost:5000/uploads/${show.Image[0]}`
                          )
                        : "https://placehold.co/220x330?text=No+Image"
                    }
                    alt={show.Title}
                    className="w-full h-full object-cover"
                  />
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
                <div className="flex flex-col justify-between p-4 flex-1 w-full">
                  <h3 className="text-lg font-bold mb-1 truncate">{show.Title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-200 font-semibold mb-2">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg"
                      alt="IMDb"
                      className="w-8 h-4 object-contain"
                    />
                    <span>{show.Rating || "N/A"}</span>
                    <span>·</span>
                    <span>{show.Year}</span>
                    <span>·</span>
                    <span>
                      {show.Runtime && !isNaN(show.Runtime)
                        ? `${Math.floor(show.Runtime / 60)}h ${show.Runtime % 60}m`
                        : "N/A"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 line-clamp-2">{show.Description}</p>
                </div>
              </div>
            );
          })}
        </div>
        {hasMore && (
          <div ref={loaderRef} className="flex justify-center py-8">
            {fetchingMore ? (
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <span className="text-gray-400">Loading more...</span>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
 