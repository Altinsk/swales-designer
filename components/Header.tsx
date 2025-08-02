// components/Header.tsx
import React from "react";

const Header = () => {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
      <div className="flex items-center space-x-2">
        {/* Placeholder for a logo */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <span className="text-xl font-bold text-gray-700">Garden Designer</span>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-600 hover:text-green-600">Login</button>
        <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
          Sign Up
        </button>
      </div>
    </header>
  );
};

export default Header;
