"use client";

// Import React hooks, Link, and usePathname
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// 1. ADDED 'Menu' AND 'X' FOR THE HAMBURGER ICON
import {
  UserCircle,
  LogOut,
  Menu,
  X,
  Settings,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AccountDetailsModal from "./auth/AccountDetailsModal";

// --- NavLinks Component (Unchanged from your file) ---

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
        className={`${baseClass} ${
          pathName === "/" ? activeClass : inactiveClass
        }`}
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
  nologin?: boolean; // Added nologin to interface
}

const Header: React.FC<HeaderProps> = ({
  onLoginClick,
  onSignupClick,
  nologin = false,
}) => {
  const { user, logout } = useAuth();

  // 2. RENAMED STATE: This is for the USER dropdown, not the mobile nav
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null); // Renamed ref

  // 3. ADDED STATE: This is for the new MOBILE nav
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  // --- Logic for NavLinks (Unchanged) ---
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

  // 4. UPDATED EFFECT: This logic is for the USER dropdown
  // It now uses the renamed state 'isUserMenuOpen'
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false); // Use renamed state
      }
    };

    if (isUserMenuOpen) {
      // Use renamed state
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]); // Use renamed state

  return (
    <>
      <nav className="bg-white sticky top-0 z-30 w-full border-b border-gray-200/80">
        <header
          className={
            "relative w-full p-4 flex justify-between items-center z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          }
        >
          {/* Left Side: Logo (Unchanged) */}
          <div className="flex items-center space-x-3">
            <Link href="https://www.swales.app">
              <img width={100} height={100} src="/logo.png" alt="Logo" />
            </Link>
          </div>

          {/* --- Middle: NavLinks (Unchanged, already hidden on mobile) --- */}
          <div className="hidden lg:flex items-center space-x-4 ">
            <NavLinks pathName={pathName} mapRoutes={mapRoutes} />
          </div>

          {/* --- Right Side: Login/User Area --- */}
          {/* 5. ADDED 'hidden lg:flex': This hides the desktop login buttons on mobile */}
          <div className="hidden lg:flex items-center space-x-2">
            {user ? (
              // User Menu (Dropdown)
              <div className="relative" ref={userMenuRef}>
                {" "}
                {/* Use renamed ref */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} // Use renamed state setter
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <UserCircle className="h-6 w-6 text-slate-600" />
                  <span className="font-medium text-slate-700 ">
                    Hello, {user.firstName}
                  </span>
                </button>
                {/* Dropdown Panel */}
                <div
                  className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 transition-all duration-300 z-20 ${
                    isUserMenuOpen
                      ? "opacity-100 visible"
                      : "opacity-0 invisible" // Use renamed state
                  }`}
                >
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsAccountModalOpen(true);
                    }}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Account Details
                  </button>
                  <button
                    onClick={() => setIsUserMenuOpen(false)} // Just closes menu for now
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Subscription
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>
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

          {/* 6. ADDED: Mobile Menu Button (Hamburger) */}
          {/* This is copied from your first example and shows ONLY on mobile */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} // Use new mobile state
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? ( // Use new mobile state
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </header>

        {/* 7. ADDED: Mobile Menu Panel */}
        {/* This is the panel that opens. It uses your component's logic. */}
        <div
          className={`${
            isMobileMenuOpen ? "block" : "hidden"
          } lg:hidden border-t border-gray-200/80`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLinks pathName={pathName} mapRoutes={mapRoutes} mobile />
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4">
              {user ? (
                // Mobile version of the user menu
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <UserCircle className="h-6 w-6 text-slate-600" />
                    <span className="font-medium text-slate-700">
                      Hello, {user.firstName}
                    </span>
                  </div>
                  <button
                    onClick={logout} // Use logout from useAuth
                    className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                // Mobile version of the login buttons
                <div className="space-y-2">
                  {!nologin && ( // Respect the 'nologin' prop
                    <>
                      <button
                        onClick={onLoginClick} // Use prop
                        className="w-full flex justify-center px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                      >
                        Login
                      </button>
                      <button
                        onClick={onSignupClick} // Use prop
                        className="w-full mt-2 flex justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 font-medium"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AccountDetailsModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        user={user}
      />
    </>
  );
};

export default Header;
