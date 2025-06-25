import React from "react";
import { useRef } from "react";
export default function ActorCarousel({ movies }) {
  // Collect all actors and their images
  const actorList = [];
  movies.forEach(movie => {
      for (let i = 0; i < Math.min(movie.Actors.length, movie.ActorImage.length); i++) {
        actorList.push({
          name: movie.Actors[i],
          img: movie.ActorImage[i] || "https://placehold.co/120x120?text=No+Image"
        });
      }
  });

  const scrollRef = useRef(null);
  const scrollBy = 136; 

  const handlePrev = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft -= scrollBy;
    }
  };

  const handleNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += scrollBy;
    }
  };

  return (
    <div className="relative px-4">
      {/* Prev Button */}
      <button
        onClick={handlePrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-2 text-xl transition hidden md:block"
        style={{ minWidth: 32 }}
      >
        &#8592;
      </button>
      {/* Next Button */}
      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black text-white rounded-full p-2 text-xl transition hidden md:block"
        style={{ minWidth: 32 }}
      >
        &#8594;
      </button>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 hide-scrollbar"
        style={{
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE/Edge
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
        {actorList.length === 0 && (
          <div className="text-gray-400">No actors found.</div>
        )}
        {actorList.map((actor, idx) => (
          <div
            key={actor.name + idx}
            className="snap-start flex flex-col items-center transition-transform duration-500 ease-in-out cursor-pointer hover:scale-110 min-w-[120px] max-w-[120px]"
          >
            <img
              src={actor.img || "https://placehold.co/120x120?text=No+Image"}
              alt={actor.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-700 shadow mb-2"
            />
            <span className="text-sm text-center font-semibold truncate w-full">{actor.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
