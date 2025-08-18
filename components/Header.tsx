// components/Header.tsx
import React from "react";
import { Leaf } from "lucide-react"; // npm install lucide-react

const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md p-4 border-b border-slate-200 flex justify-between items-center z-10">
      <div className="flex items-center space-x-3">
        <div className="bg-green-100 p-2 rounded-lg">
          <Leaf className="h-6 w-6 text-green-700" />
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">
          Garden Designer
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button className="text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors font-medium">
          Login
        </button>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md font-medium">
          Sign Up
        </button>
      </div>
    </header>
  );
};

export default Header;
