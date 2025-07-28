import React, { useState, useEffect } from "react";
import api from "../api";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import { Rating, Typography, Box } from "@mui/material";

// Text input field with label and error display
function FormTextField({
  label,
  value,
  onChange,
  error,
  helperText,
  ...props
}) {
  // Renders a basic text field with error handling

  return (
    <TextField
      variant="outlined"
      label={label}
      value={value}
      onChange={onChange}
      error={!!error}
      helperText={helperText}
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
      {...props}
    />
  );
}

// Multi-value autocomplete (for example: picking genres, actors, etc)
function FormMultiAutocomplete({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
}) {
  // Shows a list of options that the user can select multiple from

  return (
    <Autocomplete
      multiple
      freeSolo
      options={options}
      value={value}
      onChange={onChange}
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
          label={label}
          error={!!error}
          helperText={helperText}
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
  );
}

// Single-value autocomplete (for example: picking one director)
function FormSingleAutocomplete({
  label,
  value,
  onChange,
  error,
  helperText,
  ...props
}) {
  // Shows a list of options to select one item

  return (
    <Autocomplete
      freeSolo
      options={[]}
      value={value}
      onInputChange={(_, v) => onChange(v)}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label={label}
          error={!!error}
          helperText={helperText}
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
          {...props}
        />
      )}
    />
  );
}

