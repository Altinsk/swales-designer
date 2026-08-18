"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface SignupQuotePopupProps {
  onClose: () => void;
  onSignup: () => void;
}

// Mirrors services/src/components/ui/SignupQuotePopup.jsx (logo + quote +
// "Sign Up Free" + "Maybe later") — shown 15s after the welcome popup is
// closed, only for signed-out visitors. Keep the quote list in sync with the
// services version if it changes there.
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

const SignupQuotePopup: React.FC<SignupQuotePopupProps> = ({
  onClose,
  onSignup,
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
          className="absolute top-3.5 right-3.5 text-[#a3a3a3] hover:text-[#262626] transition-colors"
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

        <p className="text-[17px] italic text-[#262626] leading-relaxed">
          &ldquo;{quote.text}&rdquo;
        </p>
        <p className="text-[13px] text-[#737373] mt-2.5 mb-6">
          — {quote.author}
        </p>

        <button
          onClick={onSignup}
          className="block w-full py-2.5 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors mb-2.5"
        >
          Sign Up Free
        </button>
        <button
          onClick={onClose}
          className="text-sm text-[#737373] hover:text-[#404040] py-1"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};

export default SignupQuotePopup;
