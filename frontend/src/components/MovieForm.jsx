import React, { useState } from "react";
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

  const handleAutoChange = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
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
      <Autocomplete
        freeSolo
        options={[]}
        value={form.Title}
        onInputChange={(_, value) => handleAutoChange("Title", value)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Title"
            placeholder="Add title..."
            className="bg-gray-800 rounded-lg"
            sx={{
              // Style for the label (floating placeholder text)
              "& label": {
                color: "white", // default label color
              },
              "& label.Mui-focused": {
                color: "skyblue", // label color when input is focused
              },

              // Style for the input text
              "& .MuiInputBase-input": {
                color: "white", // text color inside the input box
              },

              // Style for the outline and its states
              "& .MuiOutlinedInput-root": {
                // Default border style
                "& fieldset": {
                  borderColor: "gray",
                },
                // Border style on hover
                "&:hover fieldset": {
                  borderColor: "lightgray",
                },
                // Border style when input is focused
                "&.Mui-focused fieldset": {
                  borderColor: "skyblue",
                },
              },
            }}
            required
          />
        )}
      />
      <Autocomplete
        freeSolo
        options={[]}
        value={form.Director}
        onInputChange={(_, value) => handleAutoChange("Director", value)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Director"
            placeholder="Add director..."
            className="bg-gray-800 rounded-lg"
            sx={{
              // Style for the label (floating placeholder text)
              "& label": {
                color: "white", // default label color
              },
              "& label.Mui-focused": {
                color: "skyblue", // label color when input is focused
              },

              // Style for the input text
              "& .MuiInputBase-input": {
                color: "white", // text color inside the input box
              },

              // Style for the outline and its states
              "& .MuiOutlinedInput-root": {
                // Default border style
                "& fieldset": {
                  borderColor: "gray",
                },
                // Border style on hover
                "&:hover fieldset": {
                  borderColor: "lightgray",
                },
                // Border style when input is focused
                "&.Mui-focused fieldset": {
                  borderColor: "skyblue",
                },
              },
            }}
            required
          />
        )}
      />
      <Autocomplete
        freeSolo
        options={[]}
        value={form.Year}
        onInputChange={(_, value) => handleAutoChange("Year", value)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Year"
            placeholder="Add year..."
            className="bg-gray-800 rounded-lg"
            type="number"
            sx={{
              // Style for the label (floating placeholder text)
              "& label": {
                color: "white", // default label color
              },
              "& label.Mui-focused": {
                color: "skyblue", // label color when input is focused
              },

              // Style for the input text
              "& .MuiInputBase-input": {
                color: "white", // text color inside the input box
              },

              // Style for the outline and its states
              "& .MuiOutlinedInput-root": {
                // Default border style
                "& fieldset": {
                  borderColor: "gray",
                },
                // Border style on hover
                "&:hover fieldset": {
                  borderColor: "lightgray",
                },
                // Border style when input is focused
                "&.Mui-focused fieldset": {
                  borderColor: "skyblue",
                },
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
          max={5}
          onChange={(_, value) =>
            handleAutoChange("Rating", value?.toString() || "")
          }
          sx={{
            "& .MuiRating-icon": {
              color: "gray",
            },
            "& .MuiRating-iconFilled": {
              color: "gold",
            },
            "& .MuiRating-iconHover": {
              color: "skyblue",
            },
          }}
        />
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

            sx={{
              // Style for the label (floating placeholder text)
              "& label": {
                color: "white", // default label color
              },
              "& label.Mui-focused": {
                color: "skyblue", // label color when input is focused
              },

              // Style for the input text
              "& .MuiInputBase-input": {
                color: "white", // text color inside the input box
              },

              // Style for the outline and its states
              "& .MuiOutlinedInput-root": {
                // Default border style
                "& fieldset": {
                  borderColor: "gray",
                },
                // Border style on hover
                "&:hover fieldset": {
                  borderColor: "lightgray",
                },
                // Border style when input is focused
                "&.Mui-focused fieldset": {
                  borderColor: "skyblue",
                },
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
              // Style for the label (floating placeholder text)
              "& label": {
                color: "white", // default label color
              },
              "& label.Mui-focused": {
                color: "skyblue", // label color when input is focused
              },

              // Style for the input text
              "& .MuiInputBase-input": {
                color: "white", // text color inside the input box
              },

              // Style for the outline and its states
              "& .MuiOutlinedInput-root": {
                // Default border style
                "& fieldset": {
                  borderColor: "gray",
                },
                // Border style on hover
                "&:hover fieldset": {
                  borderColor: "lightgray",
                },
                // Border style when input is focused
                "&.Mui-focused fieldset": {
                  borderColor: "skyblue",
                },
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
              // Style for the label (floating placeholder text)
              "& label": {
                color: "white", // default label color
              },
              "& label.Mui-focused": {
                color: "skyblue", // label color when input is focused
              },

              // Style for the input text
              "& .MuiInputBase-input": {
                color: "white", // text color inside the input box
              },

              // Style for the outline and its states
              "& .MuiOutlinedInput-root": {
                // Default border style
                "& fieldset": {
                  borderColor: "gray",
                },
                // Border style on hover
                "&:hover fieldset": {
                  borderColor: "lightgray",
                },
                // Border style when input is focused
                "&.Mui-focused fieldset": {
                  borderColor: "skyblue",
                },
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
            sx={{
              // Style for the label (floating placeholder text)
              "& label": {
                color: "white", // default label color
              },
              "& label.Mui-focused": {
                color: "skyblue", // label color when input is focused
              },

              // Style for the input text
              "& .MuiInputBase-input": {
                color: "white", // text color inside the input box
              },

              // Style for the outline and its states
              "& .MuiOutlinedInput-root": {
                // Default border style
                "& fieldset": {
                  borderColor: "gray",
                },
                // Border style on hover
                "&:hover fieldset": {
                  borderColor: "lightgray",
                },
                // Border style when input is focused
                "&.Mui-focused fieldset": {
                  borderColor: "skyblue",
                },
              },
            }}
          />
        )}
        className="md:col-span-2"
      />
      <Autocomplete
        freeSolo
        options={[]}
        value={form.Description}
        onInputChange={(_, value) => handleAutoChange("Description", value)}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Description"
            placeholder="Add description..."
            className="bg-gray-800 rounded-lg"
            sx={{
              // Style for the label (floating placeholder text)
              "& label": {
                color: "white", // default label color
              },
              "& label.Mui-focused": {
                color: "skyblue", // label color when input is focused
              },

              // Style for the input text
              "& .MuiInputBase-input": {
                color: "white", // text color inside the input box
              },

              // Style for the outline and its states
              "& .MuiOutlinedInput-root": {
                // Default border style
                "& fieldset": {
                  borderColor: "gray",
                },
                // Border style on hover
                "&:hover fieldset": {
                  borderColor: "lightgray",
                },
                // Border style when input is focused
                "&.Mui-focused fieldset": {
                  borderColor: "skyblue",
                },
              },
            }}
            multiline
            rows={4}
          />
        )}
        className="md:col-span-2"
      />
      <Autocomplete
        multiple
        freeSolo
        options={[]}
        value={form.Writers}
        onChange={(_, value) => handleAutoChange("Writers", value)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option}
              {...getTagProps({ index })}
              sx={{ color: "white", backgroundColor: "#123561" }} // text + background
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
              // Style for the label (floating placeholder text)
              "& label": {
                color: "white", // default label color
              },
              "& label.Mui-focused": {
                color: "skyblue", // label color when input is focused
              },

              // Style for the input text
              "& .MuiInputBase-input": {
                color: "white", // text color inside the input box
              },

              // Style for the outline and its states
              "& .MuiOutlinedInput-root": {
                // Default border style
                "& fieldset": {
                  borderColor: "gray",
                },
                // Border style on hover
                "&:hover fieldset": {
                  borderColor: "lightgray",
                },
                // Border style when input is focused
                "&.Mui-focused fieldset": {
                  borderColor: "skyblue",
                },
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
        value={form.Actors}
        onChange={(_, value) => handleAutoChange("Actors", value)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option}
              {...getTagProps({ index })}
              sx={{ color: "white", backgroundColor: "#123561" }} // text + background
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
            sx={{
              // Style for the label (floating placeholder text)
              "& label": {
                color: "white", // default label color
              },
              "& label.Mui-focused": {
                color: "skyblue", // label color when input is focused
              },

              // Style for the input text
              "& .MuiInputBase-input": {
                color: "white", // text color inside the input box
              },

              // Style for the outline and its states
              "& .MuiOutlinedInput-root": {
                // Default border style
                "& fieldset": {
                  borderColor: "gray",
                },
                // Border style on hover
                "&:hover fieldset": {
                  borderColor: "lightgray",
                },
                // Border style when input is focused
                "&.Mui-focused fieldset": {
                  borderColor: "skyblue",
                },
              },
            }}
          />
        )}
        className="md:col-span-2"
      />
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
        value={form.Language}
        onChange={(_, value) => handleAutoChange("Language", value)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option}
              {...getTagProps({ index })}
              sx={{ color: "white", backgroundColor: "#123561" }} // text + background
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
            sx={{
              // Style for the label (floating placeholder text)
              "& label": {
                color: "white", // default label color
              },
              "& label.Mui-focused": {
                color: "skyblue", // label color when input is focused
              },

              // Style for the input text
              "& .MuiInputBase-input": {
                color: "white", // text color inside the input box
              },

              // Style for the outline and its states
              "& .MuiOutlinedInput-root": {
                // Default border style
                "& fieldset": {
                  borderColor: "gray",
                },
                // Border style on hover
                "&:hover fieldset": {
                  borderColor: "lightgray",
                },
                // Border style when input is focused
                "&.Mui-focused fieldset": {
                  borderColor: "skyblue",
                },
              },
            }}
          />
        )}
        className="md:col-span-2"
      />
      <Autocomplete
        multiple
        freeSolo
        options={[
          "Action",
          "Comedy",
          "Drama",
          "Horror",
          "Sci-Fi",
          "Romance",
          " Thriller",
          "Documentary",
          "Fantasy",
          "Adventure",
          "Crime",
        ]}
        value={form.Genre}
        onChange={(_, value) => handleAutoChange("Genre", value)}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option}
              {...getTagProps({ index })}
              sx={{ color: "white", backgroundColor: "#123561" }} // text + background
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
            sx={{
              // Style for the label (floating placeholder text)
              "& label": {
                color: "white", // default label color
              },
              "& label.Mui-focused": {
                color: "skyblue", // label color when input is focused
              },

              // Style for the input text
              "& .MuiInputBase-input": {
                color: "white", // text color inside the input box
              },

              // Style for the outline and its states
              "& .MuiOutlinedInput-root": {
                // Default border style
                "& fieldset": {
                  borderColor: "gray",
                },
                // Border style on hover
                "&:hover fieldset": {
                  borderColor: "lightgray",
                },
                // Border style when input is focused
                "&.Mui-focused fieldset": {
                  borderColor: "skyblue",
                },
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
              sx={{ color: "white", backgroundColor: "#123561" }} // text + background
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
            sx={{
              // Style for the label (floating placeholder text)
              "& label": {
                color: "white", // default label color
              },
              "& label.Mui-focused": {
                color: "skyblue", // label color when input is focused
              },

              // Style for the input text
              "& .MuiInputBase-input": {
                color: "white", // text color inside the input box
              },

              // Style for the outline and its states
              "& .MuiOutlinedInput-root": {
                // Default border style
                "& fieldset": {
                  borderColor: "gray",
                },
                // Border style on hover
                "&:hover fieldset": {
                  borderColor: "lightgray",
                },
                // Border style when input is focused
                "&.Mui-focused fieldset": {
                  borderColor: "skyblue",
                },
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
              sx={{ color: "white", backgroundColor: "#123561" }} // text + background
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
            sx={{
              // Style for the label (floating placeholder text)
              "& label": {
                color: "white", // default label color
              },
              "& label.Mui-focused": {
                color: "skyblue", // label color when input is focused
              },

              // Style for the input text
              "& .MuiInputBase-input": {
                color: "white", // text color inside the input box
              },

              // Style for the outline and its states
              "& .MuiOutlinedInput-root": {
                // Default border style
                "& fieldset": {
                  borderColor: "gray",
                },
                // Border style on hover
                "&:hover fieldset": {
                  borderColor: "lightgray",
                },
                // Border style when input is focused
                "&.Mui-focused fieldset": {
                  borderColor: "skyblue",
                },
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
              sx={{ color: "white", backgroundColor: "#123561" }} // text + background
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
              // Style for the label (floating placeholder text)
              "& label": {
                color: "white", // default label color
              },
              "& label.Mui-focused": {
                color: "skyblue", // label color when input is focused
              },

              // Style for the input text
              "& .MuiInputBase-input": {
                color: "white", // text color inside the input box
              },

              // Style for the outline and its states
              "& .MuiOutlinedInput-root": {
                // Default border style
                "& fieldset": {
                  borderColor: "gray",
                },
                // Border style on hover
                "&:hover fieldset": {
                  borderColor: "lightgray",
                },
                // Border style when input is focused
                "&.Mui-focused fieldset": {
                  borderColor: "skyblue",
                },
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
