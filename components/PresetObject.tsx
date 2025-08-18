// components/PresetObject.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Image as KonvaImage } from "react-konva";
import Konva from "konva";
import { PlacedObject } from "./GardenCanvas"; // Assuming type is exported from GardenCanvas

interface PresetObjectProps {
  shapeProps: PlacedObject;
  onSelect: () => void;
}

const PresetObject: React.FC<PresetObjectProps> = ({
  shapeProps,
  onSelect,
}) => {
  const shapeRef = useRef<Konva.Image>(null);
  const [image, setImage] = useState<HTMLImageElement | undefined>();

  useEffect(() => {
    if (!shapeProps.src) return;
    const img = new window.Image();
    img.src = shapeProps.src;
    img.crossOrigin = "Anonymous";
    img.onload = () => setImage(img);
  }, [shapeProps.src]);

  if (!image) {
    return null; // Don't render anything until the image is loaded
  }

  // Use a default size if not provided
  const width = shapeProps.width || 100;
  const height = shapeProps.height || 100;

  return (
    <KonvaImage
      ref={shapeRef}
      image={image}
      x={0}
      y={0}
      width={width}
      height={height}
      onClick={onSelect}
      onTap={onSelect}
      // Set offset to center the image on its x/y coordinates
      offsetX={width / 2}
      offsetY={height / 2}
    />
  );
};

export default PresetObject;
