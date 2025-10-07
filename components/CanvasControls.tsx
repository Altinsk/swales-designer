// components/CanvasControls.tsx
"use client";
import React, { useEffect, useState } from "react";

interface CanvasControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  scaleIndicatorPixels: number; // e.g., 40 pixels for 1 meter at 1x zoom
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
  onZoomIn,
  onZoomOut,
  scaleIndicatorPixels,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount and on resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent lines from growing on mobile
  const effectiveScalePixels = isMobile ? 40 : scaleIndicatorPixels; // 40px constant on mobile

  const meters = [1, 2, 3, 4, 5];

  return (
    <div
      style={{ bottom: "5%" }}
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3"
    >
      {/* Zoom Out Button */}
      <button
        onClick={onZoomOut}
        className="hover:bg-gray-200 transition-colors backdrop-blur-sm p-3 rounded-full shadow-lg bg-white/80"
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

      {/* Scale Indicator */}
      <div className="flex items-start">
        {meters.map((meter, i) => (
          <div
            key={meter}
            className="flex flex-col-reverse items-center"
            style={{ width: `${effectiveScalePixels}px` }}
          >
            <div
              className={`h-[5px] ${i % 2 === 0 ? "bg-black" : "bg-white"}`}
              style={{ width: "100%" }}
            ></div>

            <span className="text-[14px] font-semibold text-gray-600 -mt-0.5">
              {meter}m
            </span>
          </div>
        ))}
      </div>

      {/* Zoom In Button */}
      <button
        onClick={onZoomIn}
        className="hover:bg-gray-200 transition-colors backdrop-blur-sm p-3 rounded-full shadow-lg bg-white/80"
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
