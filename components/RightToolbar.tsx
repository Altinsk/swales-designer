// components/RightToolbar.tsx
import React from "react";
import { VisibilityState, VisibilityToggle } from "@/app/page";

// --- Icons for the buttons ---

const GridIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM10 4v16m4-16v16M4 10h16M4 14h16"
    />
  </svg>
);

const SketchIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
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
);

const ItemsIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
    />
  </svg>
);

const NotesIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
    />
  </svg>
);

interface RightToolbarProps {
  visibility: VisibilityState;
  onVisibilityChange: (key: VisibilityToggle) => void;
  className?: string;
}

const RightToolbar: React.FC<RightToolbarProps> = ({
  visibility,
  onVisibilityChange,
  className,
}) => {
  const buttons: {
    key: VisibilityToggle;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { key: "grid", label: "Grid", icon: GridIcon },
    { key: "sketch", label: "Planning Sketch", icon: SketchIcon },
    { key: "items", label: "Items", icon: ItemsIcon },
    { key: "notes", label: "Notes", icon: NotesIcon },
  ];

  return (
    <div
      className={`bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg flex flex-col items-center space-y-2 z-10 ${className}`}
    >
      {buttons.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onVisibilityChange(key)}
          title={`${visibility[key] ? "Hide" : "Show"} ${label}`}
          className={`w-20 h-16 flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
            ${
              visibility[key]
                ? "bg-green-100 text-green-800"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }
          `}
        >
          <Icon className="h-6 w-6 mb-1" />
          <span className="text-center leading-tight">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default RightToolbar;
