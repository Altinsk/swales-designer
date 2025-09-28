// components/Toolbar.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { ActiveTool, NoteShape } from "@/app/page";

// --- Type Definitions (no changes) ---
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
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  onSelectPreset: (preset: PresetItem) => void;
  onSelectTexture: (texture: Texture) => void;
  onSelectNoteTool: (shape: NoteShape) => void;
  config: {
    tools: PlotToolConfig[];
    objects: Preset[];
  };
  className?: string;
}

// --- Data (no changes) ---
const icons = {
  text: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z'%3E%3C/path%3E%3Cpath d='M12 18V6'%3E%3C/path%3E%3Cpath d='M8 6h8'%3E%3C/path%3E%3Cpath d='M8 12h8'%3E%3C/path%3E%3Cpath d='M8 18h8'%3E%3C/path%3E%3C/svg%3E",
  rectangle:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3C/svg%3E",
  oval: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cellipse cx='12' cy='12' rx='10' ry='6'%3E%3C/ellipse%3E%3C/svg%3E",
  callout:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'%3E%3C/path%3E%3C/svg%3E",
  arrow:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'%3E%3C/line%3E%3Cpolyline points='12 5 19 12 12 19'%3E%3C/polyline%3E%3C/svg%3E",
};
const noteTools: PresetCategory = {
  id: "notes-category",
  name: "Notes",
  type: "category",
  children: [
    { id: "note-text", name: "Text", type: "item", src: icons.text },
    {
      id: "note-rectangle",
      name: "Rectangle",
      type: "item",
      src: icons.rectangle,
    },
    { id: "note-oval", name: "Oval", type: "item", src: icons.oval },
    { id: "note-callout", name: "Callout", type: "item", src: icons.callout },
    { id: "note-arrow", name: "Arrow", type: "item", src: icons.arrow },
  ],
};

