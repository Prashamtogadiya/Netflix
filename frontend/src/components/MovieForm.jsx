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
        Image: Array.isArray(form.Image)
          ? form.Image.map((img) =>
              typeof img === "object" && img !== null && img.inputValue
                ? img.inputValue
                : typeof img === "string"
                ? img
                : ""
            ).filter((img) => img.trim() !== "")
          : [],
        Video: form.Video,
        Runtime: form.Runtime ? Number(form.Runtime) : undefined,
        ActorImage: Array.isArray(form.ActorImage)
          ? form.ActorImage.map((img) =>
              typeof img === "object" && img !== null && img.inputValue
                ? img.inputValue
                : typeof img === "string"
                ? img
                : ""
            ).filter((img) => img.trim() !== "")
          : [],
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
        onChange={(_, value) => handleAutoChange("Actors", value)}
        getOptionLabel={(option) => (typeof option === "string" ? option : (option?.name || ""))}
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
        getOptionLabel={(option) => (typeof option === "string" ? option : (option?.name || ""))}
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
      <Autocomplete
        multiple
        freeSolo
        options={[]}
        value={form.Image}
        onChange={(_, value) => handleAutoChange("Image", value)}
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
            label="Image URLs"
            placeholder="Add image URL..."
            className="bg-gray-800 rounded-lg"
            error={!!errors.Image}
            helperText={errors.Image}
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
        options={[]}
        value={form.ActorImage}
        onChange={(_, value) => handleAutoChange("ActorImage", value)}
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
            label="Actor Image URLs"
            placeholder="Add actor image URL..."
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
        className="md:col-span-2"
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
