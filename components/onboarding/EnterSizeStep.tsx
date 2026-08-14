// components/onboarding/EnterSizeStep.tsx
import React, { useState } from "react";

interface EnterSizeStepProps {
  onPositionPlot: (width: number, height: number) => void;
}

const EnterSizeStep: React.FC<EnterSizeStepProps> = ({ onPositionPlot }) => {
  const [length, setLength] = useState("20");
  const [width, setWidth] = useState("10");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lengthNum = parseFloat(length);
    const widthNum = parseFloat(width);
    if (
      !isNaN(lengthNum) &&
      !isNaN(widthNum) &&
      lengthNum > 0 &&
      widthNum > 0
    ) {
      // Note: The UI shows "Length" and "Width", but conventionally in graphics,
      // we use width (x-axis) and height (y-axis).
      // We'll treat "Length" as the width and "Width" as the height.
      onPositionPlot(lengthNum, widthNum);
    }
  };

  return (
    <div>
      <p className="text-[#4b5563] mt-1 mb-6">
        Enter the size of your plot (length * width)
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
          <div className="w-48 h-25 m-4  rounded-md flex items-center justify-center text-[#9ca3af]">
            <img src="/rect_sizing.png" alt="" />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <label
                htmlFor="length"
                className="font-semibold text-[#374151] w-16"
              >
                Length
              </label>
              <input
                id="length"
                type="number"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-24 p-2 border rounded-md text-center"
              />
              <span className="text-[#6b7280]">m</span>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="width"
                className="font-semibold text-[#374151] w-16"
              >
                Width
              </label>
              <input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-24 p-2 border rounded-md text-center"
              />
              <span className="text-[#6b7280]">m</span>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="px-8 py-3 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
        >
          Position plot
        </button>
      </form>
    </div>
  );
};

export default EnterSizeStep;
