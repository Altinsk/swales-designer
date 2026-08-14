"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserCircle,
  LogOut,
  Menu,
  X,
  Settings,
  CreditCard,
} from "lucide-react"; // Added Icons
import { useAuth } from "@/context/AuthContext";
// Import the Modal
import AccountDetailsModal from "./auth/AccountDetailsModal";

interface MobileHeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  onLoginClick,
  onSignupClick,
}) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // NEW: State for Account Modal
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const pathName = usePathname();

  // Logic to highlight "Services" tab
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

  // Helper for link styles
  const getLinkClass = (isActive: boolean) =>
    `block px-4 py-3 text-base font-medium border-b border-gray-100 last:border-0 ${
      isActive
        ? "bg-green-50 text-green-700"
        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
    }`;

  return (
    <>
      {/* Updated z-index to z-[60] to ensure it sits above toolbars (z-50) */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200/80 sticky top-0 z-[60] w-full transition-all duration-300">
        {/* --- TOP BAR --- */}
        <div className="flex justify-between items-center px-4 transition-all duration-300 h-14 landscape:h-10">
          {/* Logo (Shrinks in landscape) */}
          <Link
            href="https://www.swales.app"
            className="flex items-center"
            onClick={() => setIsMenuOpen(false)}
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="w-auto h-10 landscape:h-6 object-contain transition-all duration-300"
            />
          </Link>

          {/* Right Side: Hamburger Menu */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 landscape:w-5 landscape:h-5" />
              ) : (
                <Menu className="w-6 h-6 landscape:w-5 landscape:h-5" />
              )}
            </button>
          </div>
        </div>

        {/* --- DROPDOWN NAVIGATION MENU --- */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-2xl z-[60] max-h-[85vh] overflow-y-auto">
            {/* 1. Navigation Links */}
            <div className="flex flex-col">
              <Link
                href="https://www.swales.app/use-case"
                className={getLinkClass(pathName === "/use-case")}
                onClick={() => setIsMenuOpen(false)}
              >
                How it works
              </Link>

              <Link
                href="https://www.swales.app/weather-forecast-map"
                target="_blank"
                className={getLinkClass(
                  mapRoutes.some((route) => pathName.includes(route))
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>

              <Link
                href="/"
                className={getLinkClass(pathName === "/")}
                onClick={() => setIsMenuOpen(false)}
              >
                Designer
              </Link>

              <Link
                href="https://www.swales.app/contact-us"
                className={getLinkClass(pathName === "/contact-us")}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact Us
              </Link>

              <Link
                href="https://www.swales.app/blog"
                className={getLinkClass(pathName === "/blog")}
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
            </div>

            {/* 2. User Actions (Login/Signup/Profile) */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                      {user.firstName ? (
                        <span className="font-bold text-lg">
                          {user.firstName[0]}
                        </span>
                      ) : (
                        <UserCircle className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Hello, {user.firstName}
                      </p>
                      <p className="text-xs text-gray-500">Logged in</p>
                    </div>
                  </div>

                  {/* NEW MENU ITEMS */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false); // Close menu
                      setIsAccountModalOpen(true); // Open Modal
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Account Details
                  </button>

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Future subscription logic
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Subscription
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onLoginClick();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white font-medium hover:bg-gray-50"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      onSignupClick();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex justify-center px-4 py-3 border border-transparent rounded-lg text-white bg-green-600 font-medium hover:bg-green-700 shadow-sm"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* RENDER THE MODAL */}
      <AccountDetailsModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </>
  );
};

export default MobileHeader;
