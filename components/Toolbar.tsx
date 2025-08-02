// components/Toolbar.tsx
import React from "react";

export type Tool = "select" | "plot";
export type Preset = { id: string; src: string; name: string };

interface ToolbarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  selectPreset: (preset: Preset) => void;
  presets: Preset[];
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  selectPreset,
  presets,
  onZoomIn,
  onZoomOut,
}) => {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-200 p-6 w-72 shadow-lg rounded-r-2xl flex flex-col space-y-8 z-10 transition-all duration-300">
      {/* Main Tools Section */}
      <div>
        <h3 className="font-semibold text-gray-800 text-lg mb-4 tracking-tight">
          Tools
        </h3>
        <div className="space-y-3">
          <button
            onClick={() => setActiveTool("select")}
            className={`w-full flex items-center p-3 rounded-lg text-left transition-all duration-200 transform ${
              activeTool === "select"
                ? "bg-green-600 text-white scale-105 shadow-md"
                : "bg-white hover:bg-gray-100 text-gray-700 hover:shadow-sm"
            }`}
            title="Select and move objects"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11"
              />
            </svg>
            <span className="text-sm font-medium">Select & Move</span>
          </button>
          <button
            onClick={() => setActiveTool("plot")}
            className={`w-full flex items-center p-3 rounded-lg text-left transition-all duration-200 transform ${
              activeTool === "plot"
                ? "bg-green-600 text-white scale-105 shadow-md"
                : "bg-white hover:bg-gray-100 text-gray-700 hover:shadow-sm"
            }`}
            title="Plot garden areas"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
              />
            </svg>
            <span className="text-sm font-medium">Plot Area</span>
          </button>
        </div>
      </div>

      {/* Canvas Tools Section */}
      <div>
        <h3 className="font-semibold text-gray-800 text-lg mb-4 tracking-tight">
          Canvas Controls
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-start space-x-3">
            <button
              onClick={onZoomOut}
              className="p-3 rounded-lg bg-white hover:bg-gray-100 text-gray-700 transition-all duration-200 hover:shadow-sm"
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
            <button
              onClick={onZoomIn}
              className="p-3 rounded-lg bg-white hover:bg-gray-100 text-gray-700 transition-all duration-200 hover:shadow-sm"
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
          <p className="text-xs text-gray-500 leading-relaxed">
            Ctrl+Z to undo, Delete to remove selected object, scroll to zoom.
          </p>
        </div>
      </div>

      {/* Preset Objects Section */}
      <div>
        <h3 className="font-semibold text-gray-800 text-lg mb-4 tracking-tight">
          Objects
        </h3>
        <div className="space-y-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => selectPreset(preset)}
              className="w-full flex items-center p-3 rounded-lg bg-white hover:bg-gray-100 text-gray-700 transition-all duration-200 hover:shadow-sm"
              title={`Add ${preset.name} to canvas`}
            >
              <img
                src={preset.src}
                alt={preset.name}
                className="h-6 w-6 mr-3 object-contain"
              />
              <span className="text-sm font-medium">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
