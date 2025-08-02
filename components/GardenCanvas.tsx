// components/GardenCanvas.tsx
"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Stage,
  Layer,
  Line,
  Circle,
  Text,
  Transformer,
  Group,
} from "react-konva";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Tool, Preset } from "./Toolbar";
import PresetObject from "./PresetObject";
import { CanvasHandles } from "@/app/page";

// --- Configuration ---
const PIXELS_PER_METER = 40;
const GRID_SIZE = PIXELS_PER_METER;
const INITIAL_PRESET_SIZE = 100;
const MIN_FONT_SIZE = 10;
const LABEL_OFFSET = 20;

// --- Type Definitions ---
export interface Point {
  x: number;
  y: number;
}
export interface Polygon {
  id: string;
  points: number[];
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}
export interface PlacedObject extends Preset {
  x: number;
  y: number;
  id: string;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  width?: number;
  height?: number;
}
type HistoryState = { polygons: Polygon[]; placedObjects: PlacedObject[] };
type SideMeasurement = {
  length: number;
  midX: number;
  midY: number;
  angle: number;
};

// --- Helper Functions ---
const formatMeasurement = (pixels: number) =>
  `${(pixels / PIXELS_PER_METER).toFixed(2)} m`;
const calculateDistance = (p1: Point, p2: Point) =>
  Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
const calculateMidpointAndAngle = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { midX: number; midY: number; angle: number } => {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  return { midX, midY, angle };
};
const getFontSize = (stageScale: number) =>
  Math.max(12 / stageScale, MIN_FONT_SIZE);

// --- Main Component ---
const GardenCanvas = forwardRef<
  CanvasHandles,
  {
    activeTool: Tool;
    selectedPreset: Preset | null;
    onObjectAdd: () => void;
    setActiveTool: (tool: Tool) => void;
  }
