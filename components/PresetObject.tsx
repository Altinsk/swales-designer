// components/PresetObject.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Image as KonvaImage } from "react-konva";
import Konva from "konva";
import { PlacedObject } from "./GardenCanvas";

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
    const img = new window.Image();
    img.src = shapeProps.src;
    img.crossOrigin = "Anonymous";
    img.onload = () => setImage(img);
  }, [shapeProps.src]);

  if (!image) {
    return null;
  }

  return (
    <KonvaImage
      ref={shapeRef}
      image={image}
      x={0}
      y={0}
      width={shapeProps.width}
      height={shapeProps.height}
      onClick={onSelect}
      onTap={onSelect}
      offsetX={shapeProps.width ? shapeProps.width / 2 : 0}
      offsetY={shapeProps.height ? shapeProps.height / 2 : 0}
    />
  );
};

export default PresetObject;
