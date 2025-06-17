import React, { useState } from 'react';
import api from '../api';
import { useDispatch } from 'react-redux';
import { setUser } from '../features/user/userSlice';
import { useNavigate } from 'react-router-dom';
import NetflixLoader from "../components/NetflixLoader";

export default function SignupPage() {
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
  e.preventDefault();
  setLoading(true);
  const MIN_LOADING_TIME = 1000;
  const start = Date.now();

  try {
    const res = await api.post('/auth/signup', form);
    dispatch(setUser({ userId: res.data.userId, email: form.email }));
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);
    setTimeout(() => navigate('/profiles'), remaining);
  } catch (err) {
    alert(err.response?.data?.message || 'Signup failed');
    setLoading(false);
  }
};


  if (loading) return <NetflixLoader />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f562aaf4-5dbb-4603-a32b-6ef6c2230136/dh0w8qv-9d8ee6b2-b41a-4681-ab9b-8a227560dc75.jpg/v1/fill/w_1192,h_670,q_70,strp/the_netflix_login_background__canada__2024___by_logofeveryt_dh0w8qv-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NzIwIiwicGF0aCI6IlwvZlwvZjU2MmFhZjQtNWRiYi00NjAzLWEzMmItNmVmNmMyMjMwMTM2XC9kaDB3OHF2LTlkOGVlNmIyLWI0MWEtNDY4MS1hYjliLThhMjI3NTYwZGM3NS5qcGciLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.LOYKSxIDqfPwWHR0SSJ-ugGQ6bECF0yO6Cmc0F26CQs')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black opacity-70 z-0"></div>
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-black bg-opacity-80 px-8 py-10 rounded-md shadow-lg">
          <h1 className="text-4xl font-extrabold text-red-600 mb-2 text-center tracking-wide">Netflix</h1>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign Up</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="p-3 rounded bg-[#333] text-white placeholder-gray-400 focus:outline-none"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="p-3 rounded bg-[#333] text-white placeholder-gray-400 focus:outline-none"
              required
            />
            <input
              name="name"
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="p-3 rounded bg-[#333] text-white placeholder-gray-400 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded mt-2 transition"
            >
              Sign Up
            </button>
          </form>
          <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" /> Remember me
            </label>
            <a href="#" className="hover:underline">Need help?</a>
          </div>
          <div className="mt-8 text-gray-400 text-center">
            Already have an account?{' '}
            <a href="/login" className="text-white hover:underline">
              Login now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}