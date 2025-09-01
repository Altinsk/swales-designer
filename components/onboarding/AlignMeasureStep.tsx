// components/onboarding/AlignMeasureStep.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Rect,
  Transformer,
} from "react-konva";
import useImage from "use-image";
import Konva from "konva";

interface AlignMeasureStepProps {
  imageSrc: string;
  onAddSketch: (data: {
    src: string;
    rotation: number;
    pixelScale: number; // meters per pixel
  }) => void;
  onClose: () => void;
}

const RULER_IMAGE_HEIGHT = 50;
const CONTAINER_HEIGHT = 400; // Fixed height for the container

const AlignMeasureStep: React.FC<AlignMeasureStepProps> = ({
  imageSrc,
  onAddSketch,
  onClose,
}) => {
  const [bgImage] = useImage(imageSrc);
  const [rulerTileImage] = useImage("/ruler.png");
  const [bgRotation, setBgRotation] = useState(0);
  const [rulerLength, setRulerLength] = useState("10");
  const [zoom, setZoom] = useState(1);
  const [imageLayerPos, setImageLayerPos] = useState({ x: 0, y: 0 }); // Manages position of the image layer

  const [rulerNode, setRulerNode] = useState({
    x: 150,
    y: 150,
    width: 300,
    rotation: 0,
  });
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [imageNode, setImageNode] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [inputPos, setInputPos] = useState({ top: 0, left: 0, visible: false });

  const rectRef = useRef<Konva.Rect>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bgImage && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = CONTAINER_HEIGHT;

      if (containerWidth === 0) return;

      setStageSize({ width: containerWidth, height: containerHeight });

      const isSideways = bgRotation % 180 !== 0;
      const sourceWidth = isSideways ? bgImage.height : bgImage.width;
      const sourceHeight = isSideways ? bgImage.width : bgImage.height;

      const imgRatio = sourceWidth / sourceHeight;
      const contRatio = containerWidth / containerHeight;
      let imgDisplayWidth, imgDisplayHeight;

      if (imgRatio > contRatio) {
        imgDisplayWidth = containerWidth;
        imgDisplayHeight = containerWidth / imgRatio;
      } else {
        imgDisplayHeight = containerHeight;
        imgDisplayWidth = containerHeight * imgRatio;
      }

      const zoomedWidth = imgDisplayWidth * zoom;
      const zoomedHeight = imgDisplayHeight * zoom;

      // This positions the image centered inside its own layer
      setImageNode({
        width: zoomedWidth,
        height: zoomedHeight,
        x: (containerWidth - zoomedWidth) / 2,
        y: (containerHeight - zoomedHeight) / 2,
      });

      // Initialize ruler position only once
      if (rulerNode.x === 150 && rulerNode.y === 150) {
        const initialWidth = containerWidth * 0.75;
        setRulerNode((prev) => ({
          ...prev,
          width: initialWidth,
          x: containerWidth / 2,
          y: containerHeight / 2,
        }));
      }
    }
  }, [bgImage, bgRotation, containerRef.current?.clientWidth, zoom]);

  const updateInputPosition = () => {
    if (rectRef.current) {
      const node = rectRef.current;
      const box = node.getClientRect();
      setInputPos({
        top: box.y + box.height + 10,
        left: box.x + box.width / 2,
        visible: true,
      });
    }
  };

  useEffect(() => {
    if (rectRef.current && trRef.current) {
      trRef.current.nodes([rectRef.current]);
      trRef.current.getLayer()?.batchDraw();
      updateInputPosition();
    }
  }, [rulerNode]);

  const handleAddClick = () => {
    const realWorldLengthM = parseFloat(rulerLength);
    if (!bgImage || isNaN(realWorldLengthM) || realWorldLengthM <= 0) {
      console.error("Please enter a valid length greater than 0.");
      return;
    }

    const rulerWidthOnStagePx = rulerNode.width;
    const isSideways = bgRotation % 180 !== 0;
    const originalImageWidthForScaling = isSideways
      ? bgImage.height
      : bgImage.width;
    const displayedImageWidthOnStage = imageNode.width;
    const scaleFactor =
      displayedImageWidthOnStage / originalImageWidthForScaling;
    const rulerWidthOnOriginalImagePx = rulerWidthOnStagePx / scaleFactor;
    const pixelScale = realWorldLengthM / rulerWidthOnOriginalImagePx;

    onAddSketch({
      src: imageSrc,
      rotation: bgRotation,
      pixelScale,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <p className="text-gray-600 my-4">
        Pan the image underneath the ruler. Align, rotate, and resize the ruler
        to a known length, then enter that length below it.
      </p>
      <div
        ref={containerRef}
        className="bg-gray-900 my-4 relative flex justify-center items-center overflow-hidden cursor-grab"
        style={{ height: `${CONTAINER_HEIGHT}px` }}
      >
        {bgImage && stageSize.width > 0 && (
          <Stage width={stageSize.width} height={stageSize.height}>
            {/* Layer 1: Draggable Image Layer */}
            <Layer
              draggable
              x={imageLayerPos.x}
              y={imageLayerPos.y}
              onDragEnd={(e) => {
                setImageLayerPos(e.target.position());
              }}
            >
              <KonvaImage
                image={bgImage}
                width={imageNode.width}
                height={imageNode.height}
                rotation={bgRotation}
                offsetX={imageNode.width / 2}
                offsetY={imageNode.height / 2}
                x={imageNode.x + imageNode.width / 2}
                y={imageNode.y + imageNode.height / 2}
              />
            </Layer>

            {/* Layer 2: Static Ruler/UI Layer */}
            <Layer>
              <Rect
                ref={rectRef}
                x={rulerNode.x}
                y={rulerNode.y}
                width={rulerNode.width}
                height={RULER_IMAGE_HEIGHT}
                rotation={rulerNode.rotation}
                offsetX={rulerNode.width / 2}
                offsetY={RULER_IMAGE_HEIGHT / 2}
                fillPatternImage={rulerTileImage}
                fillPatternRepeat="repeat-x"
                opacity={0.75}
                draggable
                onDragMove={updateInputPosition}
                onDragEnd={(e) => {
                  setRulerNode((prev) => ({
                    ...prev,
                    x: e.target.x(),
                    y: e.target.y(),
                  }));
                }}
                onTransform={updateInputPosition}
                onTransformEnd={() => {
                  if (rectRef.current) {
                    const node = rectRef.current;
                    const scaleX = node.scaleX();
                    node.scaleX(1);
                    node.scaleY(1);
                    setRulerNode({
                      x: node.x(),
                      y: node.y(),
                      width: Math.max(20, node.width() * scaleX),
                      rotation: node.rotation(),
                    });
                  }
                }}
              />
              <Transformer
                ref={trRef}
                rotateEnabled={true}
                keepRatio={false}
                ignoreStroke={true}
                enabledAnchors={["middle-left", "middle-right"]}
                anchorStroke="white"
                anchorFill="#00AEEF"
                anchorSize={10}
                borderStroke="#00AEEF"
                borderDash={[3, 3]}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 20) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            </Layer>
          </Stage>
        )}
        {inputPos.visible && (
          <div
            className="absolute bg-white p-2 rounded-lg shadow-md flex items-center"
            style={{
              top: `${inputPos.top}px`,
              left: `${inputPos.left}px`,
              transform: "translateX(-50%)",
              pointerEvents: "auto",
            }}
          >
            <input
              type="number"
              value={rulerLength}
              onChange={(e) => setRulerLength(e.target.value)}
              className="w-20 text-center border rounded-md p-1"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="ml-2 font-semibold">m</span>
          </div>
        )}
      </div>
      <div className="flex justify-center items-center gap-4 my-4">
        <button
          onClick={() => setZoom((z) => Math.max(0.2, z / 1.2))}
          className="p-2 border rounded-full hover:bg-gray-100"
          title="Zoom Out"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z" />
          </svg>
        </button>
        <button
          onClick={() => setBgRotation((r) => (r + 90) % 360)}
          className="p-2 border rounded-full hover:bg-gray-100"
          title="Rotate Background"
        >
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path
              fillRule="evenodd"
              d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"
            />
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
          </svg>
        </button>
        <button
          onClick={() => setZoom((z) => Math.min(5, z * 1.2))}
          className="p-2 border rounded-full hover:bg-gray-100"
          title="Zoom In"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
          </svg>
        </button>
      </div>
      <div className="mt-8 flex justify-end items-center gap-4">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-full text-gray-700 border border-gray-300 hover:bg-gray-100"
        >
          Close
        </button>
        <button
          onClick={handleAddClick}
          className="px-6 py-2 rounded-full bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors"
        >
          Add sketch
        </button>
      </div>
    </div>
  );
};

export default AlignMeasureStep;
