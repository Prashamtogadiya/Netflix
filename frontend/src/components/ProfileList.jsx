import React from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedProfile } from '../features/profiles/profileSlice';

export default function ProfileList({ profiles }) {
  const dispatch = useDispatch();

  const handleSelect = (profile) => {
    dispatch(setSelectedProfile(profile));
    // Navigate to movies or dashboard page if needed
  };

  return (
    <div className="flex flex-wrap gap-4">
      {profiles.map(profile => (
        <button
          key={profile._id}
          onClick={() => handleSelect(profile)}
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          {profile.name}
        </button>
      ))}
    </div>
  );
}