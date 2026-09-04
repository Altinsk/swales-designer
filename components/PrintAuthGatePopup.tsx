"use client";

import React from "react";
import { X, Printer } from "lucide-react";

interface PrintAuthGatePopupProps {
  onClose: () => void;
  onSignup: () => void;
  onLogin: () => void;
}

// Mirrors services/src/components/ui/ReportAuthGateModal.jsx (icon header +
// headline + description + Sign Up Free / Log In buttons + Maybe later),
// with copy adapted for gating "print" instead of "download report". Keep
// styling in sync with the services version if it changes there.
const PrintAuthGatePopup: React.FC<PrintAuthGatePopupProps> = ({
  onClose,
  onSignup,
  onLogin,
}) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.15),0_10px_10px_-5px_rgba(0,0,0,0.06)] p-7 pt-8 text-center"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 text-[#9ca3af] hover:text-[#262626] transition-colors"
        >
          <X className="w-[18px] h-[18px]" />
        </button>

        <div className="w-14 h-14 rounded-[14px] bg-[#f0fdf4] mx-auto mb-4 flex items-center justify-center">
          <Printer className="w-[26px] h-[26px] text-green-600" />
        </div>

        <h3 className="text-[17px] font-extrabold text-[#111827] mb-2">
          Sign in to print your garden plan
        </h3>
        <p className="text-[13.5px] text-[#6b7280] leading-[1.5] mb-6">
          Printing requires a free account so we can save your garden plan
          and keep it ready for you. Sign in or create a free account to
          continue.
        </p>

        <button
          onClick={onSignup}
          className="block w-full p-[0.7rem] rounded-[10px] bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors mb-2.5"
        >
          Sign Up Free
        </button>
        <button
          onClick={onLogin}
          className="block w-full p-[0.7rem] rounded-[10px] bg-white text-green-600 font-bold text-sm border-[1.5px] border-green-600 hover:bg-green-50 transition-colors mb-2.5"
        >
          Log In
        </button>
        <button
          onClick={onClose}
          className="text-[13px] text-[#9ca3af] hover:text-[#404040] p-1"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};

export default PrintAuthGatePopup;
