// app/page.tsx
"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Toolbar, { Tool, Preset } from "@/components/Toolbar";

export interface CanvasHandles {
  zoomIn: () => void;
  zoomOut: () => void;
}

const GardenCanvas = dynamic(() => import("@/components/GardenCanvas"), {
  ssr: false,
});

const availablePresets: Preset[] = [
  { id: "house", src: "/house.svg", name: "House" },
  { id: "plant", src: "/plant.svg", name: "Plant" },
];

export default function Home() {
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const canvasRef = useRef<CanvasHandles>(null);

  const handleSelectPreset = (preset: Preset) => {
    setSelectedPreset(preset);
  };

  const handleObjectAdded = () => {
    setSelectedPreset(null);
    setActiveTool("select");
  };

  const handleZoomIn = () => {
    canvasRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    canvasRef.current?.zoomOut();
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-100 to-gray-300 font-sans">
      <Header />
      <div className="flex flex-grow overflow-hidden">
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          selectPreset={handleSelectPreset}
          presets={availablePresets}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="shadow-2xl rounded-xl overflow-hidden border border-gray-200">
            <GardenCanvas
              ref={canvasRef}
              activeTool={activeTool}
              selectedPreset={selectedPreset}
              onObjectAdd={handleObjectAdded}
              setActiveTool={setActiveTool}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
