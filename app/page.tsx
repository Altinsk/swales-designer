// app/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import TopBar from "@/components/TopBar";
import Toolbar, { Tool, PresetItem, Texture } from "@/components/Toolbar";
import CanvasControls from "@/components/CanvasControls";
import Header from "@/components/Header";
import RightToolbar from "@/components/RightToolbar"; // Import the new toolbar

// Define a placeholder for the config structure
interface AppConfig {
  tools: any[];
  objects: any[];
  templates: any[];
}

export interface CanvasHandles {
  zoomIn: () => void;
  zoomOut: () => void;
  undo: () => void;
  redo: () => void;
  deleteSelected: () => void;
}

// Define types for visibility state
export type VisibilityToggle = "grid" | "sketch" | "items" | "notes";
export interface VisibilityState {
  grid: boolean;
  sketch: boolean;
  items: boolean;
  notes: boolean;
}

const GardenCanvas = dynamic(() => import("@/components/GardenCanvas"), {
  ssr: false,
});

export default function Home() {
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [selectedPreset, setSelectedPreset] = useState<PresetItem | null>(null);
  const [plotTexture, setPlotTexture] = useState<Texture | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const canvasRef = useRef<CanvasHandles>(null);

  // State for layer visibility, controlled by RightToolbar
  const [visibility, setVisibility] = useState<VisibilityState>({
    grid: true,
    sketch: false, // Not implemented yet
    items: true,
    notes: false, // Not implemented yet
  });

  useEffect(() => {
    fetch("/presets.json")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        if (data.tools?.[0]?.textures?.[0]) {
          setPlotTexture(data.tools[0].textures[0]);
        }
      });
  }, []);

  const handleSelectPreset = (preset: PresetItem) => {
    setActiveTool("select");
    setSelectedPreset(preset);
  };

  const handleSelectTexture = (texture: Texture) => {
    setPlotTexture(texture);
    setActiveTool("plot");
  };

  const handleObjectAdded = () => {
    setSelectedPreset(null);
  };

  const handleVisibilityChange = (key: VisibilityToggle) => {
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleZoomIn = () => canvasRef.current?.zoomIn();
  const handleZoomOut = () => canvasRef.current?.zoomOut();
  const handleUndo = () => canvasRef.current?.undo();
  const handleRedo = () => canvasRef.current?.redo();
  const handleDelete = () => canvasRef.current?.deleteSelected();

  if (!config) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-200">
        <p className="text-lg font-medium text-gray-600">Loading Planner...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="h-screen w-screen bg-gray-200 font-sans relative overflow-hidden">
        {/* The GardenCanvas now takes up the entire background */}
        <GardenCanvas
          ref={canvasRef}
          activeTool={activeTool}
          selectedPreset={selectedPreset}
          onObjectAdd={handleObjectAdded}
          setActiveTool={setActiveTool}
          plotTexture={plotTexture}
          config={config}
          visibility={visibility} // Pass visibility state to canvas
        />

        {/* All UI components are now floating on top */}
        <TopBar
          onUndo={handleUndo}
          onRedo={handleRedo}
          onDelete={handleDelete}
          templates={config.templates}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-auto"
        />

        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onSelectPreset={handleSelectPreset}
          onSelectTexture={handleSelectTexture}
          config={config}
          className="absolute top-24 left-4 z-30"
        />

        <RightToolbar
          visibility={visibility}
          onVisibilityChange={handleVisibilityChange}
          className="absolute top-24 right-4 z-30"
        />

        <CanvasControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          scaleIndicatorPixels={40}
        />
      </div>
    </>
  );
}
