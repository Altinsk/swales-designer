// components/onboarding/WelcomeStep.tsx
import React from "react";
import Link from "next/link";

interface WelcomeStepProps {
  onPositionLawn: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onPositionLawn }) => {
  return (
    <div>
      <p className="text-gray-600 my-4">
        Visualise your dream garden! The left menu contains everything you need
        to draw your plot; including grass, beds and paving. You can also add
        items like houses, plants, furniture etc. You can then change the size,
        move them, rotate them and duplicate them.
      </p>

      <div className="my-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          Draw your garden:
        </h3>
        <div className="flex items-center gap-8">
          <div className="text-center flex flex-col items-center">
            <div className=" p-1 rounded-lg w-24 h-24 flex items-center justify-center text-xs text-gray-400">
              <img src="/welcome_plot.png" alt="" />
            </div>
            <p className="text-gray-500 text-sm flex-1">
              Click and drag our plot surfaces (found on the left menu) to map
              your garden precisely to scale.
            </p>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className=" p-1 rounded-lg w-24 h-24 flex items-center justify-center text-xs text-gray-400">
              <img src="/welcome_items.png" alt="" />
            </div>
            <p className="text-gray-500 text-sm flex-1">
              Pre-drawn items such as houses, plants, furniture and much more,
              which you can change to any size you like, move, rotate and copy.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end items-center gap-4">
        <Link
          href="/faq"
          className="px-6 py-2 rounded-full text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          More information
        </Link>
        <button
          onClick={onPositionLawn}
          className="px-6 py-2 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
        >
          Position lawn
        </button>
      </div>
    </div>
  );
};

export default WelcomeStep;