>(({ activeTool, selectedPreset, onObjectAdd, setActiveTool }, ref) => {
  // Core object states
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);

  // UI/Interaction states
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });
  const [currentPoints, setCurrentPoints] = useState<number[]>([]);
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
  const [selectedId, selectShape] = useState<string | null>(null);
  const [grassPattern, setGrassPattern] = useState<
    HTMLImageElement | undefined
  >();
  const [stage, setStage] = useState({ scale: 1, x: 0, y: 0 });
  const [sideMeasurements, setSideMeasurements] = useState<SideMeasurement[]>(
    []
  );

  // History state for Undo
  const [history, setHistory] = useState<HistoryState[]>([
    { polygons: [], placedObjects: [] },
  ]);
  const [historyStep, setHistoryStep] = useState(0);

  // Refs
  const trRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);

  // --- HISTORY MANAGEMENT ---
  const saveStateToHistory = useCallback(() => {
    const currentHistory = history.slice(0, historyStep + 1);
    const lastState = currentHistory[currentHistory.length - 1];
    if (
      JSON.stringify(lastState) !== JSON.stringify({ polygons, placedObjects })
    ) {
      currentHistory.push({ polygons, placedObjects });
      setHistory(currentHistory);
      setHistoryStep(currentHistory.length - 1);
    }
  }, [history, historyStep, polygons, placedObjects]);

  const handleUndo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      const prevState = history[newStep];
      setPolygons(prevState.polygons);
      setPlacedObjects(prevState.placedObjects);
      setHistoryStep(newStep);
      selectShape(null);
    }
  };

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    setPolygons((polygons) => polygons.filter((p) => p.id !== selectedId));
    setPlacedObjects((placedObjects) =>
      placedObjects.filter((o) => o.id !== selectedId)
    );
    selectShape(null);
    setSideMeasurements([]);
  }, [selectedId]);

  // --- LIFECYCLE & EVENT HANDLERS ---
  useEffect(() => {
    const image = new window.Image();
    image.src = "/grass.jpg";
    image.crossOrigin = "Anonymous";
    image.onload = () => setGrassPattern(image);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(saveStateToHistory, 500);
    return () => clearTimeout(timeoutId);
  }, [polygons, placedObjects, saveStateToHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        handleDelete();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleDelete, selectedId]);

  useEffect(() => {
    const handleResize = () =>
      setDimensions({
        width: window.innerWidth - 256 - 48,
        height: window.innerHeight - 64 - 32,
      });
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Place preset object at the center when selectedPreset changes
  useEffect(() => {
    if (selectedPreset) {
      const stage = stageRef.current;
      if (!stage) return;
      const { width, height } = dimensions;
      const centerX = (width / 2 - stage.x()) / stage.scaleX();
      const centerY = (height / 2 - stage.y()) / stage.scaleY();
      const newObject: PlacedObject = {
        ...selectedPreset,
        id: `${selectedPreset.id}_${Date.now()}`,
        x: centerX,
        y: centerY,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        width: INITIAL_PRESET_SIZE,
        height: INITIAL_PRESET_SIZE,
      };
      setPlacedObjects((prev) => [...prev, newObject]);
      onObjectAdd();
      selectShape(newObject.id);
    }
  }, [selectedPreset, dimensions, onObjectAdd]);

  const calculateSideMeasurements = (poly: Polygon) => {
    const points = poly.points;
    const measurements: SideMeasurement[] = [];
    for (let i = 0; i < points.length; i += 2) {
      const x1 = points[i];
      const y1 = points[i + 1];
      const x2 = points[(i + 2) % points.length];
      const y2 = points[(i + 3) % points.length];
      const length = calculateDistance({ x: x1, y: y1 }, { x: x2, y: y2 });
      const { midX, midY, angle } = calculateMidpointAndAngle(x1, y1, x2, y2);
      measurements.push({ length, midX, midY, angle });
    }
    return measurements;
  };

  useEffect(() => {
    const transformer = trRef.current;
    const selectedNode = stageRef.current?.findOne("#" + selectedId);
    if (transformer && selectedNode) {
      transformer.nodes([selectedNode]);
      const selectedPoly = polygons.find((p) => p.id === selectedId);
      if (selectedPoly) {
        setSideMeasurements(calculateSideMeasurements(selectedPoly));
      } else {
        setSideMeasurements([]);
      }
    } else if (transformer) {
      transformer.nodes([]);
      setSideMeasurements([]);
    }
    transformer?.getLayer()?.batchDraw();
  }, [selectedId, polygons]);

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = e.target.getStage();
    if (!stage) return;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setStage({
      scale: newScale,
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleStageDrag = (e: KonvaEventObject<DragEvent>) => {
    if (e.target !== e.target.getStage()) {
      e.cancelBubble = true;
      return;
    }
    const stageNode = e.target as Konva.Stage;
    setStage({
      scale: stageNode.scaleX(),
      x: stageNode.x(),
      y: stageNode.y(),
    });
  };

  const handleObjectDragStart = (e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
  };

  const handleObjectDragEnd = (e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    const node = e.target;
    const id = node.id();
    setPolygons((currentPolygons) =>
      currentPolygons.map((p) =>
        p.id === id ? { ...p, x: node.x(), y: node.y() } : p
      )
    );
    setPlacedObjects((currentObjects) =>
      currentObjects.map((o) =>
        o.id === id ? { ...o, x: node.x(), y: node.y() } : o
      )
    );
  };

  const handleTransformEnd = (e: KonvaEventObject<Event>) => {
    e.cancelBubble = true;
    const node = e.target;
    const id = node.id();
    setPolygons((polygons) =>
      polygons.map((p) =>
        p.id === id
          ? {
              ...p,
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
              scaleX: node.scaleX(),
              scaleY: node.scaleY(),
            }
          : p
      )
    );
    setPlacedObjects((placedObjects) =>
      placedObjects.map((o) =>
        o.id === id
          ? {
              ...o,
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
              scaleX: node.scaleX(),
              scaleY: node.scaleY(),
            }
          : o
      )
    );
    const selectedPoly = polygons.find((p) => p.id === id);
    if (selectedPoly) {
      setSideMeasurements(calculateSideMeasurements(selectedPoly));
    }
  };

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      setStage((s) => ({ ...s, scale: s.scale * 1.2 }));
    },
    zoomOut: () => {
      setStage((s) => ({ ...s, scale: s.scale / 1.2 }));
    },
  }));

  const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (e.target === e.target.getStage()) {
      selectShape(null);
    }
  };

  const handleCanvasClick = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage || e.target !== stage) return;
    const pos = stage.getRelativePointerPosition();
    if (!pos) return;

    if (activeTool === "plot") {
      if (currentPoints.length >= 6) {
        const startPoint: Point = { x: currentPoints[0], y: currentPoints[1] };
        if (calculateDistance(startPoint, pos) < 15 / stage.scaleX()) {
          const newPolygon: Polygon = {
            id: `poly_${Date.now()}`,
            points: [...currentPoints],
            x: 0,
            y: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
          };
          setPolygons((prev) => [...prev, newPolygon]);
          setCurrentPoints([]);
          selectShape(newPolygon.id);
          setActiveTool("select"); // Switch to select tool after plotting
          return;
        }
      }
      setCurrentPoints((prev) => [...prev, pos.x, pos.y]);
    }
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const pos = e.target.getStage()?.getRelativePointerPosition();
    if (pos) setMousePos(pos);
  };

  const renderGrid = () => {
    const lines = [];
    const { width, height } = dimensions;
    const { scale, x, y } = stage;

    const topLeft = { x: -x / scale, y: -y / scale };
    const bottomRight = { x: (width - x) / scale, y: (height - y) / scale };

    const startCellX = Math.floor(topLeft.x / GRID_SIZE);
    const endCellX = Math.ceil(bottomRight.x / GRID_SIZE);
    const startCellY = Math.floor(topLeft.y / GRID_SIZE);
    const endCellY = Math.ceil(bottomRight.y / GRID_SIZE);

    for (let i = startCellX; i <= endCellX; i++) {
      lines.push(
        <Line
          key={`v${i}`}
          points={[i * GRID_SIZE, topLeft.y, i * GRID_SIZE, bottomRight.y]}
          stroke="#d1d5db"
          strokeWidth={1 / scale}
        />
      );
    }

    for (let j = startCellY; j <= endCellY; j++) {
      lines.push(
        <Line
          key={`h${j}`}
          points={[topLeft.x, j * GRID_SIZE, bottomRight.x, j * GRID_SIZE]}
          stroke="#d1d5db"
          strokeWidth={1 / scale}
        />
      );
    }
    return lines;
  };

  // --- RENDER ---
  return (
    <div className="flex-grow bg-white overflow-auto cursor-auto rounded-lg shadow-xl border border-gray-200">
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={checkDeselect}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        ref={stageRef}
        scaleX={stage.scale}
        scaleY={stage.scale}
        x={stage.x}
        y={stage.y}
        draggable={activeTool === "select"}
        onDragMove={handleStageDrag}
        onDragEnd={handleStageDrag}
      >
        <Layer listening={false}>{renderGrid()}</Layer>
        <Layer>
          {/* Plotting UI */}
          {activeTool === "plot" && (
            <>
              {currentPoints.length >= 2 && (
                <Group listening={false}>
                  <Line
                    points={[
                      currentPoints[currentPoints.length - 2],
                      currentPoints[currentPoints.length - 1],
                      mousePos.x,
                      mousePos.y,
                    ]}
                    stroke="black"
                    strokeWidth={2 / stage.scale}
                    dash={[4, 4]}
                  />
                  <Text
                    x={
                      (currentPoints[currentPoints.length - 2] + mousePos.x) /
                        2 +
                      5 / stage.scale
                    }
                    y={
                      (currentPoints[currentPoints.length - 1] + mousePos.y) / 2
                    }
                    text={formatMeasurement(
                      calculateDistance(
                        {
                          x: currentPoints[currentPoints.length - 2],
                          y: currentPoints[currentPoints.length - 1],
                        },
                        mousePos
                      )
                    )}
                    fontSize={getFontSize(stage.scale)}
                    fill="black"
                  />
                </Group>
              )}
              {currentPoints.length >= 4 && (
                <Line
                  points={[...currentPoints, mousePos.x, mousePos.y]}
                  fillPatternImage={grassPattern}
                  fillPatternScale={{ x: 0.2, y: 0.2 }}
                  closed
                  stroke="darkgreen"
                  strokeWidth={1}
                  opacity={0.5}
                  listening={false}
                />
              )}
              <Line
                points={currentPoints}
                stroke="black"
                strokeWidth={2 / stage.scale}
                listening={false}
              />
              {currentPoints.map((_, i) =>
                i % 2 === 0 ? (
                  <Circle
                    key={`point_${i}`}
                    x={currentPoints[i]}
                    y={currentPoints[i + 1]}
                    radius={5 / stage.scale}
                    fill="black"
                    listening={false}
                  />
                ) : null
              )}
            </>
          )}

          {/* Plotted Polygons with Side Measurements */}
          {polygons.map((poly) => (
            <Group
              key={poly.id}
              id={poly.id}
              x={poly.x}
              y={poly.y}
              rotation={poly.rotation}
              scaleX={poly.scaleX}
              scaleY={poly.scaleY}
              draggable={activeTool === "select"}
              onClick={() => selectShape(poly.id)}
              onTap={() => selectShape(poly.id)}
              onDragStart={handleObjectDragStart}
              onDragEnd={handleObjectDragEnd}
              onTransformEnd={handleTransformEnd}
            >
              <Line
                points={poly.points}
                fillPatternImage={grassPattern}
                fillPatternScale={{ x: 0.2, y: 0.2 }}
                closed
                stroke="darkgreen"
                strokeWidth={2 / stage.scale}
              />
              {poly.id === selectedId &&
                sideMeasurements.map((measurement, index) => {
                  const fontSize = getFontSize(stage.scale);
                  const text = formatMeasurement(
                    measurement.length * poly.scaleX
                  );

                  // Get the two points defining the side
                  const x1 = poly.points[index * 2];
                  const y1 = poly.points[index * 2 + 1];
                  const x2 = poly.points[(index * 2 + 2) % poly.points.length];
                  const y2 = poly.points[(index * 2 + 3) % poly.points.length];

                  // Calculate midpoint and angle
                  const { midX, midY, angle } = calculateMidpointAndAngle(
                    x1,
                    y1,
                    x2,
                    y2
                  );
                  const angleRad = (angle * Math.PI) / 180;

                  // Calculate the outward normal vector
                  const dx = x2 - x1;
                  const dy = y2 - y1;
                  // Normal vector perpendicular to the side (rotated 90 degrees clockwise)
                  let normalX = -dy;
                  let normalY = dx;
                  // Normalize the vector
                  const length = Math.sqrt(
                    normalX * normalX + normalY * normalY
                  );
                  if (length > 0) {
                    normalX /= length;
                    normalY /= length;
                  }

                  // Determine if the normal is pointing inward or outward by checking the polygon's center
                  const polyCenterX =
                    poly.points.reduce(
                      (sum, val, i) => (i % 2 === 0 ? sum + val : sum),
                      0
                    ) /
                    (poly.points.length / 2);
                  const polyCenterY =
                    poly.points.reduce(
                      (sum, val, i) => (i % 2 === 1 ? sum + val : sum),
                      0
                    ) /
                    (poly.points.length / 2);
                  const toCenterX = polyCenterX - midX;
                  const toCenterY = polyCenterY - midY;
                  // Dot product to check if normal points toward center (inward)
                  const dotProduct = normalX * toCenterX + normalY * toCenterY;
                  // If dot product is positive, normal points inward, so flip it
                  if (dotProduct > 0) {
                    normalX = -normalX;
                    normalY = -normalY;
                  }

                  // Position text outside using the normal vector
                  const labelOffset = LABEL_OFFSET / stage.scale;
                  const textX = midX + normalX * labelOffset;
                  const textY = midY + normalY * labelOffset;

                  return (
                    <Text
                      key={`measurement_${index}`}
                      x={textX}
                      y={textY}
                      text={text}
                      fontSize={fontSize}
                      fill="black"
                      align="center"
                      verticalAlign="middle"
                      rotation={angle}
                      offsetX={text.length * (fontSize * 0.3)} // Approximate half text width
                      offsetY={fontSize / 2}
                      listening={false}
                    />
                  );
                })}
            </Group>
          ))}

          {/* Preset Objects with Sticky Measurements */}
          {placedObjects.map((obj) => {
            const width = obj.width || INITIAL_PRESET_SIZE;
            const height = obj.height || INITIAL_PRESET_SIZE;
            const fontSize = getFontSize(stage.scale);
            return (
              <Group
                key={obj.id}
                id={obj.id}
                x={obj.x}
                y={obj.y}
                rotation={obj.rotation || 0}
                scaleX={obj.scaleX || 1}
                scaleY={obj.scaleY || 1}
                draggable={activeTool === "select"}
                onClick={() => selectShape(obj.id)}
                onTap={() => selectShape(obj.id)}
                onDragStart={handleObjectDragStart}
                onDragEnd={handleObjectDragEnd}
                onTransformEnd={handleTransformEnd}
              >
                <PresetObject
                  shapeProps={obj}
                  onSelect={() => selectShape(obj.id)}
                />
                {obj.id === selectedId && (
                  <>
                    {/* Measurement Labels */}
                    <Text
                      text={formatMeasurement(width * (obj.scaleX || 1))}
                      fontSize={fontSize}
                      fill="black"
                      x={-width / 2}
                      y={-height / 2 - LABEL_OFFSET / stage.scale}
                      width={width}
                      align="center"
                      listening={false}
                    />
                    <Text
                      text={formatMeasurement(width * (obj.scaleX || 1))}
                      fontSize={fontSize}
                      fill="black"
                      x={-width / 2}
                      y={height / 2 + 5 / stage.scale}
                      width={width}
                      align="center"
                      listening={false}
                    />
                    <Text
                      text={formatMeasurement(height * (obj.scaleY || 1))}
                      fontSize={fontSize}
                      fill="black"
                      x={-width / 2 - 60 / stage.scale}
                      y={-height / 2}
                      width={55 / stage.scale}
                      height={height}
                      align="right"
                      verticalAlign="middle"
                      listening={false}
                    />
                    <Text
                      text={formatMeasurement(height * (obj.scaleY || 1))}
                      fontSize={fontSize}
                      fill="black"
                      x={width / 2 + 5 / stage.scale}
                      y={-height / 2}
                      width={55 / stage.scale}
                      height={height}
                      align="left"
                      verticalAlign="middle"
                      listening={false}
                    />
                  </>
                )}
              </Group>
            );
          })}

          <Transformer
            ref={trRef}
            rotateEnabled={true}
            flipEnabled={false}
            anchorSize={10 / stage.scale}
            borderStrokeWidth={2 / stage.scale}
            rotateAnchorOffset={20 / stage.scale}
          />
        </Layer>
      </Stage>
    </div>
  );
});

GardenCanvas.displayName = "GardenCanvas";
export default GardenCanvas;
