import React, { useEffect, useState } from "react";
import api from "../api";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import NetflixLoader from "../components/NetflixLoader";
import * as Progress from "@radix-ui/react-progress";

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

  // Helper to get progress for a movie
  const getProgress = (entry) => {
    if (entry && entry.duration > 0) {
      return Math.round((entry.progress / entry.duration) * 100);
    }
    return null;
  };

  if (loading) return <NetflixLoader />;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar profile={profile} profileURL={profileURL} />
      <main className="flex-1 max-w-7xl mx-auto py-20 w-full px-4">
        <h2 className="text-3xl font-bold mb-8">Watch History</h2>
        {history.length === 0 ? (
          <div className="text-gray-400">No history yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {history.map((entry) => {
              const progressValue = getProgress(entry);
              return (
                <div
                  key={entry.movie._id}
                  className="bg-gray-900 rounded-lg shadow-lg overflow-hidden cursor-pointer group transition hover:scale-105 flex flex-col"
                  onClick={() => navigate(`/movies/${entry.movie._id}`)}
                >
                  <div className="relative w-full h-56 flex items-center justify-center">
                    <img
                      src={
                        Array.isArray(entry.movie.Image) && entry.movie.Image.length > 0
                          ? entry.movie.Image[0].startsWith("http")
                            ? entry.movie.Image[0]
                            : `http://localhost:5000/uploads/${entry.movie.Image[0]}`
                          : "https://placehold.co/220x330?text=No+Image"
                      }
                      alt={entry.movie.Title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                    {progressValue !== 0 && (
                      <div className="absolute left-0 bottom-0 w-full px-0 pb-0 z-20">
                        <Progress.Root
                          value={progressValue}
                          className="w-full h-1 bg-gray-700"
                        >
                          <Progress.Indicator
                            className="h-1 bg-red-500 transition-all"
                            style={{ width: `${progressValue}%` }}
                          />
                        </Progress.Root>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between p-4 flex-1">
                    <div>
                      <h3 className="text-lg font-bold mb-1 truncate">{entry.movie.Title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-200 font-semibold mb-2">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg"
                          alt="IMDb"
                          className="w-8 h-4 object-contain"
                        />
                        <span>{entry.movie.Rating || "N/A"}</span>
                        <span>·</span>
                        <span>{entry.movie.Year}</span>
                      </div>
                      <p className="text-xs text-gray-300 mb-2 line-clamp-2">
                        {entry.movie.Description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
