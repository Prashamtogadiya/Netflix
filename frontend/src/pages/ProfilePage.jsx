import React, { useEffect, useState } from 'react';
import api from '../api';
import { useDispatch, useSelector } from 'react-redux';
import { setProfiles, setSelectedProfile } from '../features/profiles/profileSlice';
import CreateProfileForm from '../components/CreateProfileForm';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const profiles = useSelector(state => state.profiles.profiles);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/profiles')
      .then(res => dispatch(setProfiles(res.data)))
      .catch(() => dispatch(setProfiles([])));
  }, [dispatch]);

  const handleProfileSelect = (profile) => {
    dispatch(setSelectedProfile(profile));
    localStorage.setItem('selectedProfile', JSON.stringify(profile));
    navigate('/dashboard');
  };

// Background image URL can be set here if needed
// bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1500&q=80')]
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-gray-900 to-black relative">
      <div className="absolute inset-0 bg-cover bg-center opacity-40"></div>
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-10 text-center drop-shadow-lg">Who's watching?</h2>
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          {profiles.map(profile => (
            <button
              key={profile._id}
              onClick={() => handleProfileSelect(profile)}
              className="flex flex-col items-center group focus:outline-none"
            >
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gray-700 border-4 border-transparent group-hover:border-white overflow-hidden flex items-center justify-center transition-all duration-200 shadow-lg">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl text-white font-bold">{profile.name[0]?.toUpperCase() || "U"}</span>
                )}
              </div>
              <span className="mt-4 text-lg md:text-xl text-gray-200 group-hover:text-white font-semibold transition">{profile.name}</span>
            </button>
          ))}
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex flex-col items-center group focus:outline-none"
            title="Add Profile"
          >
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gray-800 border-4 border-transparent group-hover:border-white flex items-center justify-center transition-all duration-200 shadow-lg">
              <span className="text-5xl text-gray-400 group-hover:text-white font-bold">+</span>
            </div>
            <span className="mt-4 text-lg md:text-xl text-gray-400 group-hover:text-white font-semibold transition">Add Profile</span>
          </button>
        </div>
        {showForm && (
          <div className="w-full max-w-sm mx-auto">
            <CreateProfileForm onCreated={() => setShowForm(false)} />
          </div>
        )}
      </div>
    </div>
  );
}