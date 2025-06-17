import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#141414] text-gray-400 text-sm pt-10 pb-6 px-4 mt-12">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <div className="flex flex-wrap gap-6">
          <a href="#" className="hover:underline">FAQ</a>
          <a href="#" className="hover:underline">Help Centre</a>
          <a href="#" className="hover:underline">Account</a>
          <a href="#" className="hover:underline">Media Centre</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Cookie Preferences</a>
          <a href="#" className="hover:underline">Corporate Information</a>
          <a href="#" className="hover:underline">Contact Us</a>
          <a href="#" className="hover:underline">Speed Test</a>
          <a href="#" className="hover:underline">Legal Notices</a>
          <a href="#" className="hover:underline">Only on Netflix</a>
        </div>
        <div>
          <button className="border border-gray-600 px-4 py-1 rounded text-gray-300 hover:bg-gray-800 transition">
            English
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          © {new Date().getFullYear()} Netflix, Inc. Clone by Prasham Togadiya
        </div>
      </div>
    </footer>
  );
}