const ObjectMenuItem: React.FC<{
  item: Preset;
  onSelectPreset: (preset: PresetItem) => void;
  prefersHover: boolean;
}> = ({ item, onSelectPreset, prefersHover }) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleInteraction = (e: React.MouseEvent) => {
    if (!prefersHover) {
      e.stopPropagation();
      setIsSubMenuOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    if (prefersHover || !isSubMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (itemRef.current && !itemRef.current.contains(event.target as Node)) {
        setIsSubMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSubMenuOpen, prefersHover]);

  if (item.type === "item") {
    return (
      <button
        onClick={() => onSelectPreset(item)}
        className="w-full flex items-center p-2 rounded-md hover:bg-green-100 text-gray-700 transition-colors duration-150"
        title={`Add ${item.name} to canvas`}
      >
        {" "}
        <img
          src={item.src}
          alt={item.name}
          className="h-5 w-5 mr-3 object-contain"
        />
        <span className="text-sm whitespace-nowrap">{item.name}</span>{" "}
      </button>
    );
  }

  const subMenuItems = item.children?.map((child) => (
    <ObjectMenuItem
      key={child.id}
      item={child}
      onSelectPreset={onSelectPreset}
      prefersHover={prefersHover}
    />
  ));

  return (
    <div
      ref={itemRef}
      className="relative"
      onMouseEnter={() => {
        if (prefersHover) setIsSubMenuOpen(true);
      }}
      onMouseLeave={() => {
        if (prefersHover) setIsSubMenuOpen(false);
      }}
    >
      {" "}
      <div
        onClick={handleInteraction}
        className="flex items-center justify-between p-2 rounded-md hover:bg-green-100 text-gray-700 cursor-pointer"
      >
        {" "}
        <span className="text-sm font-medium whitespace-nowrap">
          {item.name}
        </span>{" "}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isSubMenuOpen && !prefersHover ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {" "}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5l7 7-7 7"
          />{" "}
        </svg>{" "}
      </div>{" "}
      {/* ✅ MODIFIED: This logic now correctly separates desktop and mobile views without affecting desktop layout */}{" "}
      {prefersHover ? (
        // --- DESKTOP (HOVER): This is the original, unchanged fly-out menu ---
        <div
          style={{ left: "95%" }}
          className={`absolute left-full top-0 ml-1 p-2 space-y-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg transition-opacity duration-200 w-max ${
            isSubMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {subMenuItems}{" "}
        </div>
      ) : (
        // --- MOBILE (CLICK): This is the new accordion menu for touch devices ---
        <div
          className={`pl-4 transition-all duration-300 ease-in-out overflow-hidden ${
            isSubMenuOpen ? "max-h-screen" : "max-h-0"
          }`}
        >
          <div className="pt-1 space-y-1">{subMenuItems}</div>{" "}
        </div>
      )}{" "}
    </div>
  );
};

const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  onSelectPreset,
  onSelectTexture,
  onSelectNoteTool,
  config,
  className,
}) => {
  const plotToolConfig = config.tools.find((t) => t.id === "plot");
  const [isPlotMenuOpen, setIsPlotMenuOpen] = useState(false); // ✅ FIXED: Default state is now `true` to assume a desktop device first. // This prevents the mobile layout from flashing on desktop screens during page load.
  const [prefersHover, setPrefersHover] = useState(true);
  const plotMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(pointer: fine)");
      setPrefersHover(mediaQuery.matches);
    }
  }, []);

  useEffect(() => {
    if (prefersHover) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        plotMenuRef.current &&
        !plotMenuRef.current.contains(event.target as Node)
      ) {
        setIsPlotMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [prefersHover]);

  const handleSelectNote = (item: PresetItem) => {
    const shape = item.id.split("-")[1] as NoteShape;
    if (shape) {
      onSelectNoteTool(shape);
    }
  };

  return (
    <div
      className={`bg-white/90 backdrop-blur-sm p-3 w-60 rounded-xl shadow-lg flex flex-col space-y-4 z-10 transition-all duration-300 ${className}`}
    >
      {" "}
      <div className="space-y-2">
        {" "}
        <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider px-2">
          Tools
        </h3>{" "}
        <button
          onClick={() => setActiveTool({ type: "select" })}
          className={`w-full flex items-center p-2 rounded-lg text-left transition-all duration-200 ${
            activeTool.type === "select"
              ? "bg-green-600 text-white shadow"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          {" "}
          <svg
            className="h-5 w-5 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11"
            />{" "}
          </svg>
          <span className="text-sm font-medium">Select & Move</span>{" "}
        </button>{" "}
        {plotToolConfig && (
          <div
            className="relative"
            ref={plotMenuRef}
            onMouseEnter={() => {
              if (prefersHover) setIsPlotMenuOpen(true);
            }}
            onMouseLeave={() => {
              if (prefersHover) setIsPlotMenuOpen(false);
            }}
          >
            {" "}
            <div
              onClick={() => {
                if (!prefersHover) setIsPlotMenuOpen(!isPlotMenuOpen);
              }}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                activeTool.type === "plot"
                  ? "bg-green-600 text-white shadow"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {" "}
              <div className="flex items-center">
                {" "}
                <svg
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {" "}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
                  />{" "}
                </svg>{" "}
                <span className="text-sm font-medium">
                  {plotToolConfig.name}
                </span>{" "}
              </div>{" "}
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isPlotMenuOpen && !prefersHover ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />{" "}
              </svg>{" "}
            </div>{" "}
            {/* ✅ MODIFIED: This logic also correctly separates desktop and mobile views */}{" "}
            {prefersHover ? (
              <div
                style={{ left: "98%" }}
                className={`absolute left-full top-0 ml-1 p-2 space-y-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg transition-all duration-200 w-max ${
                  isPlotMenuOpen
                    ? "opacity-100 pointer-events-auto"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                {" "}
                {plotToolConfig.textures.map((texture) => (
                  <button
                    key={texture.id}
                    onClick={() => {
                      onSelectTexture(texture);
                      setIsPlotMenuOpen(false);
                    }}
                    className="w-full flex items-center p-2 rounded-md hover:bg-gray-100"
                  >
                    {" "}
                    <img
                      src={texture.src}
                      alt={texture.name}
                      className="w-5 h-5 rounded-sm mr-3 object-cover"
                    />{" "}
                    <span className="text-sm">{texture.name}</span>{" "}
                  </button>
                ))}{" "}
              </div>
            ) : (
              <div
                className={`pl-4 transition-all duration-300 ease-in-out overflow-hidden ${
                  isPlotMenuOpen ? "max-h-screen" : "max-h-0"
                }`}
              >
                {" "}
                <div className="pt-2 space-y-1">
                  {" "}
                  {plotToolConfig.textures.map((texture) => (
                    <button
                      key={texture.id}
                      onClick={() => {
                        onSelectTexture(texture);
                        setIsPlotMenuOpen(false);
                      }}
                      className="w-full flex items-center p-2 rounded-md hover:bg-gray-100"
                    >
                      {" "}
                      <img
                        src={texture.src}
                        alt={texture.name}
                        className="w-5 h-5 rounded-sm mr-3 object-cover"
                      />{" "}
                      <span className="text-sm">{texture.name}</span>{" "}
                    </button>
                  ))}{" "}
                </div>{" "}
              </div>
            )}{" "}
          </div>
        )}{" "}
      </div>{" "}
      <div className="space-y-1">
        {" "}
        <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider px-2">
          Objects
        </h3>{" "}
        {config.objects.map((item) => (
          <ObjectMenuItem
            key={item.id}
            item={item}
            onSelectPreset={onSelectPreset}
            prefersHover={prefersHover}
          />
        ))}{" "}
      </div>{" "}
      <div className="space-y-1 pt-2 border-t border-gray-200">
        {" "}
        <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider px-2">
          Notes
        </h3>{" "}
        <ObjectMenuItem
          item={noteTools}
          onSelectPreset={handleSelectNote}
          prefersHover={prefersHover}
        />{" "}
      </div>{" "}
    </div>
  );
};

export default Toolbar;
