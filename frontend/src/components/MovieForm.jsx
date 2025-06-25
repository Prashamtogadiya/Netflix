import React, { useState } from "react";
import TagInput from "./TagInput";
import api from "../api";

export default function MovieForm({ onSuccess, movie }) {
  const [form, setForm] = useState(
    movie || {
      Title: "",
      Description: "",
      Director: "",
      Writers: [],
      Actors: [],
      Year: "",
      Language: [],
      Genre: [],
      Awards: "",
      Types: [],
      Searches: "",
      Image: [],
      Video: "",
      Rating: "",
      Runtime: "",
      ActorImage: [],
    }
  );
  const [loading, setLoading] = useState(false);

  // For single value fields
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // For tag/array fields
  const setTagField = (name, values) => {
    setForm({ ...form, [name]: values });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        Year: Number(form.Year),
        Runtime: Number(form.Runtime),
        Searches: Number(form.Searches),
        Rating: form.Rating,
      };
      if (movie && movie._id) {
        await api.put(`/movies/${movie._id}`, payload);
      } else {
        await api.post("/movies", payload);
      }
      onSuccess();
    } catch (err) {
      console.error("Error saving movie:", err);
      alert("Failed to save movie");
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 p-10 rounded-2xl max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl border border-gray-800 mx-auto"
      style={{ minWidth: 600 }}
    >
      <h3 className="text-3xl font-extrabold mb-6 md:col-span-2 text-center text-red-500 tracking-wide drop-shadow-lg">
        {movie ? "Edit Movie" : "Add New Movie"}
      </h3>
      <input
        name="Title"
        placeholder="Title"
        value={form.Title}
        onChange={handleChange}
        className="p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-600 transition"
        required
      />
      <input
        name="Director"
        placeholder="Director"
        value={form.Director}
        onChange={handleChange}
        className="p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-600 transition"
        required
      />
      <input
        name="Year"
        placeholder="Year"
        value={form.Year}
        onChange={handleChange}
        className="p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-600 transition"
        type="number"
        required
      />
      <input
        name="Rating"
        placeholder="IMDb Rating"
        value={form.Rating}
        onChange={handleChange}
        className="p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-600 transition"
      />
      <input
        name="Runtime"
        placeholder="Runtime (minutes)"
        value={form.Runtime}
        onChange={handleChange}
        className="p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-600 transition"
        type="number"
      />
      <input
        name="Awards"
        placeholder="Awards"
        value={form.Awards}
        onChange={handleChange}
        className="p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-600 transition"
      />
      <input
        name="Searches"
        placeholder="Searches"
        value={form.Searches}
        onChange={handleChange}
        className="p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-600 transition"
        type="number"
      />
      <input
        name="Video"
        placeholder="Video URL"
        value={form.Video}
        onChange={handleChange}
        className="p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-600 transition md:col-span-2"
      />
      <textarea
        name="Description"
        placeholder="Description"
        value={form.Description}
        onChange={handleChange}
        className="p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-red-600 transition md:col-span-2"
        rows={4}
      />
      <TagInput
        label="Writers"
        values={form.Writers}
        setValues={(vals) => setTagField("Writers", vals)}
        placeholder="Add writer..."
      />
      <TagInput
        label="Actors"
        values={form.Actors}
        setValues={(vals) => setTagField("Actors", vals)}
        placeholder="Add actor..."
      />
      <TagInput
        label="Languages"
        values={form.Language}
        setValues={(vals) => setTagField("Language", vals)}
        placeholder="Add language..."
      />
      <TagInput
        label="Genres"
        values={form.Genre}
        setValues={(vals) => setTagField("Genre", vals)}
        placeholder="Add genre..."
      />
      <TagInput
        label="Types"
        values={form.Types}
        setValues={(vals) => setTagField("Types", vals)}
        placeholder="Add type..."
      />
      <TagInput
        label="Image URLs"
        values={form.Image}
        setValues={(vals) => setTagField("Image", vals)}
        placeholder="Add image URL..."
      />
      <TagInput
        label="Actor Image URLs"
        values={form.ActorImage}
        setValues={(vals) => setTagField("ActorImage", vals)}
        placeholder="Add actor image URL..."
      />
      <button
        type="submit"
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold text-lg md:col-span-2 mt-4 shadow-lg transition"
        disabled={loading}
      >
        {loading ? "Saving..." : movie ? "Update Movie" : "Add Movie"}
      </button>
    </form>
  );
}
