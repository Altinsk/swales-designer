"use client"; // Add this line to mark it as a Client Component

import React from "react";
import { Leaf, UserCircle, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // Import the useAuth hook

// Define props for handling clicks
interface HeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onSignupClick }) => {
  // Get user status and logout function from the auth context
  const { user, logout } = useAuth();

  return (
    <header
      className={
        "bg-white/80 absolute w-full backdrop-blur-md p-4 border-b border-slate-200 flex justify-between items-center z-10"
      }
    >
      <div className="flex items-center space-x-3">
        <div className="bg-green-100 p-2 rounded-lg">
          <Leaf className="h-6 w-6 text-green-700" />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">
          Garden Designer
        </span>
      </div>

      {/* Conditionally render buttons or user menu */}
      <div className="flex items-center space-x-2">
        {user ? (
          // If user is logged in, show the user menu
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <UserCircle className="h-6 w-6 text-slate-600" />
              <span className="font-medium text-slate-700 hidden sm:block">
                {user.email}
              </span>
            </button>
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
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
          // If user is not logged in, show Login/Sign Up buttons
          <>
            <button
              onClick={onLoginClick}
              className="text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Login
            </button>
            <button
              onClick={onSignupClick}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md font-medium"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
