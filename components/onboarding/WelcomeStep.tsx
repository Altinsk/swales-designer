// components/onboarding/WelcomeStep.tsx
import React from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface WelcomeStepProps {
  onPositionLawn: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onPositionLawn }) => {
  return (
    <div className="flex flex-col h-full p-4 sm:p-6">
      <main className="flex-grow overflow-y-auto">
        <div className="space-y-8">
          <div className="md:hidden flex items-start p-4 text-red-800 bg-red-100 border-l-4 border-red-500 rounded-md">
            <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0" />
            <div>
              <p className="font-bold">Accuracy on Small Screens</p>
              <p className="text-sm">
                Measurements may not be precise on mobile devices. For best
                results, please use a desktop browser.
              </p>
            </div>
          </div>

          <p className="text-[#4b5563]">
            Use the <span className="font-semibold md:hidden">bottom menu</span>
            <span className="font-semibold hidden md:inline">left menu</span> to
            map out your land with elements like zones, water features, trees,
            and pathways. Add structures, animals, plants, and other key
            components to experiment with different layouts and create a living
            design that balances food, water, energy, and ecology.
          </p>

          <div>
            <h3 className="text-xl font-bold text-[#1f2937] mb-4">
              Draw your garden:
            </h3>
            <div className="flex flex-col sm:flex-row items-start justify-center gap-8 text-center">
              <div className="flex flex-col items-center max-w-xs mx-auto">
                <div className="p-1 rounded-lg w-24 h-24 flex items-center justify-center">
                  <img src="/welcome_plot.png" alt="Plotting surface example" />
                </div>
                <p className="text-[#6b7280] text-sm mt-2">
                  Click and drag our plot surfaces to map your garden precisely
                  to scale.
                </p>
              </div>

              <div className="flex flex-col items-center max-w-xs mx-auto">
                <div className="p-1 rounded-lg w-24 h-24 flex items-center justify-center">
                  <img src="/welcome_items.png" alt="Pre-drawn items example" />
                </div>
                <p className="text-[#6b7280] text-sm mt-2">
                  Use pre-drawn items like houses, plants, and furniture. You
                  can change their size, move, rotate, and copy them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="flex-shrink-0 pt-6 mt-4">
        <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
          <Link
            href="/faq"
            className="px-6 py-2 w-full sm:w-auto text-center rounded-full text-[#374151] border border-gray-300 hover:bg-gray-100 transition-colors"
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
      </footer>
    </div>
  );
};

export default WelcomeStep;
