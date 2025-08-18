// components/CanvasControls.tsx
"use client";
import React from "react";

interface CanvasControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  scaleIndicatorPixels: number; // e.g., 40 pixels for 1 meter
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
  onZoomIn,
  onZoomOut,
  scaleIndicatorPixels,
}) => {
  return (
    <div
      style={{ bottom: "15%" }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg"
    >
      <button
        onClick={onZoomOut}
        className="p-2 rounded-md hover:bg-gray-200 transition-colors"
        title="Zoom Out"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
          />
        </svg>
      </button>

      <div className="flex flex-col items-center">
        <div className="flex border border-gray-400">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`h-3 ${i % 2 === 0 ? "bg-black" : "bg-white"}`}
              style={{ width: `${scaleIndicatorPixels}px` }}
            ></div>
          ))}
        </div>
        <span className="text-xs font-semibold text-gray-600 mt-1">5 m</span>
      </div>

      <button
        onClick={onZoomIn}
        className="p-2 rounded-md hover:bg-gray-200 transition-colors"
        title="Zoom In"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
          />
        </svg>
      </button>
    </div>
  );
};

export default CanvasControls;
