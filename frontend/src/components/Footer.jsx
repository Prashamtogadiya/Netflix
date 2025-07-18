import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#141414] text-gray-400 text-sm pt-10 pb-6 px-4 mt-12">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-4 items-start">
        {/* Left: Netflix Logo */}
        <div className="flex flex-col items-start">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
            alt="Netflix"
            className="h-10 w-auto mb-4"
            style={{ background: "transparent" }}
          />
          
        </div>
        <div className="flex flex-col gap-2">
          <a href="#" className="hover:underline">FAQ</a>
          <a href="#" className="hover:underline">Help Centre</a>
          <a href="#" className="hover:underline">Account</a>
          <a href="#" className="hover:underline">Media Centre</a>
        </div>
       
        <div className="flex flex-col gap-2">
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Cookie Preferences</a>
          <a href="#" className="hover:underline">Contact Us</a>
          <button className="border border-gray-600 px-4 py-1 rounded text-gray-300 hover:bg-gray-800 transition mt-2">
            English
          </button>
        </div>
      </div>
      <div className="mt-8 text-center">
        <span className="text-xs text-gray-500 mt-2">
            © {new Date().getFullYear()} Netflix, Inc. Clone by Prasham Togadiya
          </span>
      </div>
    </footer>
  );
}
