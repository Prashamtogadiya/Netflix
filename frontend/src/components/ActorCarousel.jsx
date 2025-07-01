import React from "react";
import { useRef } from "react";

// Helper to get actor image by actor index in movie
function getActorImage(movie, actorIdx) {
  if (Array.isArray(movie.ActorImage) && movie.ActorImage.length > actorIdx) {
    const img = movie.ActorImage[actorIdx];
    if (img && img.startsWith("http")) return img;
    if (img) return `http://localhost:5000/uploads/${img}`;
  }
  return "https://placehold.co/120x180?text=No+Image";
}

// Displays a horizontal scrollable carousel of actors with their images.
// Used to showcase actors from the provided movies array.
export default function ActorCarousel({ movies }) {
  // Defensive: Ensure movies is always an array
  const safeMovies = Array.isArray(movies) ? movies : [];

  // Collect unique actors and their images from all movies
  const actorMap = {};
  safeMovies.forEach(movie => {
    if (Array.isArray(movie.Actors)) {
      movie.Actors.forEach((actor, idx) => {
        const actorId = actor._id || actor;
        if (!actorMap[actorId]) {
          actorMap[actorId] = {
            name: actor.name || actor,
            image: getActorImage(movie, idx),
          };
        }
      });
    }
  });
  const actors = Object.values(actorMap);

  // Reference to the scrollable container
  const scrollRef = useRef(null);
  // Amount of pixels to scroll when clicking arrows
  const scrollBy = 136;

  // Scrolls the carousel left
  const handlePrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= scrollBy;
    }
  };

  // Scrolls the carousel right
  const handleNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += scrollBy;
    }
  };

  if (actors.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">No actors found.</div>
    );
  }

  return (
    <div className="relative px-4">
      {/* Left arrow button for scrolling left */}
      <button
        onClick={handlePrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-2 text-xl transition hidden md:block"
        style={{ minWidth: 32 }}
      >
        &#8592;
      </button>
      {/* Right arrow button for scrolling right */}
      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-2 text-xl transition hidden md:block"
        style={{ minWidth: 32 }}
      >
        &#8594;
      </button>
      {/* The scrollable row of actor cards */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 hide-scrollbar"
        style={{
          scrollbarWidth: "none", // Hide scrollbar in Firefox
          msOverflowStyle: "none", // Hide scrollbar in IE/Edge
        }}
      >
        {/* Hide scrollbar for Chrome, Safari, Opera */}
        <style>
          {`
            .hide-scrollbar::-webkit-scrollbar {
              display: none !important;
            }
          `}
        </style>
        {/* If no actors, show a message */}
        {actors.length === 0 && (
          <div className="text-gray-400">No actors found.</div>
        )}
        {/* Render each actor as a card with image and name */}
        {actors.map((actor, idx) => (
          <div
            key={idx}
            className="snap-start flex flex-col  items-center transition-transform duration-500 ease-in-out cursor-pointer hover:scale-110 min-w-[120px] max-w-[120px]"
          >
            <img
              src={actor.image}
              alt={actor.name}
              className="w-30 h-30 object-cover rounded-[50%] shadow-lg border-2 border-gray-800 bg-gray-900 mb-2"
            />
            <span className="mt-2 text-white text-center font-semibold truncate w-full">{actor.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
