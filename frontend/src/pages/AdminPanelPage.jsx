import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../api";
import NetflixLoader from "../components/NetflixLoader";
import Footer from "../components/Footer";
import MovieForm from "../components/MovieForm";
import AdminNavbar from "../components/AdminNavbar";
import SearchBar from "../components/SearchBar";

export default function AdminPanelPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard"); 
  const [editMovie, setEditMovie] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [search, setSearch] = useState("");
  const observer = useRef();

  const lastMovieRef = useCallback(
    (node) => {
      if (fetchingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && visibleCount < movies.length) {
          setFetchingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => prev + 40);
            setFetchingMore(false);
          }, 800);
        }
      });
      if (node) observer.current.observe(node);
    },
    [fetchingMore, visibleCount, movies.length]
  );

  const fetchMovies = () => {
    setLoading(true);
    api
      .get("/movies")
      .then((res) => {
        if (Array.isArray(res.data)) setMovies(res.data);
        else if (res.data && Array.isArray(res.data.movies))
          setMovies(res.data.movies);
        else setMovies([]);
      })
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleDelete = async (movieId) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
    try {
      await api.delete(`/movies/${movieId}`);
      setMovies((prev) => prev.filter((m) => m._id !== movieId));
    } catch (err) {
      console.error("Error deleting movie:", err);
      alert("Failed to delete movie");
    }
  };

  const handleEdit = (movie) => {
    setEditMovie(movie);
    setActiveTab("edit");
  };

  const handleFormSuccess = () => {
    setEditMovie(null);
    setActiveTab("dashboard");
    fetchMovies();
  };

  if (loading) return <NetflixLoader />;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <AdminNavbar />
      <div className="flex flex-1 pt-24">
        <aside
          className="sticky top-24 left-0 w-64 bg-gray-900 border-r border-gray-800 flex flex-col py-8 px-4 h-[calc(100vh-96px)] z-20"
          style={{ alignSelf: "flex-start" }}
        >
          <h2 className="text-2xl font-bold mb-8 text-center">Admin Panel</h2>
          <button
            className={`text-left px-4 py-3 rounded mb-2 cursor-pointer font-semibold transition ${
              activeTab === "dashboard"
                ? "bg-red-600 text-white"
                : "hover:bg-gray-800"
            }`}
            onClick={() => {
              setActiveTab("dashboard");
              setEditMovie(null);
            }}
          >
            Dashboard (All Movies)
          </button>
          <button
            className={`text-left px-4 py-3 cursor-pointer rounded mb-2 font-semibold transition ${
              activeTab === "add"
                ? "bg-red-600 text-white"
                : "hover:bg-gray-800"
            }`}
            onClick={() => {
              setActiveTab("add");
              setEditMovie(null);
            }}
          >
            Add New Movie
          </button>
        </aside>
        <main className="flex-1 px-8 py-8 ml-34 mt-2 max-w-5xl mx-auto">
          {activeTab === "dashboard" && (
            <div>
              <h3 className="text-2xl font-bold mb-6">All Movies</h3>
              {/* Search bar for filtering movies */}
              <div className="mb-6 max-w-md">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title or genre..."
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-600 transition"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-900 rounded-lg">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-r border-gray-800">Title</th>
                      <th className="px-4 py-2 border-r border-gray-800">Year</th>
                      <th className="px-4 py-2 border-r border-gray-800">Genre</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Filter table rows based on search */}
                    {movies
                      .filter(
                        (movie) =>
                          movie.Title?.toLowerCase().includes(search.toLowerCase()) ||
                          (Array.isArray(movie.Genre) &&
                            movie.Genre.some((g) =>
                              (typeof g === "object" && g !== null
                                ? g.name
                                : g
                              )
                                .toLowerCase()
                                .includes(search.toLowerCase())
                            ))
                      )
                      .slice(0, visibleCount)
                      .map((movie, index, arr) => {
                        const isLast = index === arr.length - 1;
                        return (
                          <tr
                            key={movie._id}
                            ref={isLast ? lastMovieRef : null}
                            className="border-b border-gray-800"
                          >
                            <td className="px-4 py-2 border-r border-gray-800">
                              {movie.Title}
                            </td>
                            <td className="px-4 py-2 border-r border-gray-800">
                              {movie.Year}
                            </td>
                            <td className="px-4 py-2 border-r border-gray-800">
                              {Array.isArray(movie.Genre)
                                ? movie.Genre.map((g) => (g.name || g)).join(", ")
                                : movie.Genre || ""}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEdit(movie)}
                                  className="text-blue-400 hover:underline"
                                >
                                  Edit
                                </button>
                                <span className="h-5 border-l border-gray-700"></span>
                                <button
                                  onClick={() => handleDelete(movie._id)}
                                  className="text-red-500 hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {fetchingMore && (
                      <tr>
                        <td colSpan={4}>
                          <div className="flex items-center justify-center py-6">
                            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        </td>
                      </tr>
                    )}
                    {movies.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center text-gray-400 py-8"
                        >
                          No movies found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === "add" && <MovieForm onSuccess={handleFormSuccess} />}
          {activeTab === "edit" && editMovie && (
            <MovieForm movie={editMovie} onSuccess={handleFormSuccess} />
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
