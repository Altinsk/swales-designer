// components/onboarding/WelcomeStep.tsx
import React from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface WelcomeStepProps {
  onPositionLawn: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onPositionLawn }) => {
  return (
    <div>
      {/* Mobile-only Alert */}
      <div className="md:hidden flex items-start p-4 mb-4 text-red-800 bg-red-100 border-l-4 border-red-500 rounded-md">
        <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0" />
        <div>
          <p className="font-bold">Accuracy on Small Screens</p>
          <p className="text-sm">
            Measurements may not be precise on mobile devices. For best results
            and accurate scaling, please use a desktop browser.
          </p>
        </div>
      </div>

      {/* ✅ NEW: Responsive Instructions Text */}
      {/* Desktop Instructions (hidden on mobile) */}
      <p className="hidden md:block text-gray-600 my-4">
        Use the left menu to map out your land with elements like zones, water
        features, trees, gardens, and pathways. Add structures, animals, plants,
        and other key components. Adjust size, move, rotate, and duplicate to
        experiment with different layouts. Create a living design that balances
        food, water, energy, and ecology.
      </p>

      {/* Mobile Instructions (hidden on desktop) */}
      <p className="md:hidden text-gray-600 my-4">
        Use the bottom menu to map out your land with elements like zones, water
        features, trees, gardens, and pathways. Add structures, animals, plants,
        and other key components. Adjust size, move, rotate, and duplicate to
        experiment with different layouts. Create a living design that balances
        food, water, energy, and ecology.
      </p>

      <div className="my-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3">
          Draw your garden:
        </h3>
        {/* Responsive layout for smaller screens */}
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="text-center flex flex-col items-center">
            <div className=" p-1 rounded-lg w-24 h-24 flex items-center justify-center text-xs text-gray-400">
              <img src="/welcome_plot.png" alt="Plotting surface example" />
            </div>
            <p className="text-gray-500 text-sm flex-1 mt-2">
              Click and drag our plot surfaces (found on the left menu) to map
              your garden precisely to scale.
            </p>
          </div>

          <div className="text-center flex flex-col items-center mt-4 sm:mt-0">
            <div className=" p-1 rounded-lg w-24 h-24 flex items-center justify-center text-xs text-gray-400">
              <img src="/welcome_items.png" alt="Pre-drawn items example" />
            </div>
            <p className="text-gray-500 text-sm flex-1 mt-2">
              Pre-drawn items such as houses, plants, furniture and much more,
              which you can change to any size you like, move, rotate and copy.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-end items-center gap-4">
        <Link
          href="/faq"
          className="px-6 py-2 w-full sm:w-auto text-center rounded-full text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          More information
        </Link>
        <button
          onClick={onPositionLawn}
          className="px-6 py-2 w-full sm:w-auto rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
        >
          Start Designing
        </button>
      </div>
    </div>
  );
};

export default WelcomeStep;
