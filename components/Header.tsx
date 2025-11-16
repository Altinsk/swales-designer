"use client";

// Import React hooks, Link, and usePathname
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserCircle, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// --- 1. NavLinks Component (Unchanged) ---

interface NavLinksProps {
  pathName: string;
  mapRoutes: string[];
  mobile?: boolean;
}

const NavLinks: React.FC<NavLinksProps> = ({
  pathName,
  mapRoutes,
  mobile = false,
}) => {
  const baseClass = mobile
    ? "block px-3 py-2 rounded-md text-base font-medium"
    : "px-4 py-2 rounded-md text-sm font-medium transition-colors";

  const activeClass = "bg-green-100";
  const inactiveClass = "text-black hover:bg-gray-100 hover:text-gray-900";

  return (
    <>
      <Link
        style={{ marginRight: "0px" }}
        href="https://www.swales.app/use-case"
        className={`${baseClass} ${
          pathName === "/use-case" ? activeClass : inactiveClass
        }`}
      >
        How it works
      </Link>
      <Link
        style={{ marginRight: "0px" }}
        href="https://www.swales.app/weather-forecast-map"
        target="_blank"
        className={`${baseClass} ${
          mapRoutes.some((route) => pathName.includes(route))
            ? activeClass
            : inactiveClass
        }`}
        aria-current="page"
      >
        Services
      </Link>
      <Link
        style={{ marginRight: "0px" }}
        href="/"
        className={`${baseClass} ${activeClass}`}
      >
        Designer
      </Link>
      <Link
        style={{ marginRight: "0px" }}
        href="https://www.swales.app/contact-us"
        className={`${baseClass} ${
          pathName === "/contact-us" ? activeClass : inactiveClass
        }`}
      >
        Contact Us
      </Link>
      <Link
        style={{ marginRight: "0px" }}
        href="https://www.swales.app/blog"
        className={`${baseClass} ${
          pathName === "/blog" ? activeClass : inactiveClass
        }`}
      >
        Blog
      </Link>
    </>
  );
};
// --- End of NavLinks Component ---

interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onLoginClick,
  onSignupClick,
  nologin = false,
}) => {
  const { user, logout } = useAuth();

  // State for user menu dropdown
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- 2. Added Logic Required for NavLinks ---
  const pathName = usePathname();
  const mapRoutes = [
    "soil-map",
    "suncalc-map",
    "wind-map",
    "weather-forecast-map",
    "water-stress-map",
    "elevation-map",
    "water-precipitation-map",
    "contour-map",
    "flooding-map",
  ];

  // Effect to handle clicks outside the user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <nav className="bg-white ">
      <header
        className={
          // Added 'relative' to allow absolute positioning of the nav
          " relative w-full  p-4  flex justify-between items-center z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        }
      >
        {/* Left Side: Logo (This is now Child 1) */}
        <div className="flex items-center space-x-3">
          <Link href="/">
            <img width={100} height={100} src="/logo.png" alt="Logo" />
          </Link>
        </div>

        {/* --- Middle: NavLinks (This is now Child 2) --- */}
        {/* We removed the wrapper and added positioning classes */}
        <div className="hidden lg:flex items-center space-x-4 ">
          <NavLinks pathName={pathName} mapRoutes={mapRoutes} />
        </div>

        {/* --- Right Side: Login/User Area (This is now Child 3) --- */}
        {/* This is now a direct child of 'header' */}
        <div className="flex items-center space-x-2">
          {user ? (
            // User Menu (Dropdown)
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <UserCircle className="h-6 w-6 text-slate-600" />
                <span className="font-medium text-slate-700 ">
                  Hello, {user.firstName}
                </span>
              </button>

              {/* Dropdown Panel */}
              <div
                className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 transition-all duration-300 ${
                  isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
              >
                <button
                  onClick={logout}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            // Login/Signup Buttons

            <>
              {!nologin && (
                <>
                  <button
                    onClick={onLoginClick}
                    className=" hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors font-medium mr-3"
                  >
                    Login
                  </button>
                  <button
                    onClick={onSignupClick}
                    className="bg-green-600 w-[100px] text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md font-medium"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </header>
    </nav>
  );
};

export default Header;
