// components/TopBar.tsx
"use client";
import React from "react";
// ✅ 1. Import desired icons from lucide-react
import {
  Save,
  SaveAll,
  Trash2,
  Share2,
  Undo2,
  Redo2,
  Printer,
  ImageUp,
  Check,
  Edit2,
  PenBox,
} from "lucide-react";

type Template = {
  id: string;
  name: string;
  src: string;
};

interface TopBarProps {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  templates: Template[];
  className?: string;
}

// ✅ 2. Refactor the Icon component to accept a component prop
const Icon = ({
  icon: IconComponent, // The prop is now an icon component
  title,
  onClick,
  disabled = false,
}: {
  icon: React.ElementType; // Use React.ElementType for the type
  title: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    title={title}
    onClick={onClick}
    disabled={disabled}
    className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    {/* ✅ 3. Render the passed icon component */}
    <IconComponent className="w-6 h-6 text-gray-700" strokeWidth={2} />
  </button>
);

const TopBar: React.FC<TopBarProps> = ({
  onUndo,
  onRedo,
  onDelete,
  templates,
  className = "",
}) => {
  return (
    <header
      className={`bg-white/80 backdrop-blur-sm shadow-lg p-2 flex items-center justify-between border border-gray-200 rounded-xl ${className}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {/* ✅ 4. Update calls to use the 'icon' prop with the imported component */}
          <Icon icon={Save} title="Save (Not Implemented)" disabled />
          <Icon icon={PenBox} title="Save As (Not Implemented)" disabled />
          <Icon icon={Trash2} title="Delete Selected" onClick={onDelete} />
          <Icon icon={Share2} title="Share (Not Implemented)" disabled />
        </div>
        <div className="h-6 w-px bg-gray-300"></div>
        <div className="flex items-center gap-1">
          <Icon icon={Undo2} title="Undo (Ctrl+Z)" onClick={onUndo} />
          <Icon icon={Redo2} title="Redo (Ctrl+Y)" onClick={onRedo} />
          <Icon icon={Printer} title="Print (Not Implemented)" disabled />
          <Icon
            icon={ImageUp}
            title="Upload Image (Not Implemented)"
            disabled
          />
        </div>
      </div>
      <div className="flex items-center gap-3 mr-2">
        <button className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
          New Drawing
        </button>
        <div className="relative group">
          <button className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
            Templates
          </button>
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 space-y-1">
            {templates.map((template) => (
              <a
                key={template.id}
                href="#"
                className="flex items-center p-2 rounded-md hover:bg-gray-100 text-sm"
              >
                <img
                  src={template.src}
                  alt={template.name}
                  className="w-10 h-10 object-cover rounded-md mr-3"
                />
                {template.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
