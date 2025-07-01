import React, { useState, useEffect } from "react";
import api from "../api";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import { Rating, Typography, Box } from "@mui/material";
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
  const [errors, setErrors] = useState({});
  const [genreOptions, setGenreOptions] = useState([]);
  const [actorOptions, setActorOptions] = useState([]);
  const [movieImages, setMovieImages] = useState([]);
  const [actorImages, setActorImages] = useState([]);

  useEffect(() => {
    api.get("/movies/genres").then((res) => setGenreOptions(res.data || []));
    api.get("/movies/actors").then((res) => setActorOptions(res.data || []));
  }, []);

  // Validation function
  const validate = () => {
    const newErrors = {};
    if (!form.Title || form.Title.trim().length < 2)
      newErrors.Title = "Title is required (min 2 chars)";
    if (!form.Description || form.Description.trim().length < 10)
      newErrors.Description = "Description is required (min 10 chars)";
    if (!form.Director || form.Director.trim().length < 2)
      newErrors.Director = "Director is required (min 2 chars)";
    if (!form.Year || isNaN(form.Year) || form.Year < 1880 || form.Year > new Date().getFullYear() + 1)
      newErrors.Year = "Enter a valid year";
    if (!form.Runtime || isNaN(form.Runtime) || form.Runtime < 1)
      newErrors.Runtime = "Runtime must be a positive number";
    if (!form.Rating || isNaN(form.Rating) || form.Rating < 0 || form.Rating > 10)
      newErrors.Rating = "Rating must be between 0 and 10";
    if (!form.Genre || form.Genre.length === 0)
      newErrors.Genre = "At least one genre is required";
    if (!form.Actors || form.Actors.length === 0)
      newErrors.Actors = "At least one actor is required";
    if (!form.Language || form.Language.length === 0)
      newErrors.Language = "At least one language is required";
    if (!form.Types || form.Types.length === 0)
      newErrors.Types = "At least one type is required";
    if (!form.Image || form.Image.length === 0)
      newErrors.Image = "At least one image URL is required";
    if (!form.Video || !/^https?:\/\/.+/.test(form.Video))
      newErrors.Video = "A valid video URL is required";
    return newErrors;
  };

  // Map names to IDs for submission
  const getIdsFromNames = (selected, options) => {
    return selected.map((sel) => {
      const found = options.find(
        (opt) => opt.name === sel || opt._id === sel
      );
      return found ? found._id : sel;
    });
  };

  // Normalize Autocomplete values for edit mode
  const normalizeValue = (value, options) => {
    if (!Array.isArray(value)) return [];
    return value.map((v) => {
      if (typeof v === "object" && v !== null && v.name) return v.name;
      if (typeof v === "string") return v;
      if (typeof v === "number") return v.toString();
      const found = options.find((opt) => opt._id === v);
      if (found) return found.name;
      return "";
    });
  };

  useEffect(() => {
    if (!movie) {
      setForm((prev) => ({
        ...prev,
        Actors: [],
        Genre: [],
      }));
    }
  }, [movie]);

  const handleAutoChange = (name, value) => {
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: undefined });
  };

  // Handle movie image file selection
  const handleMovieImageChange = (e) => {
    // For update: append new files to existing images (if editing)
    setMovieImages((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  // Handle actor image file selection
  const handleActorImageChange = (e) => {
    setActorImages((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  // Remove a selected movie image before upload
  const handleRemoveMovieImage = (idx) => {
    setMovieImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Remove a selected actor image before upload
  const handleRemoveActorImage = (idx) => {
    setActorImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRemoveExistingMovieImage = (idx) => {
    setForm((prev) => ({
      ...prev,
      Image: prev.Image.filter((_, i) => i !== idx),
    }));
  };

  const handleRemoveExistingActorImage = (idx) => {
    setForm((prev) => ({
      ...prev,
      ActorImage: prev.ActorImage.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 1. Upload movie images if any
      let uploadedMovieImageNames = [];
      if (movieImages && movieImages.length > 0) {
        const formData = new FormData();
        movieImages.forEach((file) => formData.append("images", file));
        const res = await api.post("/movies/upload/movie-images", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedMovieImageNames = res.data.filenames;
      }

      // 2. Upload actor images if any (multiple)
      let uploadedActorImageNames = [];
      if (actorImages && actorImages.length > 0) {
        // Ensure correct order: do not reuse the same File object for multiple actors
        const formData = new FormData();
        actorImages.forEach((file) => formData.append("images", file));
        const res = await api.post("/movies/upload/actor-images", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedActorImageNames = res.data.filenames;
      }

      // Always use empty arrays for Actors/Genre if not present (for new movie)
      const actors = form.Actors && form.Actors.length > 0 ? form.Actors : [];
      const genres = form.Genre && form.Genre.length > 0 ? form.Genre : [];
      const payload = {
        Title: form.Title,
        Description: form.Description,
        Director: form.Director,
        Writers: Array.isArray(form.Writers)
          ? form.Writers.map((w) =>
              typeof w === "object" && w !== null && w.inputValue
                ? w.inputValue
                : typeof w === "string"
                ? w
                : ""
            ).filter((w) => w.trim() !== "")
          : [],
        Actors: getIdsFromNames(actors, actorOptions),
        Year: Number(form.Year),
        Language: Array.isArray(form.Language)
          ? form.Language.map((l) =>
              typeof l === "object" && l !== null && l.inputValue
                ? l.inputValue
                : typeof l === "string"
                ? l
                : ""
            ).filter((l) => l.trim() !== "")
          : [],
        Genre: getIdsFromNames(genres, genreOptions),
        Awards: form.Awards,
        Types: Array.isArray(form.Types)
          ? form.Types.map((t) =>
              typeof t === "object" && t !== null && t.inputValue
                ? t.inputValue
                : typeof t === "string"
                ? t
                : ""
            ).filter((t) => t.trim() !== "")
          : [],
        Rating: form.Rating ? form.Rating.toString() : "",
        Searches: form.Searches ? Number(form.Searches) : undefined,
        // Always send array of image filenames (empty array if none)
        Image: [
          ...(Array.isArray(form.Image) ? form.Image : []),
          ...uploadedMovieImageNames,
        ],
        Video: form.Video,
        Runtime: form.Runtime ? Number(form.Runtime) : undefined,
        // Ensure ActorImage array matches the number of actors
        ActorImage: [
          ...(Array.isArray(form.ActorImage) ? form.ActorImage : []),
          ...uploadedActorImageNames
        ].slice(0, Array.isArray(actors) ? actors.length : 0),
      };
      // Remove empty/undefined fields that backend may reject
      Object.keys(payload).forEach(
        (key) =>
          (payload[key] === undefined ||
            payload[key] === null ||
            (Array.isArray(payload[key]) && payload[key].length === 0)) &&
          delete payload[key]
      );
      if (movie && movie._id) {
        await api.put(`/movies/${movie._id}`, payload);
      } else {
        payload.Actors = payload.Actors || [];
        payload.Genre = payload.Genre || [];
        await api.post("/movies", payload);
      }
      onSuccess();
    } catch (err) {
      console.error("Error saving movie:", err);
      alert(
        err.response?.data?.message ||
          "Failed to save movie. Please check all required fields and try again."
      );
    }
    setLoading(false);
  };

  // Fix for Autocomplete getOptionLabel warnings (always return string)
  const safeGetOptionLabel = (option) => {
    if (typeof option === "string") return option;
    if (typeof option === "number") return option.toString();
    if (option && typeof option === "object" && option.name) return option.name;
    return "";
  };

  // Add new actor if not found in options
  const handleActorsChange = async (_, value) => {
    // Check for new actors (not in actorOptions)
    const newActors = value.filter(
      (v) =>
        typeof v === "string" &&
        !actorOptions.some((a) => a.name === v)
    );
    let updatedActorOptions = [...actorOptions];
    if (newActors.length > 0) {
      try {
        // Add all new actors to backend
        const added = await Promise.all(
          newActors.map((name) =>
            api.post("/movies/actors", { name }).then((res) => res.data)
          )
        );
        updatedActorOptions = [...actorOptions, ...added];
        setActorOptions(updatedActorOptions);
      } catch (err) {
        console.error("Error adding new actors:", err);
        // Optionally show error
      }
    }
    setForm({ ...form, Actors: value });
    setErrors({ ...errors, Actors: undefined });
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
      <Autocomplete
        freeSolo
        options={[]}
        value={typeof form.Title === "number" ? form.Title.toString() : form.Title}
        onInputChange={(_, value) => handleAutoChange("Title", value)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Title"
            placeholder="Add title..."
            className="bg-gray-800 rounded-lg"
            error={!!errors.Title}
            helperText={errors.Title}
            sx={{
              "& label": { color: "white" },
              "& label.Mui-focused": { color: "skyblue" },
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "lightgray" },
                "&.Mui-focused fieldset": { borderColor: "skyblue" },
              },
            }}
            required
          />
        )}
      />
      <Autocomplete
        freeSolo
        options={[]}
        value={typeof form.Director === "number" ? form.Director.toString() : form.Director}
        onInputChange={(_, value) => handleAutoChange("Director", value)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Director"
            placeholder="Add director..."
            className="bg-gray-800 rounded-lg"
            error={!!errors.Director}
            helperText={errors.Director}
            sx={{
              "& label": { color: "white" },
              "& label.Mui-focused": { color: "skyblue" },
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "lightgray" },
                "&.Mui-focused fieldset": { borderColor: "skyblue" },
              },
            }}
            required
          />
        )}
      />
      {/* Writers */}
      <Autocomplete
        multiple
        freeSolo
        options={[]}
        value={Array.isArray(form.Writers) ? form.Writers : []}
        onChange={(_, value) => handleAutoChange("Writers", value)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option}
              {...getTagProps({ index })}
              sx={{ color: "white", backgroundColor: "#123561" }}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Writers"
            placeholder="Add writer..."
            className="bg-gray-800 rounded-lg"
            sx={{
              "& label": { color: "white" },
              "& label.Mui-focused": { color: "skyblue" },
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "lightgray" },
                "&.Mui-focused fieldset": { borderColor: "skyblue" },
              },
            }}
          />
        )}
      />
      {/* Language */}
      <Autocomplete
        multiple
        freeSolo
        options={[
          "English",
          "Spanish",
          "French",
          "German",
          "Chinese",
          "Japanese",
          "Hindi",
          "Korean",
          "Italian",
          "Portuguese",
          "Russian",
        ]}
        value={Array.isArray(form.Language) ? form.Language : []}
        onChange={(_, value) => handleAutoChange("Language", value)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option}
              {...getTagProps({ index })}
              sx={{ color: "white", backgroundColor: "#123561" }}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Languages"
            placeholder="Add language..."
            className="bg-gray-800 rounded-lg"
            error={!!errors.Language}
            helperText={errors.Language}
            sx={{
              "& label": { color: "white" },
              "& label.Mui-focused": { color: "skyblue" },
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "lightgray" },
                "&.Mui-focused fieldset": { borderColor: "skyblue" },
              },
            }}
          />
        )}
      />
      <Autocomplete
        freeSolo
        options={[]}
        value={typeof form.Year === "number" ? form.Year.toString() : form.Year}
        onInputChange={(_, value) => handleAutoChange("Year", value)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Year"
            placeholder="Add year..."
            className="bg-gray-800 rounded-lg"
            type="number"
            error={!!errors.Year}
            helperText={errors.Year}
            sx={{
              "& label": { color: "white" },
              "& label.Mui-focused": { color: "skyblue" },
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "lightgray" },
                "&.Mui-focused fieldset": { borderColor: "skyblue" },
              },
            }}
            required
          />
        )}
      />
      <Box
        className="bg-gray-800 rounded-lg p-3"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          gap: 1,
        }}
      >
        <Typography sx={{ color: "white" }}>IMDb Rating</Typography>
        <Rating
          name="rating"
          value={Number(form.Rating) || 0}
          precision={0.5}
          max={10}
          onChange={(_, value) =>
            handleAutoChange("Rating", value?.toString() || "")
          }
          sx={{
            "& .MuiRating-icon": { color: "gray" },
            "& .MuiRating-iconFilled": { color: "gold" },
            "& .MuiRating-iconHover": { color: "skyblue" },
          }}
        />
        {errors.Rating && (
          <Typography sx={{ color: "red", fontSize: 12 }}>{errors.Rating}</Typography>
        )}
      </Box>
      <Autocomplete
        freeSolo
        options={[]}
        value={form.Runtime}
        onInputChange={(_, value) => handleAutoChange("Runtime", value)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Runtime (minutes)"
            placeholder="Add runtime..."
            className="bg-gray-800 rounded-lg"
            type="number"
            error={!!errors.Runtime}
            helperText={errors.Runtime}
            sx={{
              "& label": { color: "white" },
              "& label.Mui-focused": { color: "skyblue" },
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "lightgray" },
                "&.Mui-focused fieldset": { borderColor: "skyblue" },
              },
            }}
          />
        )}
      />
      <Autocomplete
        freeSolo
        options={[]}
        value={form.Awards}
        onInputChange={(_, value) => handleAutoChange("Awards", value)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Awards"
            placeholder="Add awards..."
            className="bg-gray-800 rounded-lg"
            sx={{
              "& label": { color: "white" },
              "& label.Mui-focused": { color: "skyblue" },
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "lightgray" },
                "&.Mui-focused fieldset": { borderColor: "skyblue" },
              },
            }}
          />
        )}
      />
      <Autocomplete
        freeSolo
        options={[]}
        value={form.Searches}
        onInputChange={(_, value) => handleAutoChange("Searches", value)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Searches"
            placeholder="Add searches..."
            className="bg-gray-800 rounded-lg"
            type="number"
            sx={{
              "& label": { color: "white" },
              "& label.Mui-focused": { color: "skyblue" },
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "lightgray" },
                "&.Mui-focused fieldset": { borderColor: "skyblue" },
              },
            }}
          />
        )}
      />
      <Autocomplete
        freeSolo
        options={[]}
        value={form.Video}
        onInputChange={(_, value) => handleAutoChange("Video", value)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Video URL"
            placeholder="Add video URL..."
            className="bg-gray-800 rounded-lg"
            error={!!errors.Video}
            helperText={errors.Video}
            sx={{
              "& label": { color: "white" },
              "& label.Mui-focused": { color: "skyblue" },
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "lightgray" },
                "&.Mui-focused fieldset": { borderColor: "skyblue" },
              },
            }}
          />
        )}
        className="md:col-span-2"
      />
      <TextField
        variant="outlined"
        label="Description"
        placeholder="Add description..."
        className="bg-gray-800 rounded-lg md:col-span-2"
        error={!!errors.Description}
        helperText={errors.Description}
        sx={{
          "& label": { color: "white" },
          "& label.Mui-focused": { color: "skyblue" },
          "& .MuiInputBase-input": { color: "white" },
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "gray" },
            "&:hover fieldset": { borderColor: "lightgray" },
            "&.Mui-focused fieldset": { borderColor: "skyblue" },
          },
        }}
        multiline
        rows={4}
        value={form.Description}
        onChange={e => handleAutoChange("Description", e.target.value)}
        required
      />
      <Autocomplete
        multiple
        freeSolo
        options={actorOptions.map((a) => a.name)}
        value={normalizeValue(form.Actors, actorOptions)}
        onChange={handleActorsChange}
        getOptionLabel={safeGetOptionLabel}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option}
              {...getTagProps({ index })}
              sx={{ color: "white", backgroundColor: "#123561" }}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Actors"
            placeholder="Add actor..."
            className="bg-gray-800 rounded-lg"
            error={!!errors.Actors}
            helperText={errors.Actors}
            sx={{
              "& label": { color: "white" },
              "& label.Mui-focused": { color: "skyblue" },
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "lightgray" },
                "&.Mui-focused fieldset": { borderColor: "skyblue" },
              },
            }}
          />
        )}
        className="md:col-span-2"
      />
      <Autocomplete
        multiple
        freeSolo
        options={genreOptions.map((g) => g.name)}
        value={normalizeValue(form.Genre, genreOptions)}
        onChange={(_, value) => handleAutoChange("Genre", value)}
        getOptionLabel={safeGetOptionLabel}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option}
              {...getTagProps({ index })}
              sx={{ color: "white", backgroundColor: "#123561" }}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Genres"
            placeholder="Add genre..."
            className="bg-gray-800 rounded-lg"
            error={!!errors.Genre}
            helperText={errors.Genre}
            sx={{
              "& label": { color: "white" },
              "& label.Mui-focused": { color: "skyblue" },
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "lightgray" },
                "&.Mui-focused fieldset": { borderColor: "skyblue" },
              },
            }}
          />
        )}
        className="md:col-span-2"
      />
      <Autocomplete
        multiple
        freeSolo
        options={["Movie", "TV Show", "Documentary", "Series"]}
        value={form.Types}
        onChange={(_, value) => handleAutoChange("Types", value)}
        getOptionLabel={safeGetOptionLabel}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option}
              {...getTagProps({ index })}
              sx={{ color: "white", backgroundColor: "#123561" }}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Types"
            placeholder="Add type..."
            className="bg-gray-800 rounded-lg"
            error={!!errors.Types}
            helperText={errors.Types}
            sx={{
              "& label": { color: "white" },
              "& label.Mui-focused": { color: "skyblue" },
              "& .MuiInputBase-input": { color: "white" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "lightgray" },
                "&.Mui-focused fieldset": { borderColor: "skyblue" },
              },
            }}
          />
        )}
        className="md:col-span-2"
      />
      {/* Movie Images Upload */}
      <div className="md:col-span-2">
        <label className="block text-white font-semibold mb-2">
          Movie Images (upload)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleMovieImageChange}
          className="block w-full text-white bg-gray-800 rounded-lg border border-gray-700 p-2"
        />
        {/* Show previews if any */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {/* Existing images (from DB) */}
          {Array.isArray(form.Image) &&
            form.Image.map((img, idx) => (
              <div key={idx} className="relative">
                <img
                  src={
                    img.startsWith("http")
                      ? img
                      : `http://localhost:5000/uploads/${img}`
                  }
                  alt="movie"
                  className="w-16 h-16 object-cover rounded"
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  onClick={() => handleRemoveExistingMovieImage(idx)}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          {/* New images (to be uploaded) */}
          {movieImages && movieImages.length > 0 &&
            movieImages.map((file, idx) => (
              <div key={idx} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-16 h-16 object-cover rounded"
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  onClick={() => handleRemoveMovieImage(idx)}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
        </div>
      </div>
      {/* Actor Images Upload */}
      <div className="md:col-span-2">
        <label className="block text-white font-semibold mb-2">
          Actor Images (upload)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleActorImageChange}
          className="block w-full text-white bg-gray-800 rounded-lg border border-gray-700 p-2"
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          {/* Existing images (from DB) */}
          {Array.isArray(form.ActorImage) &&
            form.ActorImage.map((img, idx) => (
              <div key={idx} className="relative">
                <img
                  src={
                    img.startsWith("http")
                      ? img
                      : `http://localhost:5000/uploads/${img}`
                  }
                  alt="actor"
                  className="w-16 h-16 object-cover rounded"
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  onClick={() => handleRemoveExistingActorImage(idx)}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          {/* New images (to be uploaded) */}
          {actorImages && actorImages.length > 0 &&
            actorImages.map((file, idx) => (
              <div key={idx} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-16 h-16 object-cover rounded"
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  onClick={() => handleRemoveActorImage(idx)}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
        </div>
      </div>
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
