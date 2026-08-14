"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface PrintAuthGatePopupProps {
  onClose: () => void;
  onSignup: () => void;
  onLogin: () => void;
}

// Short, attributed permaculture quotes. Keep this list curated rather than
// long — each one should be a quote you'd actually want representing the
// brand, not filler.
const QUOTES = [
  {
    text: "Though the problems of the world are increasingly complex, the solutions remain embarrassingly simple.",
    author: "Bill Mollison",
  },
  {
    text: "The greatest change we need to make is from consumption to production, even if on a small scale, in our own gardens.",
    author: "Bill Mollison",
  },
  {
    text: "The ultimate goal of farming is not the growing of crops, but the cultivation and perfection of human beings.",
    author: "Masanobu Fukuoka",
  },
  {
    text: "The soil is the great connector of lives, the source and destination of all.",
    author: "Wendell Berry",
  },
  {
    text: "The care of the Earth is our most ancient and most worthy, and after all our most pleasing responsibility.",
    author: "Wendell Berry",
  },
  {
    text: "All the world's problems can be solved in a garden.",
    author: "Geoff Lawton",
  },
];

const PrintAuthGatePopup: React.FC<PrintAuthGatePopupProps> = ({
  onClose,
  onSignup,
  onLogin,
}) => {
  const [quote] = useState(
    () => QUOTES[Math.floor(Math.random() * QUOTES.length)]
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-7 pt-8 text-center"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3.5 right-3.5 text-[#9ca3af] hover:text-[#1f2937] transition-colors"
        >
          <X className="w-[18px] h-[18px]" />
        </button>

        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Swales"
            width={64}
            height={64}
            className="object-contain"
          />
        </div>

        <p className="text-[17px] italic text-[#1f2937] leading-relaxed">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="text-[13px] text-[#6b7280] mt-2.5 mb-4">
          — {quote.author}
        </p>

        <p className="text-sm text-[#4b5563] mb-5">
          Create a free account to print your garden plan.
        </p>

        <button
          onClick={onSignup}
          className="block w-full py-2.5 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors mb-2.5"
        >
          Sign Up Free
        </button>
        <button
          onClick={onLogin}
          className="text-sm text-[#6b7280] hover:text-[#374151] py-1"
        >
          Already have an account?{" "}
          <span className="text-green-600 font-medium">Log in</span>
        </button>
      </div>
    </div>
  );
};

export default PrintAuthGatePopup;
