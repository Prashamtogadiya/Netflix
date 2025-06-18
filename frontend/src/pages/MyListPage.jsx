import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector,useDispatch } from "react-redux";
import api from "../api";
import Navbar from "../components/Navbar";
import MovieCarousel from "../components/MovieCarousel";
import NetflixLoader from "../components/NetflixLoader";
import Footer from "../components/Footer";
import { clearUser } from "../features/user/userSlice";
import { clearProfiles } from "../features/profiles/profileSlice";

export default function MyListPage() {
  const profile = useSelector((state) => state.profiles.selectedProfile);
  const profileURL =
    profile?.avatar || "https://placehold.co/120x120?text=User";
  const [myListMovies, setMyListMovies] = useState([]);
  const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const dispatch = useDispatch();
  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    api
      .get(`/profiles/${profile._id}/mylist`)
      .then((res) => setMyListMovies(res.data.myList || []))
      .catch(() => setMyListMovies([]))
      .finally(() => setLoading(false));
  }, [profile]);

  const handleLogout = async () => {
    await api.post("/auth/logout");
    dispatch(clearUser());
    dispatch(clearProfiles());
    localStorage.removeItem("user");
    localStorage.removeItem("selectedProfile");
    navigate("/login");
  };

  if (!profile) return null;
  if (loading) return <NetflixLoader />;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar
        profile={profile}
        profileURL={profileURL}
        onLogout={handleLogout}
      />
      <div className="pt-24 max-w-7xl mx-auto w-full px-4 flex-1">
        <h2 className="text-3xl font-bold mb-8">My List</h2>
        {myListMovies.length === 0 ? (
          <div className="text-gray-400 text-lg text-center py-16">
            No movies in your list yet.
          </div>
        ) : (
          <MovieCarousel
            movies={myListMovies}
            visibleCount={5}
            cardWidth={340}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
