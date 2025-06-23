import React, { useEffect, useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import NetflixLoader from "../components/NetflixLoader";
import Footer from "../components/Footer";

export default function AdminPanelPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all movies for admin management
  useEffect(() => {
    setLoading(true);
    api
      .get("/movies")
      .then((res) => {
        if (Array.isArray(res.data)) setMovies(res.data);
        else if (res.data && Array.isArray(res.data.movies)) setMovies(res.data.movies);
        else setMovies([]);
      })
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, []);

  // Example: Delete a movie
  const handleDelete = async (movieId) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return;
    try {
      await api.delete(`/movies/${movieId}`);
      setMovies((prev) => prev.filter((m) => m._id !== movieId));
    } catch (err) {
        console.error("Failed to delete movie:", err);
      alert("Failed to delete movie");
    }
  };

  if (loading) return <NetflixLoader />;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto w-full px-4 flex-1">
        <h2 className="text-3xl font-bold mb-8">Admin Panel</h2>
        <div className="mb-6">
          <a
            href="/admin/add-movie"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold"
          >
            Add New Movie
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Year</th>
                <th className="px-4 py-2">Genre</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie._id} className="border-b border-gray-800">
                  <td className="px-4 py-2">{movie.Title}</td>
                  <td className="px-4 py-2">{movie.Year}</td>
                  <td className="px-4 py-2">{Array.isArray(movie.Genre) ? movie.Genre.join(", ") : ""}</td>
                  <td className="px-4 py-2">
                    <a
                      href={`/admin/edit-movie/${movie._id}`}
                      className="text-blue-400 hover:underline mr-4"
                    >
                      Edit
                    </a>
                    <button
                      onClick={() => handleDelete(movie._id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {movies.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-gray-400 py-8">
                    No movies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
}
