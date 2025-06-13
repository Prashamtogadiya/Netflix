import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../features/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { clearProfiles } from '../features/profiles/profileSlice';
import api from '../api';

export default function DashboardPage() {
  const profile = useSelector(state => state.profiles.selectedProfile);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [startIdx, setStartIdx] = useState(0);
  const [heroIdx, setHeroIdx] = useState(0);

  const VISIBLE_COUNT = 6;
  const SHIFT_BY = 2;
  const CARD_WIDTH = 232;

  // Fetch movies on mount
  useEffect(() => {
    api.get('/movies')
      .then(res => setMovies(res.data))
      .catch(() => setMovies([]));
  }, []);

  const handleLogout = async () => {
    await api.post('/auth/logout');
    dispatch(clearUser());
    dispatch(clearProfiles());
    navigate('/login');
  };

  if (!profile) return null;

  // Calculate the max start index so the last page is always full or partial, but doesn't wrap
  const maxStartIdx = Math.max(0, movies.length - VISIBLE_COUNT);

  const handlePrev = () => {
    setStartIdx((prev) => Math.max(prev - SHIFT_BY, 0));
  };

  const handleNext = () => {
    setStartIdx((prev) => Math.min(prev + SHIFT_BY, maxStartIdx));
  };

  const translateX = -(startIdx * CARD_WIDTH);

  // Hero carousel navigation handlers
  const handleHeroPrev = () => {
    setHeroIdx((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
  };

  const handleHeroNext = () => {
    setHeroIdx((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-transparent fixed w-full z-20">
        <div className="flex items-center gap-8">
          <span className="text-3xl font-extrabold text-red-600 tracking-wide">NETFLIX</span>
          <a href="/dashboard" className="text-white font-semibold hover:text-red-500 transition">Home</a>
          <a href="/profiles" className="text-white font-semibold hover:text-red-500 transition">Profiles</a>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-semibold">{profile.name}</span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            Log Out
          </button>
        </div>
      </nav>

      {/* Hero Carousel */}
      {movies.length > 0 && (
        <section className="relative w-full h-[60vw] min-h-[400px] max-h-[729px] flex items-end justify-start overflow-hidden">
          {/* Background image */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url(${
                Array.isArray(movies[heroIdx].Image) && movies[heroIdx].Image.length > 0
                  ? movies[heroIdx].Image[0]
                  : "https://placehold.co/1280x720?text=No+Image"
              })`,
              filter: "brightness(0.5)"
            }}
          />
          {/* Overlay content at left bottom */}
          <div className="relative z-10 mb-12 ml-12 max-w-xl flex flex-col">
            {/* IMDb, rating, year row */}
            <div className="flex items-center gap-2 mb-2">
              {/* IMDb logo */}
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg"
                alt="IMDb"
                className="w-10 h-5 object-contain"
                style={{ background: "transparent" }}
              />
              {/* Rating */}
              <span className="text-lg font-semibold">{movies[heroIdx].Rating || "N/A"}</span>
              {/* Separator */}
              <span className="text-lg font-semibold">·</span>
              <span className="text-lg font-semibold">{movies[heroIdx].Title}</span>

              <span className="text-lg font-semibold">·</span>

              {/* Year */}
              <span className="text-lg font-semibold">{movies[heroIdx].Year}</span>
            </div>
            {/* Description */}
            <p className="text-base mb-4 text-gray-200">{movies[heroIdx].Description}</p>
            {/* Watch Now button */}
            <button
              className="flex items-center gap-2 bg-white text-black font-bold cursor-pointer px-6 py-2 rounded-full hover:bg-gray-200 transition mb-4 w-fit"
              style={{ letterSpacing: '0.5px' }}
            >
              <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Watch Now
            </button>
            {/* Genre */}
            <div className="flex flex-wrap gap-3">
              <span className="text-sm">{movies[heroIdx].Genre?.join(' · ')}</span>
            </div>
          </div>
          {/* Left/Right arrows */}
          <button
            onClick={handleHeroPrev}
            className="absolute left-4 bottom-1/2 z-20 bg-black/60 hover:bg-black text-white rounded-full p-3 text-2xl transition"
          >
            &#8592;
          </button>
          <button
            onClick={handleHeroNext}
            className="absolute right-4 bottom-1/2 z-20 bg-black/60 hover:bg-black text-white rounded-full p-3 text-2xl transition" 
          >
            &#8594;
          </button>
        </section>
      )}

      {/* Horizontal Carousel */}
      <section className="px-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Popular on Netflix</h2>
        <div className="relative overflow-hidden">
          <button
            onClick={handlePrev}
            disabled={startIdx === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-2 transition cursor-pointer ${startIdx === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
            style={{ minWidth: 40 }}
            aria-label="Scroll left"
          >
            &#8592;
          </button>
          <div
            className="flex gap-6 transition-transform duration-500 ease-in-out"
            style={{
              width: `${movies.length * CARD_WIDTH}px`,
              transform: `translateX(${translateX}px)`
            }}
          >
            {movies.length === 0 && (
              <div className="text-gray-400">No movies found.</div>
            )}
            {movies.map(movie => (
              <div
                key={movie._id}
                className="min-w-[220px] max-w-[220px] bg-gray-900 rounded-lg shadow-lg flex-shrink-0 hover:scale-105 transition-transform duration-200"
              >
                <img
                  src={
                    Array.isArray(movie.Image) && movie.Image.length > 0
                      ? movie.Image[0]
                      : "https://placehold.co/220x330?text=No+Image"
                  }
                  alt={movie.Title}
                  className="w-full h-60 object-cover rounded-t-lg"
                />
                <div className="p-3">
                  <h3 className="text-lg font-bold truncate">{movie.Title}</h3>
                  <p className="text-xs text-gray-300 line-clamp-2">{movie.Description}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleNext}
            disabled={startIdx >= maxStartIdx}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-2 transition cursor-pointer ${startIdx >= maxStartIdx ? "opacity-30 cursor-not-allowed" : ""}`}
            style={{ minWidth: 40 }}
          >
            &#8594;
          </button>
        </div>
      </section>
    </div>
  );
}