import React, { useState } from 'react';
import api from '../api';
import { useDispatch } from 'react-redux';
import { setProfiles } from '../features/profiles/profileSlice';

// Define avatar URLs for male and female genders
const AVATARS = {
  male: "https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740",
  female: "https://img.freepik.com/premium-vector/young-man-avatar-character-due-avatar-man-vector-icon-cartoon-illustration_1186924-4438.jpg?semt=ais_hybrid&w=740"
};

// This component renders a form to create a new profile.
// It lets the user enter a name, select a gender, and shows an avatar preview.
export default function CreateProfileForm({ onCreated }) {
  // Local state for the form fields: name and gender
  const [form, setForm] = useState({ name: '', gender: 'male' });
  const dispatch = useDispatch();

  // Handle changes to form fields (name or gender)
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // Set avatar URL based on selected gender
      const avatar = AVATARS[form.gender];
      // Send POST request to backend to create the profile
      await api.post('/profiles', { name: form.name, avatar });
      // Fetch the updated list of profiles from backend
      const res = await api.get('/profiles');
      // Update Redux state with the new profiles list
      dispatch(setProfiles(res.data));
      // If a callback is provided, call it (e.g., to close the form)
      if (onCreated) onCreated();
    } catch (err) {
      // Show error message if profile creation fails
      alert(err.response?.data?.message || 'Failed to create profile');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 bg-white rounded shadow flex flex-col items-center">
      <h3 className="text-lg font-bold mb-2">Create Profile</h3>
      {/* Input for profile name */}
      <input
        name="name"
        placeholder="Profile Name"
        value={form.name}
        onChange={handleChange}
        className="input mb-2 w-full"
        required
      />
      {/* Gender selection radio buttons */}
      <div className="flex items-center gap-4 mb-2">
        <label className="flex items-center">
          <input
            type="radio"
            name="gender"
            value="male"
            checked={form.gender === 'male'}
            onChange={handleChange}
            className="mr-1"
          />
          Male
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="gender"
            value="female"
            checked={form.gender === 'female'}
            onChange={handleChange}
            className="mr-1"
          />
          Female
        </label>
      </div>
      {/* Avatar preview based on selected gender */}
      <div className="mb-4">
        <img
          src={AVATARS[form.gender]}
          alt={form.gender}
          className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
        />
      </div>
      {/* Submit button */}
      <button type="submit" className="btn bg-red-600 text-white py-2 rounded w-full">Create</button>
    </form>
  );
}