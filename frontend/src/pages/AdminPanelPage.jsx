import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../api";
import NetflixLoader from "../components/NetflixLoader";
import Footer from "../components/Footer";
import MovieForm from "../components/MovieForm";
import AdminNavbar from "../components/AdminNavbar";
import SearchBar from "../components/SearchBar";
// Add MUI Snackbar and Alert
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

export default function AdminPanelPage() {
  const [movies, setMovies] = useState([]);
  const [actors, setActors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editMovie, setEditMovie] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [genreName, setGenreName] = useState("");
  const [genreLoading, setGenreLoading] = useState(false);
  const [actorName, setActorName] = useState("");
  const [actorLoading, setActorLoading] = useState(false);
  const [editedActorId, setEditedActorId] = useState(null);
  const [editedActorName, setEditedActorName] = useState("");
  const [editedGenreId, setEditedGenreId] = useState(null);
  const [editedGenreName, setEditedGenreName] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    color: "success",
  });
  const [loading, setLoading] = useState(true);
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

  const fetchActors = () => {
    setLoading(true);
    api
      .get("/movies/actors")
      .then((res) => {
        if (Array.isArray(res.data)) setActors(res.data);
        else if (res.data && Array.isArray(res.data.actors))
          setActors(res.data.actors);
        else setActors([]);
      })
      .catch(() => setActors([]))
      .finally(() => setLoading(false));
  };

  const fetchGenres = () => {
    setLoading(true);
    api
      .get("/movies/genres")
      .then((res) => {
        if (Array.isArray(res.data)) setGenres(res.data);
        else if (res.data && Array.isArray(res.data.genres))
          setGenres(res.data.genres);
        else setGenres([]);
      })
      .catch(() => setGenres([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMovies();
    fetchActors();
    fetchGenres();
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

  const handleDeleteActor = async (actorId) => {
    if (!window.confirm("Are you sure you want to delete this actor?")) return;
    try {
      await api.delete(`/movies/actors/delete/${actorId}`);
      setActors((prev) => prev.filter((m) => m._id !== actorId));
    } catch (err) {
      console.error("Error deleting actor:", err);
      alert("Failed to delete actor");
    }
  };

  const handleDeleteGenre = async (genreId) => {
    if (!window.confirm("Are you sure you want to delete this genre?")) return;
    try {
      await api.delete(`/movies/genres/delete/${genreId}`);
      setGenres((prev) => prev.filter((g) => g._id !== genreId));
      setSnackbar({
        open: true,
        message: "Genre deleted successfully!",
        color: "success",
      });
    } catch (err) {
      console.error("Error deleting genre:", err);
      setSnackbar({
        open: true,
        message: "Failed to delete genre",
        color: "error",
      });
    }
  };

  const handleActorEdit = async () => {
    if (!editedActorId || !editedActorName.trim()) return;
    try {
      await api.put(`/movies/actors/update/${editedActorId}`, {
        name: editedActorName.trim(),
      });
      await fetchActors(); // ✅ Add this

      // Update local list
      // setActors((prev) =>
      //   prev.map((actor) =>
      //     actor._id === editedActorId ? { ...actor, name: editedActorName } : actor
      //   )
      // );

      setSnackbar({
        open: true,
        message: "Actor updated successfully!",
        color: "success",
      });

      setEditedActorId(null);
      setEditedActorName("");
    } catch (err) {
      console.error("Error updating actor:", err);
      alert("Failed to update actor");
    }
  };

  const handleGenreEdit = async () => {
    if (!editedGenreId || !editedGenreName.trim()) return;
    try {
      await api.put(`/movies/genres/update/${editedGenreId}`, {
        name: editedGenreName.trim(),
      });
      await fetchGenres();
      setSnackbar({
        open: true,
        message: "Genre updated successfully!",
        color: "success",
      });
      setEditedGenreId(null);
      setEditedGenreName("");
    } catch (err) {
      console.error("Error updating genre:", err);
      setSnackbar({
        open: true,
        message: "Failed to update genre",
        color: "error",
      });
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

  // Add new genre handler
  const handleAddGenre = async (e) => {
    e.preventDefault();
    setGenreLoading(true);
    try {
      await api.post("/movies/genres", { name: genreName });
      setGenreName("");
      setSnackbar({
        open: true,
        message: "Genre added successfully!",
        color: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to add genre",
        color: "error",
      });
    }
    setGenreLoading(false);
  };
  // Add new actor handler
  const handleAddActor = async (e) => {
    e.preventDefault();
    setActorLoading(true);
    try {
      await api.post("/movies/actors", { name: actorName });
      setSnackbar({
        open: true,
        message: "Actor added successfully!",
        color: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to add actor",
        color: "error",
      });
    }
    setActorLoading(false);
  };

  // Snackbar close handler
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Snackbar auto-close effect
  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(
        () => setSnackbar({ ...snackbar, open: false }),
        2000
      );
      return () => clearTimeout(timer);
    }
  }, [snackbar]);

  if (loading) return <NetflixLoader />;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <AdminNavbar />
      {/* MUI Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        transitionDuration={700}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbar.color}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
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
          <button
            className={`text-left px-4 py-3 cursor-pointer rounded mb-2 font-semibold transition ${
              activeTab === "all-actors"
                ? "bg-red-600 text-white"
                : "hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("all-actors")}
          >
            Actors
          </button>
          <button
            className={`text-left px-4 py-3 cursor-pointer rounded mb-2 font-semibold transition ${
              activeTab === "all-genres"
                ? "bg-red-600 text-white"
                : "hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("all-genres")}
          >
            Genres
          </button>
          <button
            className={`text-left px-4 py-3 cursor-pointer rounded mb-2 font-semibold transition ${
              activeTab === "change-mode"
                ? "bg-red-600 text-white"
                : "hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("change-mode")}
          >
            Change the Mode
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
                      <th className="px-4 py-2 border-r border-gray-800">
                        Title
                      </th>
                      <th className="px-4 py-2 border-r border-gray-800">
                        Year
                      </th>
                      <th className="px-4 py-2 border-r border-gray-800">
                        Genre
                      </th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Filter table rows based on search */}
                    {movies
                      .filter(
                        (movie) =>
                          movie.Title?.toLowerCase().includes(
                            search.toLowerCase()
                          ) ||
                          (Array.isArray(movie.Genre) &&
                            movie.Genre.some((g) =>
                              (typeof g === "object" && g !== null ? g.name : g)
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
                                ? movie.Genre.map((g) => g.name || g).join(", ")
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
          {activeTab === "add-genre" && (
            <div className="max-w-md mx-auto bg-gray-900 rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">
                {editedGenreId ? "Edit Genre" : "Add New Genre"}
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (editedGenreId) {
                    await handleGenreEdit();
                    setActiveTab("all-genres");
                  } else {
                    await handleAddGenre(e);
                    await fetchGenres();
                  }
                }}
                className="flex flex-col gap-4"
              >
                <input
                  type="text"
                  value={editedGenreId ? editedGenreName : genreName}
                  onChange={(e) => {
                    if (editedGenreId) setEditedGenreName(e.target.value);
                    else setGenreName(e.target.value);
                  }}
                  placeholder="Genre name"
                  className="p-3 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-600 transition"
                  required
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded transition"
                  disabled={genreLoading || (editedGenreId && !editedGenreName.trim())}
                >
                  {genreLoading
                    ? editedGenreId
                      ? "Saving..."
                      : "Adding..."
                    : editedGenreId
                      ? "Edit Genre"
                      : "Add Genre"}
                </button>
              </form>
            </div>
          )}
          {activeTab === "all-actors" && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Actors</h3>
              <div className="max-w-md mx-auto bg-gray-900 rounded-lg shadow-lg p-8 mb-8">
                <h4 className="text-xl font-bold mb-4 text-center">
                  {editedActorId ? "Edit Actor" : "Add New Actor"}
                </h4>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (editedActorId) {
                      await handleActorEdit();
                    } else {
                      await handleAddActor(e);
                      await fetchActors();
                    }
                  }}
                  className="flex flex-col gap-4"
                >
                  <input
                    type="text"
                    value={editedActorId ? editedActorName : actorName}
                    onChange={(e) => {
                      if (editedActorId) setEditedActorName(e.target.value);
                      else setActorName(e.target.value);
                    }}
                    placeholder="Actor name"
                    className="p-3 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-600 transition"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded transition"
                    disabled={actorLoading || (editedActorId && !editedActorName.trim())}
                  >
                    {actorLoading
                      ? editedActorId
                        ? "Saving..."
                        : "Adding..."
                      : editedActorId
                        ? "Edit Actor"
                        : "Add Actor"}
                  </button>
                </form>
              </div>
              <div className="mb-6 max-w-md">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search actor..."
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-600 transition"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-900 rounded-lg">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-r border-gray-800">
                        Actor
                      </th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actors
                      .filter((actor) =>
                        actor.name?.toLowerCase().includes(search.toLowerCase())
                      )
                      .slice(0, visibleCount)
                      .map((actor, index, arr) => {
                        const isLast = index === arr.length - 1;
                        return (
                          <tr
                            key={actor._id}
                            ref={isLast ? lastMovieRef : null}
                            className="border-b border-gray-800"
                          >
                            <td className="px-4 py-2 border-r border-gray-800">
                              {actor.name}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => {
                                    setEditedActorId(actor._id);
                                    setEditedActorName(actor.name);
                                  }}
                                  className="text-blue-400 font-semibold hover:underline"
                                >
                                  Edit
                                </button>
                                <span className="h-5 border-l border-gray-700"></span>
                                <button
                                  onClick={() => handleDeleteActor(actor._id)}
                                  className="text-red-500 font-semibold hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                    {/* Loading indicator for infinite scroll */}
                    {(fetchingMore && visibleCount < actors.filter((actor) =>
                      actor.name?.toLowerCase().includes(search.toLowerCase())
                    ).length) && (
                      <tr>
                        <td colSpan={2} className="text-center py-6">
                          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        </td>
                      </tr>
                    )}

                    {/* No actors found */}
                    {actors.length === 0 && (
                      <tr>
                        <td
                          colSpan={2}
                          className="text-center text-gray-400 py-8"
                        >
                          No actors found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === "all-genres" && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Genres</h3>
              <div className="max-w-md mx-auto bg-gray-900 rounded-lg shadow-lg p-8 mb-8">
                <h4 className="text-xl font-bold mb-4 text-center">
                  {editedGenreId ? "Edit Genre" : "Add New Genre"}
                </h4>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (editedGenreId) {
                      await handleGenreEdit();
                    } else {
                      await handleAddGenre(e);
                      await fetchGenres();
                    }
                  }}
                  className="flex flex-col gap-4"
                >
                  <input
                    type="text"
                    value={editedGenreId ? editedGenreName : genreName}
                    onChange={(e) => {
                      if (editedGenreId) setEditedGenreName(e.target.value);
                      else setGenreName(e.target.value);
                    }}
                    placeholder="Genre name"
                    className="p-3 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-600 transition"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded transition"
                    disabled={genreLoading || (editedGenreId && !editedGenreName.trim())}
                  >
                    {genreLoading
                      ? editedGenreId
                        ? "Saving..."
                        : "Adding..."
                      : editedGenreId
                        ? "Edit Genre"
                        : "Add Genre"}
                  </button>
                </form>
              </div>
              <div className="mb-6 max-w-md">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search genre..."
                  className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-600 transition"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-900 rounded-lg">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-r border-gray-800">
                        Genre
                      </th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {genres
                      .filter((genre) =>
                        genre.name?.toLowerCase().includes(search.toLowerCase())
                      )
                      .slice(0, visibleCount)
                      .map((genre, index, arr) => {
                        const isLast = index === arr.length - 1;
                        return (
                          <tr
                            key={genre._id}
                            ref={isLast ? lastMovieRef : null}
                            className="border-b border-gray-800"
                          >
                            <td className="px-4 py-2 border-r border-gray-800">
                              {genre.name}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => {
                                    setEditedGenreId(genre._id);
                                    setEditedGenreName(genre.name);
                                  }}
                                  className="text-blue-400 font-semibold hover:underline"
                                >
                                  Edit
                                </button>
                                <span className="h-5 border-l border-gray-700"></span>
                                <button
                                  onClick={() => handleDeleteGenre(genre._id)}
                                  className="text-red-500 font-semibold hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {(fetchingMore && visibleCount < genres.filter((genre) =>
                      genre.name?.toLowerCase().includes(search.toLowerCase())
                    ).length) && (
                      <tr>
                        <td colSpan={2} className="text-center py-6">
                          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                        </td>
                      </tr>
                    )}
                    {genres.length === 0 && (
                      <tr>
                        <td
                          colSpan={2}
                          className="text-center text-gray-400 py-8"
                        >
                          No genres found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === "change-mode" && (
            <div className="max-w-md mx-auto bg-gray-900 rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Change Hero Carousel Mode
              </h3>
              <ModeSelector />
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

function ModeSelector() {
  const [modes, setModes] = useState([]);
  const [mode, setMode] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/settings/modes")
      .then((res) => {
        setModes(res.data.modes || []);
        return api.get("/settings/hero-mode");
      })
      .then((res) => {
        if (res.data && res.data.heroMode) setMode(res.data.heroMode);
      })
      .catch(() => {});
  }, []);
  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      // The backend expects /settings/hero-mode for setting the current mode
      await api.post("/settings/hero-mode", { mode });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save mode");
    }
    setSaving(false);
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
      className="flex flex-col gap-6"
    >
      <label className="flex flex-col gap-2">
        <span className="text-white font-semibold mb-2">Select Mode:</span>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="p-3 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-600 transition"
        >
          {modes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded transition"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Mode"}
      </button>
      {success && <div className="text-green-400 text-center">Mode saved!</div>}
      {error && <div className="text-red-400 text-center">{error}</div>}
    </form>
  );
}
