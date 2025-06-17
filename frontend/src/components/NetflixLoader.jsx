import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function NetflixLoader({ className = "" }) {
  // Netflix-style animated logo loader
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <DotLottieReact
        className={`w-44 h-44 ${className}`} 
        src="https://lottie.host/1dcdb17f-0a02-4008-9c41-71ce3b35442d/GMaYx6ap7n.lottie"
        loop
        autoplay
      />
    </div>
  );
}
