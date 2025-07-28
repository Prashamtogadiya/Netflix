import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";

export default function Navbar({ profile, profileURL, onLogout }) {
  const [dropdown, setDropdown] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // New state for scroll detection
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleHistory = () => {
    setDropdown(false);
    navigate('/history');
  };

  const handleProfiles = () => {
    setDropdown(false);
    navigate('/profiles');
  };

  const handleLogoutClick = () => {
    setDropdown(false);
    if (onLogout) onLogout();
  };

  useEffect(() => setNavOpen(false), [location.pathname]);
  useEffect(() => setSearchOpen(false), [location.pathname]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Scroll listener for blur effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10); // Trigger blur when scrolled down more than 10px
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll); 
  }, []);

  const safeProfileName = profile?.name || "Profile";
  const safeProfileURL = profileURL || "https://placehold.co/120x120?text=User";
  const navLinks = [
    { label: "Home", href: "/dashboard", show: location.pathname !== "/dashboard" },
    { label: "TV Shows", href: "/tvshows", show: location.pathname !== "/tvshows" },
    { label: "Movies", href: "/movies", show: location.pathname !== "/movies" },
    { label: "My List", href: "/mylist" },
  ];

  return (
    <nav 
      className={`fixed w-full z-30 transition-all duration-300 
        ${isScrolled 
          ? 'bg-black/50 backdrop-blur-md'  // Blurred and semi-transparent on scroll
          : 'bg-gradient-to-b from-black/80 to-transparent'  // Original gradient at top
        }`}
    >
      <div className="flex items-center justify-between px-4 md:px-8 h-16 md:h-20">
        {/* Logo - smaller on desktop */}
        <a href="/" className="flex-shrink-0">
          {/* Use transparent logo for mobile */}
          <img
            src={
              typeof window !== "undefined" && window.innerWidth < 768
                ? "https://static.vecteezy.com/system/resources/previews/020/336/373/non_2x/netflix-logo-netflix-icon-free-free-vector.jpg"
                : "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
            }
            className="h-9 md:h-7 w-auto bg-transparent"
            alt="Netflix"
            style={{ background: "transparent" }}
          />
        </a>

        {/* Desktop nav links - centered */}
        <div className="hidden lg:flex flex-1 justify-center gap-6">
          {navLinks.map(
            (link) =>
              (link.show === undefined || link.show) && (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative text-white font-medium text-base tracking-wide px-2 pb-0.5
                    after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-red-500
                    after:scale-x-0 after:transition-transform after:duration-300 after:origin-left
                    hover:after:scale-x-100 focus:after:scale-x-100"
                  style={{ borderBottom: "none" }}
                >
                  {link.label}
                </a>
              )
          )}
        </div>

        {/* Desktop: right side */}
        <div className="hidden lg:flex items-center gap-5 flex-shrink-0 ml-4">
          {/* SearchBar visible on desktop */}
          <div>
            <SearchBar />
          </div>
          {/* Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="rounded-full border-2 border-transparent hover:border-white transition p-0"
              aria-label="Open profile menu"
              onClick={() => setDropdown((d) => !d)}
            >
              <img
                src={safeProfileURL}
                alt="profile"
                className="rounded-full h-10 w-10 object-cover"
              />
            </button>
            {/* Dropdown */}
            {dropdown && (
              <div
                className="absolute right-0 top-12 w-44 bg-gray-900 rounded-lg shadow-xl border border-gray-800 z-30"
                onMouseLeave={() => setDropdown(false)}
              >
                <div className="flex flex-col">
                  <a
                    href="/profiles"
                    className="px-4 py-3 hover:bg-gray-800 text-white text-left transition"
                    onClick={handleProfiles}
                  >
                    Profiles
                  </a>
                  <a
                    href="/history"
                    onClick={handleHistory}
                    className="px-4 py-3 hover:bg-gray-800 text-white text-left transition"
                  >
                    History
                  </a>
                  <hr className="my-1 border-gray-800" />
                  <button
                    onClick={handleLogoutClick}
                    className="px-4 py-3 text-left text-white transition hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Name on desktop */}
          <span className="font-medium text-white/90 ml-1">{safeProfileName}</span>
        </div>

        {/* --- MOBILE NAV --- */}
        <div className="flex lg:hidden items-center gap-1 relative h-12">
          {/* Mobile search, always present in icon form, expand inline */}
          <div className="flex items-center relative h-12 z-40">
            <button
              aria-label="Open Search"
              className={`text-white hover:text-red-500 p-2 rounded-full transition z-20 ${searchOpen ? "invisible" : "visible"}`}
              onClick={() => setSearchOpen(true)}
              style={{ transition: "visibility 0.2s linear" }}
            >
              {/* Magnifying glass SVG */}
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
                viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            {/* Actual search bar, overlays only on mobile when open; pinned at icon row height */}
            <div
              className={`
                absolute right-0 top-1/2 -translate-y-1/2 flex items-center z-30
                bg-gray-900 rounded shadow-lg border border-gray-800
                transition-all duration-200
                ${searchOpen ? "w-56 px-2 py-1 opacity-100 visible" : "w-0 px-0 py-0 opacity-0 invisible"}
                overflow-visible
              `}
              style={{ boxSizing: "border-box" }}
              onMouseDown={e => e.stopPropagation()}
            >
              <SearchBar
                inputRef={searchInputRef}
                autoFocus={searchOpen}
                wrapperClassName="w-full"
                inputClassName="w-full bg-transparent border-0 text-white focus:outline-none px-2 py-1"
                onBlur={() => setSearchOpen(false)}
                alwaysShowDropdown={true} // <-- ensure dropdown always shows when typing
              />
              <button
                aria-label="Close Search"
                className="ml-1 text-gray-400 hover:text-gray-200"
                tabIndex={-1}
                onMouseDown={e => {
                  e.preventDefault();
                  setSearchOpen(false);
                }}
              >
                {/* X icon */}
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="5" x2="15" y2="15" />
                  <line x1="5" y1="15" x2="15" y2="5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Hamburger drawer icon: always visible, not affected by search */}
          <button
            className="flex items-center justify-center w-10 h-10 text-white relative z-10"
            aria-label="Menu"
            onClick={() => setNavOpen(!navOpen)}
          >
            <span className="sr-only">Open menu</span>
            <svg
              className={`w-7 h-7 transition-transform duration-200 ${navOpen ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              {navOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* User profile always visible */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="rounded-full border-2 border-transparent hover:border-white transition p-0"
              aria-label="Open profile menu"
              onClick={() => setDropdown((d) => !d)}
            >
              <img
                src={safeProfileURL}
                alt="profile"
                className="rounded-full h-9 w-9 object-cover"
              />
            </button>
            {/* Dropdown */}
            {dropdown && (
              <div
                className="absolute right-0 top-12 w-44 bg-gray-900 rounded-lg shadow-xl border border-gray-800 z-30"
                tabIndex={-1}
                onMouseLeave={() => setDropdown(false)}
              >
                <div className="flex flex-col">
                  <a
                    href="/profiles"
                    className="px-4 py-3 hover:bg-gray-800 text-white text-left transition"
                    onClick={() => setDropdown(false)}
                  >
                    My Profile
                  </a>
                  <a
                    href="/profiles"
                    className="px-4 py-3 hover:bg-gray-800 text-white text-left transition"
                  >
                    Profiles
                  </a>
                  <hr className="my-1 border-gray-800" />
                  <button
                    onClick={() => {
                      setDropdown(false);
                      onLogout && onLogout();
                    }}
                    className="px-4 py-3 text-left text-white transition hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE NAV DRAWER */}
      <div
        className={`fixed inset-0 z-20 lg:hidden transition bg-black/60 ${
          navOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{
          pointerEvents: navOpen ? "auto" : "none",
        }}
        onClick={() => setNavOpen(false)}
      >
        {/* Drawer panel */}
        <div
          className={`absolute top-0 left-0 h-full w-2/3 max-w-xs bg-gradient-to-b from-neutral-950 to-gray-900 shadow-2xl transform transition-all duration-300 ${
            navOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-col p-7 gap-6 pt-24">
            {navLinks.map(
              link =>
                (link.show === undefined || link.show) && (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-white text-lg font-semibold tracking-wide hover:text-red-500 transition pb-1 border-b border-transparent hover:border-red-500"
                  >
                    {link.label}
                  </a>
                )
            )}
            <hr className="my-2 border-gray-700" />
            <button
              className="text-white font-semibold px-2 py-2 text-left hover:text-red-500 transition"
              onClick={() => {
                setNavOpen(false);
                onLogout && onLogout();
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
