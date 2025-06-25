import React, { useState } from "react";
import api from "../api";
import { useDispatch } from "react-redux";
import { setProfiles } from "../features/profiles/profileSlice";
import { useNavigate } from "react-router-dom";
import NetflixLoader from "../components/NetflixLoader";

export default function MakeNewProfile() {
  const [form, setForm] = useState({ name: "", gender: "male", avatarInd: 0 });
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const AVATARS = {
    male: [
      "https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740",
      "https://randomuser.me/api/portraits/men/32.jpg",
      "https://randomuser.me/api/portraits/men/45.jpg",
    ],
    female: [
      "https://img.freepik.com/premium-vector/young-man-avatar-character-due-avatar-man-vector-icon-cartoon-illustration_1186924-4438.jpg?semt=ais_hybrid&w=740",
      "https://randomuser.me/api/portraits/women/44.jpg",
      "https://randomuser.me/api/portraits/women/68.jpg",
    ],
  };

  const handleGenderChange = (e) => {
    setForm({ ...form, gender: e.target.value, avatarInd: 0 });
  };

  const handleAvatarSelect = (ind) => {
    setForm({ ...form, avatarInd: ind });
  };

  const handleNameChange = (e) => {
    setForm({ ...form, name: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const avatar = AVATARS[form.gender][form.avatarInd];
      await Promise.all([
        api.post("/profiles", { name: form.name, avatar }),
      ]);
      const res = await api.get("/profiles");
      dispatch(setProfiles(res.data));
      navigate("/profiles");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create profile");
    }
    setLoading(false);
  };

  if (loading) return <NetflixLoader />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded shadow p-6 w-full max-w-sm flex flex-col items-center"
      >
        <h3 className="text-lg font-bold mb-4">Create New Profile</h3>
        <input
          name="name"
          placeholder="Profile Name"
          value={form.name}
          onChange={handleNameChange}
          className="input mb-4 w-full p-2 rounded border"
          required
        />
        <div className="flex items-center gap-6 mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="male"
              checked={form.gender === "male"}
              onChange={handleGenderChange}
              className="mr-1"
            />
            Male
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="gender"
              value="female"
              checked={form.gender === "female"}
              onChange={handleGenderChange}
              className="mr-1"
            />
            Female
          </label>
        </div>
        <div className="flex gap-4 mb-4">
          {AVATARS[form.gender].map((url, ind) => (
            <img
              key={url}
              src={url}
              alt={`avatar-${ind}`}
              className={`w-16 h-16 rounded-full border-4 cursor-pointer ${
                form.avatarInd === ind ? "border-red-600" : "border-transparent"
              }`}
              onClick={() => handleAvatarSelect(ind)}
            />
          ))}
        </div>
        <button
          type="submit"
          className="bg-red-600 text-white py-2 px-6 rounded w-full font-semibold"
        >
          Create Profile
        </button>
      </form>
    </div>
  );
}
