import React, { useEffect, useState } from "react";
import api from "../api";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import NetflixLoader from "../components/NetflixLoader";

export default function HistoryPage() {
  const profile = useSelector((state) => state.profiles.selectedProfile);
  const profileURL = useSelector(
    (state) => state.profiles.selectedProfile.avatar
  );
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const MIN_LOADING_TIME = 1000;
    const startTime = Date.now();
    if (!profile) return;
    api
      .post("/profiles/get-watch-history", { profileId: profile._id })
      .then((res) => {
        setHistory(res.data.watchHistory || []);
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);
        setTimeout(() => setLoading(false), remaining);
      });
  }, [profile]);

  if (loading) {
    return <NetflixLoader />;
  }
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar profile={profile} profileURL={profileURL} />
      <main className="flex-1 max-w-3xl mx-auto py-20 w-full">
        <h2 className="text-3xl font-bold mb-6">Watch History</h2>
        {history.length === 0 ? (
          <div className="text-gray-400">No history yet.</div>
        ) : (
          history.map((entry) => (
            <div key={entry.movie._id} className="flex items-center gap-4 mb-4">
              <img
                src={
                  Array.isArray(entry.movie.Image) &&
                  entry.movie.Image.length > 0
                    ? entry.movie.Image[0].startsWith("http")
                      ? entry.movie.Image[0]
                      : `http://localhost:5000/uploads/${entry.movie.Image[0]}`
                    : "https://placehold.co/220x330?text=No+Image"
                }
                alt={entry.movie.Title}
                className="w-12 h-16 object-cover rounded"
              />
              <div>
                <div className="font-semibold">{entry.movie.Title}</div>
                <div className="text-sm text-gray-400">
                  Watched at: {new Date(entry.watchedAt).toLocaleString()}
                  {entry.progress > 0 && entry.duration > 0 && (
                    <span>
                      {" "}
                      &middot; Left at {Math.floor(entry.progress / 60)}:
                      {String(Math.floor(entry.progress % 60)).padStart(2, "0")}{" "}
                      / {Math.floor(entry.duration / 60)}:
                      {String(Math.floor(entry.duration % 60)).padStart(2, "0")}
                    </span>
                  )}
                </div>
                <button
                  className="text-red-500 hover:underline text-sm mt-1"
                  onClick={() => navigate(`/movies/${entry.movie._id}`)}
                >
                  Resume
                </button>
              </div>
            </div>
          ))
        )}
      </main>
      <Footer />
    </div>
  );
}
