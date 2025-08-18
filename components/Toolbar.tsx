// components/Toolbar.tsx
import React, { useState } from "react";

export type Tool = "select" | "plot";

export interface Texture {
  id: string;
  name: string;
  src: string;
}

interface PlotToolConfig {
  id: "plot";
  name: string;
  type: "menu";
  textures: Texture[];
}

export interface PresetItem {
  id: string;
  name: string;
  type: "item";
  src: string;
}

export interface PresetCategory {
  id: string;
  name: string;
  type: "category";
  children?: (PresetItem | PresetCategory)[];
}

export type Preset = PresetItem | PresetCategory;

interface ToolbarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  onSelectPreset: (preset: PresetItem) => void;
  onSelectTexture: (texture: Texture) => void;
  config: {
    tools: PlotToolConfig[];
    objects: Preset[];
  };
  className?: string;
}

// A recursive component to render object categories and items with STATE-BASED HOVER
const ObjectMenuItem: React.FC<{
  item: Preset;
  onSelectPreset: (preset: PresetItem) => void;
}> = ({ item, onSelectPreset }) => {
  // ✅ Use local state for hover to prevent cascading
  const [isHovered, setIsHovered] = useState(false);

  if (item.type === "item") {
    return (
      <button
        onClick={() => onSelectPreset(item)}
        className="w-full flex items-center p-2 rounded-md hover:bg-green-100 text-gray-700 transition-colors duration-150"
        title={`Add ${item.name} to canvas`}
      >
        <img
          src={item.src}
          alt={item.name}
          className="h-5 w-5 mr-3 object-contain"
        />
        <span className="text-sm whitespace-nowrap">{item.name}</span>
      </button>
    );
  }

  // item.type === 'category'
  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between p-2 rounded-md hover:bg-green-100 text-gray-700 cursor-default">
        <span className="text-sm font-medium whitespace-nowrap">
          {item.name}
        </span>
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
      {/* Sub-menu visibility is now controlled by the isHovered state */}
      <div
        style={{ left: "95%" }}
        className={`absolute left-full top-0 ml-1 p-2 space-y-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg transition-opacity duration-200 w-max ${
          isHovered
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {item.children?.map((child) => (
          <ObjectMenuItem
            key={child.id}
            item={child}
            onSelectPreset={onSelectPreset}
          />
        ))}
      </div>
    </div>
  );
};

const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  onSelectPreset,
  onSelectTexture,
  config,
  className,
}) => {
  const plotToolConfig = config.tools.find((t) => t.id === "plot");

  return (
    <div
      className={`bg-white/90 backdrop-blur-sm p-3 w-60 rounded-xl shadow-lg flex flex-col space-y-4 z-10 transition-all duration-300 ${className}`}
    >
      {/* Main Tools Section */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider px-2">
          Tools
        </h3>
        <button
          onClick={() => setActiveTool("select")}
          className={`w-full flex items-center p-2 rounded-lg text-left transition-all duration-200 ${
            activeTool === "select"
              ? "bg-green-600 text-white shadow"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          <svg
            className="h-5 w-5 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11"
            />
          </svg>
          <span className="text-sm font-medium">Select & Move</span>
        </button>

        {plotToolConfig && (
          <div className="relative group">
            <div
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                activeTool === "plot"
                  ? "bg-green-600 text-white shadow"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className="flex items-center">
                <svg
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
                <span className="text-sm font-medium">
                  {plotToolConfig.name}
                </span>
              </div>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
            {/* ✅ Plot menu now opens to the right */}
            <div
              style={{ left: "98%" }}
              className="absolute left-full top-0 ml-1 p-2 space-y-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 w-max"
            >
              {plotToolConfig.textures.map((texture) => (
                <button
                  key={texture.id}
                  onClick={() => onSelectTexture(texture)}
                  className="w-full flex items-center p-2 rounded-md hover:bg-gray-100"
                >
                  <img
                    src={texture.src}
                    alt={texture.name}
                    className="w-5 h-5 rounded-sm mr-3 object-cover"
                  />
                  <span className="text-sm">{texture.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preset Objects Section */}
      <div className="space-y-1">
        <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider px-2">
          Objects
        </h3>
        {config.objects.map((item) => (
          <ObjectMenuItem
            key={item.id}
            item={item}
            onSelectPreset={onSelectPreset}
          />
        ))}
      </div>
    </div>
  );
};

export default Toolbar;