// Image upload field for uploading images
function ImageUploadField({
  label,
  images,
  onChange,
  onRemove,
  existingImages,
  onRemoveExisting,
}) {
  // Shows preview of uploaded (or to-be-uploaded) images,
  // plus lets user remove individual images
  return (
    <div className="md:col-span-2">
      <label className="block text-white font-semibold mb-2">{label}</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={onChange}
        className="block w-full text-white bg-gray-800 rounded-lg border border-gray-700 p-2"
      />
      <div className="flex gap-2 mt-2 flex-wrap">
        {/* Existing images */}
        {Array.isArray(existingImages) &&
          existingImages.map((img, idx) => (
            <div key={idx} className="relative">
              <img
                src={
                  img.startsWith("http")
                    ? img
                    : `http://localhost:5000/uploads/${img}`
                }
                alt={label}
                className="w-16 h-16 object-cover rounded"
              />
              <button
                type="button"
                className="absolute top-0 right-0 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                onClick={() => onRemoveExisting(idx)}
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        {/* New images */}
        {images &&
          images.length > 0 &&
          images.map((file, idx) => (
            <div key={idx} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="w-16 h-16 object-cover rounded"
              />
              <button
                type="button"
                className="absolute top-0 right-0 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                onClick={() => onRemove(idx)}
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function MovieForm({ onSuccess, movie }) {
  // Form state for each movie field (title, description, etc)
  // If editing, start with the movie's data; otherwise, use blanks
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
  // Loading and error state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  // Options for genres and actors (fetched from backend)
  const [genreOptions, setGenreOptions] = useState([]);
  const [actorOptions, setActorOptions] = useState([]);
  // Local state for new images to upload
  const [movieImages, setMovieImages] = useState([]);
  const [actorImages, setActorImages] = useState([]);

  // Fetch genres and actors from backend when component mounts
  useEffect(() => {
    api.get("/movies/genres").then((res) => setGenreOptions(res.data || []));
    api.get("/movies/actors").then((res) => setActorOptions(res.data || []));
  }, []);

  // Validate form fields before submitting
  const validate = () => {
    const newErrors = {};
    // Check title has at least 2 characters

    if (!form.Title || form.Title.trim().length < 2)
      newErrors.Title = "Title is required (min 2 chars)";
    // Check description is long enough

    if (!form.Description || form.Description.trim().length < 10)
      newErrors.Description = "Description is required (min 10 chars)";
    // Check director name

    if (!form.Director || form.Director.trim().length < 2)
      newErrors.Director = "Director is required (min 2 chars)";
    // Check that year is valid

    if (
      !form.Year ||
      isNaN(form.Year) ||
      form.Year < 1880 ||
      form.Year > new Date().getFullYear() + 1
    )
      newErrors.Year = "Enter a valid year";
    // Check runtime is positive number

    if (!form.Runtime || isNaN(form.Runtime) || form.Runtime < 1)
      newErrors.Runtime = "Runtime must be a positive number";
    // Check rating in the 0-10 range

    if (
      !form.Rating ||
      isNaN(form.Rating) ||
      form.Rating < 0 ||
      form.Rating > 10
    )
      newErrors.Rating = "Rating must be between 0 and 10";
    // At least one genre

    if (!form.Genre || form.Genre.length === 0)
      newErrors.Genre = "At least one genre is required";
    // At least one actor

    if (!form.Actors || form.Actors.length === 0)
      newErrors.Actors = "At least one actor is required";
    // At least one language

    if (!form.Language || form.Language.length === 0)
      newErrors.Language = "At least one language is required";
    // At least one type

    if (!form.Types || form.Types.length === 0)
      newErrors.Types = "At least one type is required";
    // Must have at least one image (either existing or new)

    if (
      (!form.Image || form.Image.length === 0) &&
      (!movieImages || movieImages.length === 0)
    ) {
      newErrors.Image = "At least one image URL is required";
    }
    // Video must be a valid url

    if (!form.Video || !/^https?:\/\/.+/.test(form.Video))
      newErrors.Video = "A valid video URL is required";
    return newErrors;
  };

  // Helper to turn selected names into IDs for backend
  const getIdsFromNames = (selected, options) => {
    return selected.map((sel) => {
      const found = options.find((opt) => opt.name === sel || opt._id === sel);
      return found ? found._id : sel;
    });
  };

  // Helper to display selected autocomplete values as names (not objects or IDs)
  const normalizeValue = (value, options) => {
    // value: the array of selected items (could be strings, objects, or IDs)
    // options: the list of all possible options (e.g., all actors or genres from the backend)

    if (!Array.isArray(value)) return [];
    // If value is not an array, return an empty array (safety check).

    return value.map((v) => {
      // For each item in the value array:
      if (typeof v === "object" && v !== null && v.name)
        // If v is an object and has a 'name' property (e.g., { _id: "...", name: "Action" })
        return v.name; // Return the name string (e.g., "Action")

      if (typeof v === "string")
        // If v is already a string (e.g., "Action")
        return v; // Return it as is

      if (typeof v === "number")
        // If v is a number (e.g., 123)
        return v.toString(); // Convert to string

      // If v is something else (like an ID), try to find the matching option in options
      const found = options.find((opt) => opt._id === v);
      if (found) return found.name; // If found, return its name

      return ""; // If nothing matches, return an empty string
    });
  };

  // When not editing a movie, start with empty actors and genre
  useEffect(() => {
    if (!movie) {
      setForm((prev) => ({
        ...prev,
        Actors: [],
        Genre: [],
      }));
    }
  }, [movie]);

  // Handle changes in Autocomplete and TextField inputs
  const handleAutoChange = (name, value) => {
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: undefined });
  };

  // Handle selection of new movie images (before upload)
  const handleMovieImageChange = (e) => {
    setMovieImages((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  // Handle selection of new actor images (before upload)
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

  // Remove a movie image that is already uploaded (editing)
  const handleRemoveExistingMovieImage = (idx) => {
    setForm((prev) => ({
      ...prev,
      Image: prev.Image.filter((_, i) => i !== idx),
    }));
  };

  // Remove an actor image that is already uploaded (editing)
  const handleRemoveExistingActorImage = (idx) => {
    setForm((prev) => ({
      ...prev,
      ActorImage: prev.ActorImage.filter((_, i) => i !== idx),
    }));
  };

  // Handle form submission for add or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submit triggered");
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      console.log("Validation errors:", validationErrors);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Upload new movie images if any
      let uploadedMovieImageNames = [];
      if (movieImages && movieImages.length > 0) {
        const formData = new FormData();
        movieImages.forEach((file) => {
          if (file && file instanceof File) formData.append("images", file);
        });
        console.log("Files to upload (movieImages):", movieImages);
        if (formData.getAll("images").length > 0) {
          try {
            const res = await api.post(
              "/movies/upload/movie-images",
              formData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              }
            );
            uploadedMovieImageNames = res.data.filenames;
            console.log("Uploaded movie image names:", uploadedMovieImageNames);
          } catch (uploadErr) {
            console.error("Movie image upload failed:", uploadErr);
            alert("Movie image upload failed. Check console.");
            setLoading(false);
            return;
          }
        } else {
          console.log("No files appended to FormData for movie images.");
        }
      } else {
        console.log("No movieImages selected.");
      }

      // Upload new actor images if any
      let uploadedActorImageNames = [];
      if (actorImages && actorImages.length > 0) {
        const formData = new FormData();
        actorImages.forEach((file) => {
          if (file && file instanceof File) formData.append("images", file);
        });
        console.log("Files to upload (actorImages):", actorImages);
        if (formData.getAll("images").length > 0) {
          try {
            const res = await api.post(
              "/movies/upload/actor-images",
              formData,
              {
                headers: { "Content-Type": "multipart/form-data" },
              }
            );
            uploadedActorImageNames = res.data.filenames;
            console.log("Uploaded actor image names:", uploadedActorImageNames);
          } catch (uploadErr) {
            console.error("Actor image upload failed:", uploadErr);
            alert("Actor image upload failed. Check console.");
            setLoading(false);
            return;
          }
        } else {
          console.log("No files appended to FormData for actor images.");
        }
      } else {
        console.log("No actorImages selected.");
      }

      // Prepare payload for backend
      const actors = form.Actors && form.Actors.length > 0 ? form.Actors : [];
      const genres = form.Genre && form.Genre.length > 0 ? form.Genre : [];
      const isEdit = !!(movie && movie._id);

      // For add: use only new uploads, for edit: merge with existing
      const finalImages = isEdit
        ? [
            ...(Array.isArray(form.Image) ? form.Image : []),
            ...uploadedMovieImageNames,
          ]
        : uploadedMovieImageNames;
      const filteredImages = finalImages.filter(
        (img) => !!img && typeof img === "string"
      );

      const finalActorImages = isEdit
        ? [
            ...(Array.isArray(form.ActorImage) ? form.ActorImage : []),
            ...uploadedActorImageNames,
          ]
        : uploadedActorImageNames;
      const filteredActorImages = finalActorImages.filter(
        (img) => !!img && typeof img === "string"
      );

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
        Image: filteredImages,
        Video: form.Video,
        Runtime: form.Runtime ? Number(form.Runtime) : undefined,
        ActorImage: filteredActorImages.slice(
          0,
          Array.isArray(actors) ? actors.length : 0
        ),
      };

      console.log("Final payload", payload);

      // Remove only undefined/null fields, but keep empty arrays for images
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === null) {
          delete payload[key];
        }
      });

      // Require at least one image for add or update
      if (!payload.Image || payload.Image.length === 0) {
        alert("Please upload at least one movie image.");
        setLoading(false);
        return;
      }

      // For add, ensure Actors and Genre are arrays (not undefined)
      if (!isEdit) {
        payload.Actors = Array.isArray(payload.Actors) ? payload.Actors : [];
        payload.Genre = Array.isArray(payload.Genre) ? payload.Genre : [];
      }

      let response;
      if (isEdit) {
        response = await api.put("/movies/" + movie._id, payload);
      } else {
        response = await api.post("/movies", payload);
      }
      console.log("Backend response:", response);
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(response.data?.message || "Failed to save movie");
      }
      // If backend returns movie object, check for _id
      if (
        !response.data ||
        (!response.data._id && !response.data.movie && !response.data.success)
      ) {
        alert(
          "Movie was not added. Backend did not return a valid movie object."
        );
        setLoading(false);
        return;
      }
      onSuccess();
    } catch (err) {
      console.error("Movie save error:", err);
      alert(
        err.response?.data?.message ||
          err.message ||
          "Failed to save movie. Please check all required fields and try again."
      );
    }
    setLoading(false);
  };

  // Add new actor to backend if not found in options
  const handleActorsChange = async (_, value) => {
    const newActors = value.filter(
      (v) => typeof v === "string" && !actorOptions.some((a) => a.name === v)
    );
    let updatedActorOptions = [...actorOptions];
    if (newActors.length > 0) {
      try {
        const added = await Promise.all(
          newActors.map((name) =>
            api.post("/movies/actors", { name }).then((res) => res.data)
          )
        );
        updatedActorOptions = [...actorOptions, ...added];
        setActorOptions(updatedActorOptions);
      } catch (err) {
        console.error("Error adding new actors:", err);
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
      <FormSingleAutocomplete
        label="Title"
        value={form.Title}
        onChange={(v) => handleAutoChange("Title", v)}
        error={errors.Title}
        helperText={errors.Title}
        required
      />
      <FormSingleAutocomplete
        label="Director"
        value={form.Director}
        onChange={(v) => handleAutoChange("Director", v)}
        error={errors.Director}
        helperText={errors.Director}
        required
      />
      <FormMultiAutocomplete
        label="Writers"
        options={[]}
        value={Array.isArray(form.Writers) ? form.Writers : []}
        onChange={(_, v) => handleAutoChange("Writers", v)}
      />
      <FormMultiAutocomplete
        label="Languages"
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
        onChange={(_, v) => handleAutoChange("Language", v)}
        error={errors.Language}
        helperText={errors.Language}
      />
      <FormSingleAutocomplete
        label="Year"
        value={form.Year}
        onChange={(v) => handleAutoChange("Year", v)}
        error={errors.Year}
        helperText={errors.Year}
        type="number"
        required
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
          <Typography sx={{ color: "red", fontSize: 12 }}>
            {errors.Rating}
          </Typography>
        )}
      </Box>
      <FormSingleAutocomplete
        label="Runtime (minutes)"
        value={form.Runtime}
        onChange={(v) => handleAutoChange("Runtime", v)}
        error={errors.Runtime}
        helperText={errors.Runtime}
        type="number"
      />
      <FormSingleAutocomplete
        label="Awards"
        value={form.Awards}
        onChange={(v) => handleAutoChange("Awards", v)}
      />
      <FormSingleAutocomplete
        label="Searches"
        value={form.Searches}
        onChange={(v) => handleAutoChange("Searches", v)}
        type="number"
      />
      <FormSingleAutocomplete
        label="Video URL"
        value={form.Video}
        onChange={(v) => handleAutoChange("Video", v)}
        error={errors.Video}
        helperText={errors.Video}
      />
      <FormTextField
        label="Description"
        value={form.Description}
        onChange={(e) => handleAutoChange("Description", e.target.value)}
        error={errors.Description}
        helperText={errors.Description}
        multiline
        rows={4}
        required
        className="md:col-span-2"
      />
      <FormMultiAutocomplete
        label="Actors"
        options={actorOptions.map((a) => a.name)}
        value={normalizeValue(form.Actors, actorOptions)}
        onChange={handleActorsChange}
        error={errors.Actors}
        helperText={errors.Actors}
      />
      <FormMultiAutocomplete
        label="Genres"
        options={genreOptions.map((g) => g.name)}
        value={normalizeValue(form.Genre, genreOptions)}
        onChange={(_, v) => handleAutoChange("Genre", v)}
        error={errors.Genre}
        helperText={errors.Genre}
      />
      <FormMultiAutocomplete
        label="Types"
        options={["Movie", "TV Show", "Documentary", "Series"]}
        value={form.Types}
        onChange={(_, v) => handleAutoChange("Types", v)}
        error={errors.Types}
        helperText={errors.Types}
      />
      <ImageUploadField
        label="Movie Images (upload)"
        images={movieImages}
        onChange={handleMovieImageChange}
        onRemove={handleRemoveMovieImage}
        existingImages={form.Image}
        onRemoveExisting={handleRemoveExistingMovieImage}
      />
      <ImageUploadField
        label="Actor Images (upload)"
        images={actorImages}
        onChange={handleActorImageChange}
        onRemove={handleRemoveActorImage}
        existingImages={form.ActorImage}
        onRemoveExisting={handleRemoveExistingActorImage}
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
