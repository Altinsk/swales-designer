// components/PresetObject.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Image as KonvaImage, Rect, Text, Group } from "react-konva";
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
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!shapeProps.src) return;
    let cancelled = false;
    setFailed(false);
    const img = new window.Image();
    img.src = shapeProps.src;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      if (!cancelled) setImage(img);
    };
    // No onerror previously - a failed icon (404/CORS/network) left `image`
    // unset forever, this component returned null forever, and since
    // nothing else in its parent Group draws a shape, the object had
    // nothing left to hit-test: it vanished from the canvas AND became
    // permanently unselectable/undeletable via a click on where it should
    // be, while still existing in placedObjects and getting saved as if
    // present.
    img.onerror = () => {
      if (!cancelled) setFailed(true);
    };
    return () => {
      cancelled = true;
    };
  }, [shapeProps.src]);

  // Use a default size if not provided
  const width = shapeProps.width || 100;
  const height = shapeProps.height || 100;

  if (!image) {
    if (!failed) return null; // still loading - unchanged behavior
    // A plain, still-selectable placeholder instead of nothing, so a
    // broken preset can at least be found and removed rather than sitting
    // as an invisible, stuck object in the project forever.
    return (
      <Group onClick={onSelect} onTap={onSelect}>
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          offsetX={width / 2}
          offsetY={height / 2}
          fill="#f3f4f6"
          stroke="#ef4444"
          strokeWidth={2}
          dash={[6, 4]}
        />
        <Text
          text="?"
          x={0}
          y={0}
          width={width}
          height={height}
          offsetX={width / 2}
          offsetY={height / 2}
          align="center"
          verticalAlign="middle"
          fontSize={Math.min(width, height) / 2}
          fill="#ef4444"
        />
      </Group>
    );
  }

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
