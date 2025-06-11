import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../features/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { clearProfiles } from '../features/profiles/profileSlice';
import api from '../api';

export default function DashboardPage() {
  const profile = useSelector(state => state.profiles.selectedProfile);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await api.post('/auth/logout');
    dispatch(clearUser());
    dispatch(clearProfiles());
    navigate('/login');
  };

  if (!profile) return null;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Welcome, {profile.name}!</h1>
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded mt-4"
      >
        Log Out
      </button>
    </div>
  );
}