"use-client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  memo,
  useMemo,
  useLayoutEffect,
} from "react";
import {
  Stage,
  Layer,
  Line,
  Circle,
  Text,
  Transformer,
  Group,
  Path,
  Rect,
  Ellipse,
  Arrow,
  Label,
  Tag,
} from "react-konva";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { PresetItem, Texture } from "./Toolbar"; // Import types
import PresetObject from "./PresetObject"; // Import the actual component
import { ActiveTool, NoteShape, VisibilityState } from "@/app/page"; // Import visibility state type
import { Image as KonvaImage } from "react-konva"; // Add KonvaImage import
import useImage from "use-image";

// --- Configuration ---
const PIXELS_PER_METER = 40;
const GRID_SIZE = PIXELS_PER_METER;
const INITIAL_PRESET_SIZE = 100;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 13;
const SNAP_THRESHOLD = 6;
const ANGLE_SNAP_THRESHOLD = 8;
const CLOSE_THRESHOLD = 15;
const ANGLE_TEXT_OFFSET = 50;
const MIN_EFFECTIVE_SCALE = 1.2;
const GUIDE_HIDE_THRESHOLD = 20;
const ICON_SIZE = 40;
const ICON_SPACING = 8;

const lockIconPath =
  "M5.25 9.30277V8C5.25 4.27208 8.27208 1.25 12 1.25C15.7279 1.25 18.75 4.27208 18.75 8V9.30277C18.9768 9.31872 19.1906 9.33948 19.3918 9.36652C20.2919 9.48754 21.0497 9.74643 21.6517 10.3483C22.2536 10.9503 22.5125 11.7081 22.6335 12.6082C22.75 13.4752 22.75 14.5775 22.75 15.9451V16.0549C22.75 17.4225 22.75 18.5248 22.6335 19.3918C22.5125 20.2919 22.2536 21.0497 21.6517 21.6516C21.0497 22.2536 20.2919 22.5125 19.3918 22.6335C18.5248 22.75 17.4225 22.75 16.0549 22.75H7.94513C6.57754 22.75 5.47522 22.75 4.60825 22.6335C3.70814 22.5125 2.95027 22.2536 2.34835 21.6516C1.74643 21.0497 1.48754 20.2919 1.36652 19.3918C1.24996 18.5248 1.24998 17.4225 1.25 16.0549V15.9451C1.24998 14.5775 1.24996 13.4752 1.36652 12.6082C1.48754 11.7081 1.74643 10.9503 2.34835 10.3483C2.95027 9.74643 3.70814 9.48754 4.60825 9.36652C4.80938 9.33948 5.02317 9.31872 5.25 9.30277ZM6.75 8C6.75 5.10051 9.10051 2.75 12 2.75C14.8995 2.75 17.25 5.10051 17.25 8V9.25344C16.8765 9.24999 16.4784 9.24999 16.0549 9.25H7.94513C7.52161 9.24999 7.12353 9.24999 6.75 9.25344V8ZM3.40901 11.409C3.68577 11.1322 4.07435 10.9518 4.80812 10.8531C5.56347 10.7516 6.56459 10.75 8 10.75H16C17.4354 10.75 18.4365 10.7516 19.1919 10.8531C19.9257 10.9518 20.3142 11.1322 20.591 11.409C20.8678 11.6858 21.0482 12.0743 21.1469 12.8081C21.2484 13.5635 21.25 14.5646 21.25 16C21.25 17.4354 21.2484 18.4365 21.1469 19.1919C21.0482 19.9257 20.8678 20.3142 20.591 20.591C20.3142 20.8678 19.9257 21.0482 19.1919 21.1469C18.4365 21.2484 17.4354 21.25 16 21.25H8C6.56459 21.25 5.56347 21.2484 4.80812 21.1469C4.07435 21.0482 3.68577 20.8678 3.40901 20.591C3.13225 20.3142 2.9518 19.9257 2.85315 19.1919C2.75159 18.4365 2.75 17.4354 2.75 16C2.75 14.5646 2.75159 13.5635 2.85315 12.8081C2.9518 12.0743 3.13225 11.6858 3.40901 11.409Z";
const unlockIconPath =
  "M6.75 8C6.75 5.10051 9.10051 2.75 12 2.75C14.4453 2.75 16.5018 4.42242 17.0846 6.68694C17.1879 7.08808 17.5968 7.32957 17.9979 7.22633C18.3991 7.12308 18.6405 6.7142 18.5373 6.31306C17.788 3.4019 15.1463 1.25 12 1.25C8.27208 1.25 5.25 4.27208 5.25 8V9.30277C5.02317 9.31872 4.80938 9.33948 4.60825 9.36652C3.70814 9.48754 2.95027 9.74643 2.34835 10.3483C1.74643 10.9503 1.48754 11.7081 1.36652 12.6082C1.24996 13.4752 1.24998 14.5775 1.25 15.9451V16.0549C1.24998 17.4225 1.24996 18.5248 1.36652 19.3918C1.48754 20.2919 1.74643 21.0497 2.34835 21.6516C2.95027 22.2536 3.70814 22.5125 4.60825 22.6335C5.47522 22.75 6.57754 22.75 7.94513 22.75H16.0549C17.4225 22.75 18.5248 22.75 19.3918 22.6335C20.2919 22.5125 21.0497 22.2536 21.6517 21.6516C22.2536 21.0497 22.5125 20.2919 22.6335 19.3918C22.75 18.5248 22.75 17.4225 22.75 16.0549V15.9451C22.75 14.5775 22.75 13.4752 22.6335 12.6082C22.5125 11.7081 22.2536 10.9503 21.6517 10.3483C21.0497 9.74643 20.2919 9.48754 19.3918 9.36652C18.5248 9.24996 17.4225 9.24998 16.0549 9.25H7.94513C7.52161 9.24999 7.12353 9.24999 6.75 9.25344V8ZM3.40901 11.409C3.68577 11.1322 4.07435 10.9518 4.80812 10.8531C5.56347 10.7516 6.56459 10.75 8 10.75H16C17.4354 10.75 18.4365 10.7516 19.1919 10.8531C19.9257 10.9518 20.3142 11.1322 20.591 11.409C20.8678 11.6858 21.0482 12.0743 21.1469 12.8081C21.2484 13.5635 21.25 14.5646 21.25 16C21.25 17.4354 21.2484 18.4365 21.1469 19.1919C21.0482 19.9257 20.8678 20.3142 20.591 20.591C20.3142 20.8678 19.9257 21.0482 19.1919 21.1469C18.4365 21.2484 17.4354 21.25 16 21.25H8C6.56459 21.25 5.56347 21.2484 4.80812 21.1469C4.07435 21.0482 3.68577 20.8678 3.40901 20.591C3.13225 20.3142 2.9518 19.9257 2.85315 19.1919C2.75159 18.4365 2.75 17.4354 2.75 16C2.75 14.5646 2.75159 13.5635 2.85315 12.8081C2.9518 12.0743 3.13225 11.6858 3.40901 11.409Z";
const settingsIconPath =
  "M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84 c-0.24,0-0.44,0.17-0.48,0.41L9.18,5.05C8.59,5.29,8.06,5.62,7.56,5.99L5.17,5.03C4.95,4.95,4.7,5.02,4.58,5.24l-1.92,3.32 c-0.12,0.22-0.07,0.47,0.12,0.61l2.03,1.58C4.74,11.36,4.72,11.68,4.72,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.42,2.24 c0.04,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.48,0.41l0.42-2.24c0.59-0.24,1.12-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0.01,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z";

// --- Type Definitions ---
type Tool = "select" | "plot";
export interface Point {
  id?: string;
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
  locked?: boolean;
  textureId?: string; // To store the selected texture
}
export interface PlacedObject extends PresetItem {
  x: number;
  y: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  width?: number;
  height?: number;
  locked?: boolean;
}

export interface PlanningSketch {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  pixelScale: number; // meters per pixel
  locked: boolean;
  zIndex: number;
}
type HistoryState = {
  polygons: Polygon[];
  placedObjects: PlacedObject[];
  notes: NoteObject[];
};
type SnapDetails = {
  isSnapped: boolean;
  point: Point;
  isLineSnap: boolean;
  isAngleSnap: boolean;
};
type AngleGuideInfo = {
  id: string;
  type: "angle";
  text: string;
  angle: number;
  p1: Point;
  vertex: Point;
  p3: Point;
};
type LengthGuideInfo = {
  id: string;
  type: "length";
  text: string;
  p1: Point;
  p2: Point;
};
type PlottingGuide = AngleGuideInfo | LengthGuideInfo;

export type NoteColor = "gray" | "blue" | "yellow";
export interface NoteObject {
  id: string;
  type: NoteShape;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  fill: NoteColor;
  locked: boolean;
  points?: number[]; // For arrow
  text?: string; // For text and callout
  pointerDirection?: "up" | "down";
  offsetX?: number;
  offsetY?: number;
}

// --- Helper Functions ---
const formatMeasurement = (pixels: number) =>
  `${(pixels / PIXELS_PER_METER).toFixed(2)} m`;
const calculateDistance = (p1: Point, p2: Point) =>
  Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
const calculateAngle = (p1: Point, p2: Point, p3: Point): number => {
  const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
  const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
  let angle = (angle2 - angle1) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  if (angle > 180) angle = 360 - angle;
  return angle;
};
const getFontSize = (stageScale: number) =>
  Math.min(Math.max(14 / stageScale, MIN_FONT_SIZE), MAX_FONT_SIZE);
const vSub = (p1: Point, p2: Point) => ({ x: p1.x - p2.x, y: p1.y - p2.y });
const vAdd = (p1: Point, p2: Point) => ({ x: p1.x + p2.x, y: p1.y + p2.y });
const vScale = (p: Point, s: number) => ({ x: p.x * s, y: p.y * s });
const vLength = (p: Point) => Math.sqrt(p.x * p.x + p.y * p.y);
const vNormalize = (p: Point) => {
  const len = vLength(p);
  return len > 0 ? vScale(p, 1 / len) : { x: 0, y: 0 };
};
const dotProduct = (p1: Point, p2: Point) => p1.x * p2.x + p1.y * p2.y;

const SketchImage = ({
  sketch,
  onDragStart,
  onDragEnd,
}: {
  sketch: PlanningSketch;
  onDragStart: (e: any) => void;
  onDragEnd: (e: any) => void;
}) => {
  const [image] = useImage(sketch.src);
  if (!image) return null;

  const scaledWidth = image.width * sketch.pixelScale * PIXELS_PER_METER;
  const scaledHeight = image.height * sketch.pixelScale * PIXELS_PER_METER;

  return (
    <Group
      id={sketch.id}
      x={sketch.x}
      y={sketch.y}
      rotation={sketch.rotation}
      draggable={!sketch.locked}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        // Prevent stage deselection when clicking the sketch
        e.cancelBubble = true;
      }}
    >
      {/* Black background for the image */}
      <Rect
        width={scaledWidth}
        height={scaledHeight}
        offsetX={scaledWidth / 2}
        offsetY={scaledHeight / 2}
        fill="black"
      />
      <KonvaImage
        image={image}
        width={scaledWidth}
        height={scaledHeight}
        offsetX={scaledWidth / 2}
        offsetY={scaledHeight / 2}
        opacity={0.5}
      />
    </Group>
  );
};

// --- Main Component ---
const GardenCanvas = forwardRef<
  any, // Using 'any' for simplicity with the extended handles
  {
    activeTool: ActiveTool;
    selectedPreset: PresetItem | null;
    onObjectAdd: () => void;
    setActiveTool: (tool: ActiveTool) => void;
    plotTexture: Texture | null;
    config: any;
    visibility: VisibilityState;
    planningSketch: PlanningSketch | null;
    onSketchChange: (sketch: PlanningSketch | null) => void;
    onScaleChange: (scale: number) => void;
  }
>(
  (
    {
      activeTool,
      selectedPreset,
      onObjectAdd,
      setActiveTool,
      plotTexture,
      config,
      visibility,
      planningSketch,
      onSketchChange,
      onScaleChange,
    },
    ref
  ) => {
    const [polygons, setPolygons] = useState<Polygon[]>([]);
    const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
    const [dimensions, setDimensions] = useState({ width: 1, height: 1 });
    const [currentPoints, setCurrentPoints] = useState<number[]>([]);
    const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
    const [notes, setNotes] = useState<NoteObject[]>([]);
    const [selectedId, selectShape] = useState<string | null>(null);
    const [isDraggingVertex, setIsDraggingVertex] = useState(false);
    const [originalZIndex, setOriginalZIndex] = useState<number | null>(null);
    const [lastDist, setLastDist] = useState(0);
    const [lastCenter, setLastCenter] = useState<Point | null>(null);
    const [originalLayer, setOriginalLayer] = useState<Konva.Layer | null>(
      null
    );
    const [colorMenu, setColorMenu] = useState<{
      x: number;
      y: number;
      noteId: string;
    } | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isInteracting, setIsInteracting] = useState(false);
    const [editingTextNode, setEditingTextNode] = useState<NoteObject | null>(
      null
    );
    // ✅ FIX #1: State to manage selecting a newly added object robustly.
    const [lastAddedId, setLastAddedId] = useState<string | null>(null);

    const [textures, setTextures] = useState<{
      [key: string]: HTMLImageElement;
    }>({});
    const [stage, setStage] = useState({ scale: 1, x: 0, y: 0 });
    const [menu, setMenu] = useState<{
      x: number;
      y: number;
      polyId: string;
    } | null>(null);

    const [snapDetails, setSnapDetails] = useState<SnapDetails>({
      isSnapped: false,
      point: { x: 0, y: 0 },
      isLineSnap: false,
      isAngleSnap: false,
    });
    const [isClosing, setIsClosing] = useState(false);
    const [isNearVertex, setIsNearVertex] = useState(false);
    const [history, setHistory] = useState<HistoryState[]>([
      { polygons: [], placedObjects: [], notes: [] },
    ]);
    const [historyStep, setHistoryStep] = useState(0);

    const [floatingLabels, setFloatingLabels] = useState<React.ReactNode>(null);
    const [transformCounter, setTransformCounter] = useState(0);

    // ✅ FIX #3: State to hold floating icon properties, managed by useLayoutEffect for correct timing.
    const [floatingIconProps, setFloatingIconProps] = useState<any>(null);

    const trRef = useRef<Konva.Transformer>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const textEditRef = useRef<HTMLTextAreaElement>(null);
    const originalLayerRef = useRef<Konva.Layer | null>(null);
    const prevSelectedIdRef = useRef<string | null>(null);

    const handleLockToggle = useCallback((id: string) => {
      setPolygons((currentPolygons) =>
        currentPolygons.map((p) =>
          p.id === id ? { ...p, locked: !p.locked } : p
        )
      );
      setPlacedObjects((currentObjects) =>
        currentObjects.map((o) =>
          o.id === id ? { ...o, locked: !o.locked } : o
        )
      );
      setNotes((current) =>
        current.map((n) => (n.id === id ? { ...n, locked: !n.locked } : n))
      );
      // Since we are changing a property that affects the UI,
      // it's a good idea to trigger the effect manually.
      setTransformCounter((c) => c + 1);
    }, []);

    const handlePolygonPointUpdate = useCallback(
      (polygonId: string, pointIndex: number, newPoint: Point) => {
        setPolygons((currentPolygons) =>
          currentPolygons.map((p) => {
            if (p.id === polygonId) {
              const newPoints = [...p.points];
              newPoints[pointIndex * 2] = newPoint.x;
              newPoints[pointIndex * 2 + 1] = newPoint.y;
              return { ...p, points: newPoints };
            }
            return p;
          })
        );
      },
      []
    );

    const saveStateToHistory = useCallback(() => {
      const currentHistory = history.slice(0, historyStep + 1);
      const lastState = currentHistory[currentHistory.length - 1];
      const currentState = { polygons, placedObjects, notes };
      if (JSON.stringify(lastState) !== JSON.stringify(currentState)) {
        currentHistory.push(currentState);
        setHistory(currentHistory);
        setHistoryStep(currentHistory.length - 1);
      }
    }, [history, historyStep, polygons, placedObjects, notes]);

    const handleUndo = useCallback(() => {
      if (historyStep > 0) {
        const newStep = historyStep - 1;
        const prevState = history[newStep];
        setPolygons(prevState.polygons);
        setPlacedObjects(prevState.placedObjects);
        setNotes(prevState.notes);
        setHistoryStep(newStep);
        selectShape(null);
      }
    }, [history, historyStep]);

    const handleRedo = useCallback(() => {
      if (historyStep < history.length - 1) {
        const newStep = historyStep + 1;
        const nextState = history[newStep];
        setPolygons(nextState.polygons);
        setPlacedObjects(nextState.placedObjects);
        setNotes(nextState.notes);
        setHistoryStep(newStep);
        selectShape(null);
      }
    }, [history, historyStep]);

    const handleDelete = useCallback(() => {
      if (!selectedId) return;
      setPolygons((polygons) => polygons.filter((p) => p.id !== selectedId));
      setPlacedObjects((objects) => objects.filter((o) => o.id !== selectedId));
      setNotes((notes) => notes.filter((n) => n.id !== selectedId));
      selectShape(null);
    }, [selectedId]);

    useEffect(() => {
      const allTextures = config?.tools.find((t: any) => t.id === "plot")
        ?.textures as Texture[];
      if (allTextures) {
        allTextures.forEach((tex) => {
          const image = new window.Image();
          image.src = tex.src;
          image.crossOrigin = "Anonymous";
          image.onload = () => {
            setTextures((prev) => ({ ...prev, [tex.id]: image }));
          };
        });
      }
    }, [config]);

    useEffect(() => {
      onScaleChange(stage.scale);
    }, [stage.scale, onScaleChange]);

    useEffect(() => {
      const timeoutId = setTimeout(saveStateToHistory, 500);
      return () => clearTimeout(timeoutId);
    }, [polygons, placedObjects, saveStateToHistory, notes]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "z") {
          e.preventDefault();
          handleUndo();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "y") {
          e.preventDefault();
          handleRedo();
        }
        if (
          (e.key === "Delete" || e.key === "Backspace") &&
          selectedId &&
          !editingTextNode
        ) {
          e.preventDefault();
          handleDelete();
        }
        if (
          e.key === "Escape" &&
          activeTool.type === "plot" &&
          currentPoints.length > 0
        ) {
          e.preventDefault();
          setCurrentPoints([]);
          setActiveTool({ type: "select" });
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
      handleUndo,
      handleRedo,
      handleDelete,
      selectedId,
      activeTool,
      currentPoints.length,
      setActiveTool,
      editingTextNode,
    ]);

    useEffect(() => {
      if (editingTextNode && textEditRef.current) {
        textEditRef.current.focus();
        textEditRef.current.select();
      }
    }, [editingTextNode?.id]);

    useEffect(() => {
      const handleResize = () => {
        if (containerRef.current) {
          setDimensions({
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
          });
        }
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ✅ FIX #1: This effect now robustly handles adding a new preset object.
    useEffect(() => {
      if (selectedPreset) {
        const stageNode = stageRef.current;
        if (!stageNode) return;

        const { width, height } = dimensions;
        const centerX = (width / 2 - stageNode.x()) / stageNode.scaleX();
        const centerY = (height / 2 - stageNode.y()) / stageNode.scaleY();

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
          locked: false, // ✅ Add this line
        };
        setPlacedObjects((prev) => [...prev, newObject]);

        console.log("--- SELECTION DEBUG ---");
        console.log("Step A: Creating new object with ID:", newObject.id);
        // Set the ID of the object we just added.
        setLastAddedId(newObject.id);
        onObjectAdd();
      }
    }, [
      selectedPreset,
      dimensions,
      onObjectAdd,
      stage.x,
      stage.y,
      stage.scale,
    ]);

    // This layout effect runs AFTER the new object is rendered but BEFORE the screen updates.
    // This is the key to reliably selecting it.
    useLayoutEffect(() => {
      if (lastAddedId) {
        // Now that we know the object is on the stage, select it.
        console.log("Step B: Selecting new object. ID:", lastAddedId);
        selectShape(lastAddedId);
        // Force effects that depend on transformation to update.
        setTransformCounter((c) => c + 1);
        // Reset the ID so this doesn't run again.
        setLastAddedId(null);
      }
    }, [lastAddedId]);

    useLayoutEffect(() => {
      const transformer = trRef.current;
      const stage = stageRef.current;
      if (!transformer || !stage) return;

      // ✅ FIX: Check both notes and items (polygons, placed objects)
      const isNoteSelected = notes.some((n) => n.id === selectedId);
      const isItemSelected =
        polygons.some((p) => p.id === selectedId) ||
        placedObjects.some((o) => o.id === selectedId);

      // ✅ FIX: If the selected object's layer is invisible, hide the transformer.
      if (
        (isNoteSelected && !visibility.notes) ||
        (isItemSelected && !visibility.items)
      ) {
        transformer.nodes([]);
        return;
      }

      const selectedNode = stage.findOne("#" + selectedId);

      console.log("selectedNode", selectedNode);

      // If a node is selected, attach the transformer
      if (selectedNode) {
        // Attach to the node. It might have a 0x0 size for a fraction of a second.
        transformer.nodes([selectedNode]);

        // We schedule a function to run at the end of the current browser task.
        // This gives the <PresetObject>'s internal image/SVG a chance to load.
        const timer = setTimeout(() => {
          // By detaching and immediately re-attaching the node, we force
          // the Transformer to re-calculate its size and position based
          // on the now-loaded content. This is the correct Konva pattern.
          if (trRef.current) {
            // Ensure ref is still valid
            const stillSelectedNode = stage.findOne("#" + selectedId);
            if (stillSelectedNode) {
              trRef.current.nodes([]);
              trRef.current.nodes([stillSelectedNode]);
            }
          }
        }, 0); // A timeout of 0ms is all that's needed.

        // Configure the transformer's behavior based on the object type
        const isResizableNote = notes.some(
          (n) => n.id === selectedId && n.type !== "arrow"
        );
        const isPreset = placedObjects.some((o) => o.id === selectedId);
        transformer.keepRatio(isPreset);
        transformer.resizeEnabled(isPreset || isResizableNote);

        // Return a cleanup function to clear the timer if the selection changes
        return () => clearTimeout(timer);
      } else {
        // If nothing is selected, ensure the transformer is detached
        transformer.nodes([]);
      }
      // ✅ FIX: Add all relevant dependencies
    }, [
      selectedId,
      visibility.items,
      visibility.notes,
      notes,
      polygons,
      placedObjects,
    ]);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // Set initial dimensions
      setDimensions({
        width: container.clientWidth,
        height: container.clientHeight,
      });

      // Use ResizeObserver for more reliable size detection
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setDimensions({ width, height });
        }
      });

      resizeObserver.observe(container);

      // Cleanup by disconnecting the observer
      return () => resizeObserver.disconnect();
    }, []);

    const handleTouchStart = (e: KonvaEventObject<TouchEvent>) => {
      // Handle single-touch as a mousedown for drawing/selecting
      if (e.evt.touches.length === 1) {
        handleStageMouseDown(e as any); // Cast to allow reuse
      }
    };

    const handleTouchMove = (e: KonvaEventObject<TouchEvent>) => {
      e.evt.preventDefault();
      const stageNode = stageRef.current;
      if (!stageNode) return;

      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];

      if (touch1 && touch2) {
        if (stageNode.isDragging()) stageNode.stopDrag();

        const p1 = { x: touch1.clientX, y: touch1.clientY };
        const p2 = { x: touch2.clientX, y: touch2.clientY };

        if (!lastCenter) {
          setLastCenter({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });
          return;
        }

        const newCenter = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        const dist = calculateDistance(p1, p2);

        if (lastDist === 0) {
          setLastDist(dist);
          return;
        }

        const oldScale = stageNode.scaleX();
        const pointTo = {
          x: (newCenter.x - stageNode.x()) / oldScale,
          y: (newCenter.y - stageNode.y()) / oldScale,
        };

        const newScale = Math.max(
          0.5,
          Math.min(4, oldScale * (dist / lastDist))
        );

        const newPos = {
          x: newCenter.x - pointTo.x * newScale,
          y: newCenter.y - pointTo.y * newScale,
        };

        // update both state and actual Konva stage
        setStage({ scale: newScale, ...newPos });
        stageNode.scale({ x: newScale, y: newScale });
        stageNode.position(newPos);
        stageNode.batchDraw();

        setLastDist(dist);
      } else if (e.evt.touches.length === 1) {
        handleStageMouseMove(e as any);
      }
    };

    const handleTouchEnd = (e: KonvaEventObject<TouchEvent>) => {
      // Reset touch tracking state
      setLastDist(0);
      setLastCenter(null);

      // Fall back to the existing mouse up logic
      handleStageMouseUp(e as any);
    };

    const handleStageMouseDown = (e: KonvaEventObject<MouseEvent>) => {
      if (editingTextNode) return;

      if (
        activeTool.type === "note" &&
        activeTool.shape &&
        activeTool.shape !== "text"
      ) {
        if (e.target !== e.target.getStage()) {
          return;
        }

        const stageNode = stageRef.current;
        if (!stageNode) return;
        const pos = stageNode.getRelativePointerPosition();
        if (!pos) return;

        const newNote: NoteObject = {
          id: `note_${Date.now()}`,
          type: activeTool.shape,
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          fill: "gray",
          locked: false,
          points: activeTool.shape === "arrow" ? [0, 0, 0, 0] : undefined,
          text: activeTool.shape === "callout" ? "Callout" : undefined,
          pointerDirection: activeTool.shape === "callout" ? "down" : undefined,
          offsetX: 0,
          offsetY: 0,
        };

        setIsDrawing(true);
        setNotes((prev) => [...prev, newNote]);
        return;
      }

      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        handleSelect(null);
        setMenu(null);
        setColorMenu(null);
      }
    };
    const handleStageMouseMove = (e: KonvaEventObject<MouseEvent>) => {
      handleMouseMove(e); // Keep this for plotting guides

      if (!isDrawing || notes.length === 0) return;

      const stageNode = stageRef.current;
      if (!stageNode) return;
      const pos = stageNode.getRelativePointerPosition();
      if (!pos) return;

      const noteBeingDrawn = notes[notes.length - 1];
      // The start position is the note's actual x/y, which we will NOT change.
      const startX = noteBeingDrawn.x;
      const startY = noteBeingDrawn.y;

      setNotes((current) =>
        current.map((n) => {
          if (n.id === noteBeingDrawn.id) {
            if (n.type === "arrow") {
              const relativeWidth = pos.x - startX;
              const relativeHeight = pos.y - startY;
              return { ...n, points: [0, 0, relativeWidth, relativeHeight] };
            }

            // ✅ --- THIS IS THE NEW, CORRECT LOGIC FOR CALLOUTS ---
            if (n.type === "callout") {
              const newWidth = Math.abs(pos.x - startX);
              const totalHeight = Math.abs(pos.y - startY);
              const newHeight = Math.max(
                0,
                totalHeight - CALLOUT_POINTER_HEIGHT
              );

              let newOffsetX = 0;
              let newOffsetY = 0;
              let newPointerDirection: "up" | "down" = "down";

              // Handle horizontal flipping via offsetX
              if (pos.x < startX) {
                newOffsetX = newWidth;
              }

              // Handle vertical flipping via offsetY and pointer direction
              if (pos.y < startY) {
                newPointerDirection = "up";
                newOffsetY = totalHeight;
              }

              return {
                ...n,
                // Note: x and y are NOT changed. They remain the anchor point.
                width: newWidth,
                height: newHeight,
                offsetX: newOffsetX,
                offsetY: newOffsetY,
                pointerDirection: newPointerDirection,
              };
            }

            // Logic for Rectangle and Oval
            else {
              const newX = Math.min(pos.x, startX);
              const newY = Math.min(pos.y, startY);
              const newWidth = Math.abs(pos.x - startX);
              const newHeight = Math.abs(pos.y - startY);
              return {
                ...n,
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight,
              };
            }
          }
          return n;
        })
      );
    };

    const handleStageMouseUp = (e: KonvaEventObject<MouseEvent>) => {
      if (isDrawing) {
        setIsDrawing(false);
        const drawnNoteId = notes[notes.length - 1]?.id;
        setActiveTool({ type: "select" });
        if (drawnNoteId) {
          selectShape(drawnNoteId);
        }
      }
    };

    const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const scaleBy = 1.05;
      const stageNode = e.target.getStage();
      if (!stageNode) return;
      const oldScale = stageNode.scaleX();
      const pointer = stageNode.getPointerPosition();
      if (!pointer) return;
      const mousePointTo = {
        x: (pointer.x - stageNode.x()) / oldScale,
        y: (pointer.y - stageNode.y()) / oldScale,
      };
      const newScale =
        e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      setStage({
        scale: newScale,
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
      setTransformCounter((c) => c + 1); // Trigger label update on zoom
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

    const handleInteractionStart = () => {
      setIsInteracting(true);
    };

    const handleInteractionEnd = () => {
      setIsInteracting(false);
    };

    const handleVertexDragStart = () => {
      setIsInteracting(true); // A vertex drag is also an interaction
      setIsDraggingVertex(true);
    };

    const handleVertexDragEnd = () => {
      setIsInteracting(false);
      setIsDraggingVertex(false);
    };

    const handleObjectDragEnd = (e: KonvaEventObject<DragEvent>) => {
      handleInteractionEnd();
      e.cancelBubble = true;
      const node = e.target;
      const id = node.id();
      const newX = node.x();
      const newY = node.y();

      // ✅ FIX: Prevent state updates with invalid coordinates, which can occur on mobile touch events.
      if (isNaN(newX) || isNaN(newY)) {
        console.warn("Invalid coordinates on drag end; update prevented.");
        return;
      }

      setPolygons((current) =>
        current.map((p) => (p.id === id ? { ...p, x: newX, y: newY } : p))
      );
      setPlacedObjects((current) =>
        current.map((o) => (o.id === id ? { ...o, x: newX, y: newY } : o))
      );
      setNotes((current) =>
        current.map((n) => (n.id === id ? { ...n, x: newX, y: newY } : n))
      );
      setTransformCounter((c) => c + 1); // Trigger label update on drag
    };

    const handleTransformEnd = (e: KonvaEventObject<Event>) => {
      handleInteractionEnd();
      e.cancelBubble = true;
      const node = e.target;
      const id = node.id();
      const newScaleX = node.scaleX();
      const newScaleY = node.scaleY();
      const newX = node.x();
      const newY = node.y();

      // ✅ FIX: Prevent disappearing objects by validating scale and position.
      // This catches buggy transforms from quick taps on mobile.
      if (
        Math.abs(newScaleX) < 0.0001 ||
        Math.abs(newScaleY) < 0.0001 ||
        isNaN(newX) ||
        isNaN(newY)
      ) {
        console.warn("Invalid transform detected; update prevented.");
        // Find the object in our React state to get its last valid properties.
        const allObjects = [...polygons, ...placedObjects, ...notes];
        const originalObject = allObjects.find((obj) => obj.id === id);

        // Manually reset the Konva node to its last known good state to prevent visual glitches.
        if (originalObject) {
          node.x(originalObject.x);
          node.y(originalObject.y);
          node.scaleX(originalObject.scaleX || 1);
          node.scaleY(originalObject.scaleY || 1);
          node.rotation(originalObject.rotation || 0);
        }
        return; // Exit without updating React state.
      }

      const commonProps = {
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
      };

      const updateNote = (n: NoteObject) => {
        if (n.id !== id) return n;
        return {
          ...n,
          ...commonProps,
        };
      };

      setPolygons((current) =>
        current.map((p) => (p.id === id ? { ...p, ...commonProps } : p))
      );
      setPlacedObjects((current) =>
        current.map((o) => (o.id === id ? { ...o, ...commonProps } : o))
      );
      setNotes((current) => current.map(updateNote));
    };

    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        const stageNode = stageRef.current;
        if (!stageNode) return;

        const oldScale = stageNode.scaleX();
        const newScale = oldScale * 1.2;

        // Get the center of the viewport
        const center = {
          x: dimensions.width / 2,
          y: dimensions.height / 2,
        };

        // Calculate the point on the canvas that is currently under the center of the viewport
        const mousePointTo = {
          x: (center.x - stageNode.x()) / oldScale,
          y: (center.y - stageNode.y()) / oldScale,
        };

        // Set the new stage state with the calculated position
        setStage({
          scale: newScale,
          x: center.x - mousePointTo.x * newScale,
          y: center.y - mousePointTo.y * newScale,
        });
      },
      zoomOut: () => {
        const stageNode = stageRef.current;
        if (!stageNode) return;

        const oldScale = stageNode.scaleX();
        const newScale = oldScale / 1.2;

        // Get the center of the viewport
        const center = {
          x: dimensions.width / 2,
          y: dimensions.height / 2,
        };

        // Calculate the point on the canvas that is currently under the center of the viewport
        const mousePointTo = {
          x: (center.x - stageNode.x()) / oldScale,
          y: (center.y - stageNode.y()) / oldScale,
        };

        // Set the new stage state with the calculated position
        setStage({
          scale: newScale,
          x: center.x - mousePointTo.x * newScale,
          y: center.y - mousePointTo.y * newScale,
        });
      },
      undo: handleUndo,
      redo: handleRedo,
      deleteSelected: handleDelete,
      center: () => {
        const stageNode = stageRef.current;
        const container = containerRef.current;
        if (!stageNode || !container) return;

        const allObjects = [
          ...polygons,
          ...placedObjects,
          ...notes,
          ...(planningSketch ? [planningSketch] : []),
        ];

        if (allObjects.length === 0) {
          // If no objects, reset to default and exit
          setStage({ scale: 1, x: 0, y: 0 });
          return;
        }

        // Calculate the bounding box of all objects
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        allObjects.forEach((obj) => {
          const node = stageNode.findOne(`#${obj.id}`);
          if (!node) return;

          // Use getClientRect with relativeTo to get stable coordinates
          const clientRect = node.getClientRect({ relativeTo: stageNode });
          minX = Math.min(minX, clientRect.x);
          maxX = Math.max(maxX, clientRect.x + clientRect.width);
          minY = Math.min(minY, clientRect.y);
          maxY = Math.max(maxY, clientRect.y + clientRect.height);
        });

        // Handle case where bounding box is invalid (e.g., zero-sized objects)
        if (
          !isFinite(minX) ||
          !isFinite(maxX) ||
          !isFinite(minY) ||
          !isFinite(maxY)
        ) {
          setStage({ scale: 1, x: 0, y: 0 });
          return;
        }

        // Calculate the center and size of the bounding box
        const boundsWidth = maxX - minX;
        const boundsHeight = maxY - minY;
        const centerX = minX + boundsWidth / 2;
        const centerY = minY + boundsHeight / 2;

        // Get viewport dimensions
        const viewWidth = container.clientWidth;
        const viewHeight = container.clientHeight;

        // Calculate scale to fit objects within 80% of the viewport
        const padding = 0.8; // Use 80% of viewport to leave some margin
        const scaleX = boundsWidth > 0 ? viewWidth / boundsWidth : 1;
        const scaleY = boundsHeight > 0 ? viewHeight / boundsHeight : 1;
        const newScale = Math.min(scaleX, scaleY) * padding;

        // Round the scale to avoid floating-point drift (e.g., to 3 decimal places)
        const finalScale =
          Math.round(Math.min(Math.max(newScale, 0.5), 2) * 1000) / 1000;

        // Calculate stage position to center the bounding box
        const newX = Math.round(viewWidth / 2 - centerX * finalScale);
        const newY = Math.round(viewHeight / 2 - centerY * finalScale);

        // Only update if the values have changed significantly to prevent jitter
        if (
          Math.abs(stage.scale - finalScale) > 0.001 ||
          Math.abs(stage.x - newX) > 1 ||
          Math.abs(stage.y - newY) > 1
        ) {
          setStage({
            scale: finalScale,
            x: newX,
            y: newY,
          });
        }
      },
      addRectangle: (widthInMeters: number, heightInMeters: number) => {
        const stageNode = stageRef.current;
        if (!stageNode) return;

        const width = widthInMeters * PIXELS_PER_METER;
        const height = heightInMeters * PIXELS_PER_METER;

        const { width: viewWidth, height: viewHeight } = dimensions;
        const centerX = (viewWidth / 2 - stageNode.x()) / stageNode.scaleX();
        const centerY = (viewHeight / 2 - stageNode.y()) / stageNode.scaleY();

        const halfW = width / 2;
        const halfH = height / 2;

        const points = [
          -halfW,
          -halfH,
          halfW,
          -halfH,
          halfW,
          halfH,
          -halfW,
          halfH,
        ];

        const newRectangle: Polygon = {
          id: `rect_${Date.now()}`,
          points: points,
          x: centerX,
          y: centerY,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          locked: plotTexture?.id === "grass",
          textureId: plotTexture?.id,
        };

        setPolygons((prev) => [...prev, newRectangle]);
        selectShape(newRectangle.id);
      },
      isCanvasEmpty: () =>
        polygons.length === 0 &&
        placedObjects.length === 0 &&
        notes.length === 0,
      getCanvasState: () => JSON.stringify({ polygons, placedObjects, notes }),
      clearCanvas: () => {
        setPolygons([]);
        setPlacedObjects([]);
        setNotes([]);
        selectShape(null);
      },
      loadCanvasState: (data: HistoryState) => {
        if (data) {
          setPolygons(data.polygons || []);
          setPlacedObjects(data.placedObjects || []);
          setNotes(data.notes || []);
          selectShape(null);
          const newHistoryState = [
            {
              polygons: data.polygons || [],
              placedObjects: data.placedObjects || [],
              notes: data.notes || [],
            },
          ];
          setHistory(newHistoryState);
          setHistoryStep(0);
        }
      },
      getStageNode: () => stageRef.current,
      editSketch: () => {
        if (planningSketch) {
          selectShape(planningSketch.id);
          onSketchChange({ ...planningSketch, locked: false });
        }
      },
      deleteSketch: () => {
        if (selectedId === planningSketch?.id) selectShape(null);
        onSketchChange(null);
      },
      toggleSketchLayer: () => {
        if (planningSketch) {
          onSketchChange({
            ...planningSketch,
            zIndex: planningSketch.zIndex === 0 ? 1 : 0,
          });
        }
      },
    }));

    const finishPlotting = () => {
      console.log(plotTexture?.id);

      if (currentPoints.length < 6) return;
      const newPolygon: Polygon = {
        id: `poly_${Date.now()}`,
        points: [...currentPoints],
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        locked: plotTexture?.id == "grass" ? true : false,
        textureId: plotTexture?.id,
      };
      setPolygons((prev) => [...prev, newPolygon]);
      setCurrentPoints([]);
      selectShape(newPolygon.id);
      setActiveTool({ type: "select" });
    };

    const handleCanvasClick = (e: KonvaEventObject<MouseEvent>) => {
      if (e.target !== e.target.getStage()) return;

      if (activeTool.type === "plot") {
        if (isClosing) {
          finishPlotting();
          return;
        }
        const pos = stageRef.current?.getRelativePointerPosition();
        if (!pos) return;
        const clickPos = snapDetails.isSnapped ? snapDetails.point : pos;
        setCurrentPoints((prev) => [...prev, clickPos.x, clickPos.y]);
        setIsNearVertex(true);
        return;
      }

      if (activeTool.type === "note" && activeTool.shape === "text") {
        const stageNode = stageRef.current;
        if (!stageNode) return;
        const pos = stageNode.getRelativePointerPosition();
        if (!pos) return;

        const newNote: NoteObject = {
          id: `note_${Date.now()}`,
          type: activeTool.shape,
          x: pos.x,
          y: pos.y,
          width: 150,
          height: 50,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          fill: "gray",
          locked: false,
          text: " ",
        };
        // Add the visually blank note to the canvas
        setNotes((prev) => [...prev, newNote]);
        setActiveTool({ type: "select" });
        selectShape(newNote.id);

        // ✅ 2. Immediately start editing, but provide the *actual* default text
        // to the editing state. This populates the textarea correctly.
        setEditingTextNode({
          ...newNote,
          text: "Text",
        });
      }
    };

    const handleNoteSettingsClick = useCallback(
      (e: KonvaEventObject<MouseEvent>, noteId: string) => {
        e.evt.preventDefault();
        e.cancelBubble = true;
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;
        const x = e.evt.clientX - containerRect.left;
        const y = e.evt.clientY - containerRect.top;
        setColorMenu({ x, y, noteId });
        setMenu(null);
      },
      []
    );

    const handlePolygonAddPoint = useCallback(
      (polygonId: string, segmentIndex: number, newPoint: Point) => {
        setPolygons((currentPolygons) =>
          currentPolygons.map((p) => {
            if (p.id === polygonId) {
              const newPoints = [...p.points];
              // Insert the new point's coordinates at the correct position in the flat array
              newPoints.splice(
                (segmentIndex + 1) * 2,
                0,
                newPoint.x,
                newPoint.y
              );
              return { ...p, points: newPoints };
            }
            return p;
          })
        );
        // Force the floating labels to re-render with the new point
        setTransformCounter((c) => c + 1);
      },
      []
    );

    const handleColorChange = (noteId: string, color: NoteColor) => {
      setNotes((current) =>
        current.map((n) => (n.id === noteId ? { ...n, fill: color } : n))
      );
      setColorMenu(null);
    };

    const handleTextEdit = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      setEditingTextNode((prevNode) => {
        if (!prevNode) return null;
        return { ...prevNode, text: newText };
      });
    };
    const handleTextEditBlur = () => {
      if (!editingTextNode) return;

      setNotes((currentNotes) =>
        currentNotes.map((n) =>
          n.id === editingTextNode.id ? { ...n, text: editingTextNode.text } : n
        )
      );

      const groupNode = stageRef.current?.findOne(`#${editingTextNode.id}`);
      // ✅ UPDATED: Find the text node by its specific name
      const textNode = groupNode?.findOne(".text_shape");
      textNode?.show();
      trRef.current?.show();
      setEditingTextNode(null);
    };

    const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
      const stageNode = e.target.getStage();
      if (!stageNode) return;
      const pos = stageNode.getRelativePointerPosition();
      if (!pos) return;
      setMousePos(pos);

      const scale = stageNode.scaleX();

      let isNearAnyPoint = false;
      if (currentPoints.length > 0) {
        for (let i = 0; i < currentPoints.length; i += 2) {
          const point = { x: currentPoints[i], y: currentPoints[i + 1] };
          if (calculateDistance(pos, point) < GUIDE_HIDE_THRESHOLD / scale) {
            isNearAnyPoint = true;
            break;
          }
        }
      }
      setIsNearVertex(isNearAnyPoint);

      if (activeTool.type !== "plot" || currentPoints.length === 0) {
        setSnapDetails({
          isSnapped: false,
          point: pos,
          isLineSnap: false,
          isAngleSnap: false,
        });
        return;
      }

      let snapPoint = { ...pos };
      let isSnapped = false;
      let isLineSnap = false;
      let isAngleSnap = false;
      let isNearStart = false;

      const lastPoint = {
        x: currentPoints[currentPoints.length - 2],
        y: currentPoints[currentPoints.length - 1],
      };

      if (currentPoints.length >= 4 && !isNearAnyPoint) {
        const p2 = {
          x: currentPoints[currentPoints.length - 4],
          y: currentPoints[currentPoints.length - 3],
        };
        const p1 = lastPoint;
        const v1 = vSub(p2, p1);
        const lineNormal = { x: -v1.y, y: v1.x };

        const v2 = vSub(pos, p1);

        const t =
          dotProduct(v2, lineNormal) / dotProduct(lineNormal, lineNormal);
        const projectedPoint = vAdd(p1, vScale(lineNormal, t));

        if (
          calculateDistance(pos, projectedPoint) <
          ANGLE_SNAP_THRESHOLD / scale
        ) {
          snapPoint = projectedPoint;
          isSnapped = true;
          isAngleSnap = true;
        }
      }

      if (!isAngleSnap && !isNearAnyPoint) {
        const dx = Math.abs(pos.x - lastPoint.x);
        const dy = Math.abs(pos.y - lastPoint.y);

        if (dy < SNAP_THRESHOLD / scale) {
          snapPoint.y = lastPoint.y;
          isSnapped = true;
          isLineSnap = true;
        } else if (dx < SNAP_THRESHOLD / scale) {
          snapPoint.x = lastPoint.x;
          isSnapped = true;
          isLineSnap = true;
        }
      }

      if (currentPoints.length >= 6) {
        const startPoint = { x: currentPoints[0], y: currentPoints[1] };
        if (calculateDistance(startPoint, pos) < CLOSE_THRESHOLD / scale) {
          isNearStart = true;
          snapPoint = startPoint;
          isSnapped = true;
          isLineSnap = false;
          isAngleSnap = false;
        }
      }

      setSnapDetails({ isSnapped, point: snapPoint, isLineSnap, isAngleSnap });
      setIsClosing(isNearStart);
    };

    const handleSettingsClick = useCallback(
      (e: KonvaEventObject<MouseEvent>, polyId: string) => {
        e.evt.preventDefault();
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        const x = e.evt.clientX - containerRect.left;
        const y = e.evt.clientY - containerRect.top;

        setMenu({ x: x - 5, y: y - 130, polyId });
      },
      []
    );

    const copyObject = (
      objectId: string,
      direction: "horizontal" | "vertical"
    ) => {
      const node = stageRef.current?.findOne("#" + objectId);
      if (!node) return;

      const polyToCopy = polygons.find((p) => p.id === objectId);
      const objToCopy = placedObjects.find((o) => o.id === objectId);

      const boundingBox = node.getClientRect({ skipTransform: false });
      const unscaledWidth = boundingBox.width;
      const unscaledHeight = boundingBox.height;

      if (polyToCopy) {
        const newPoly: Polygon = {
          ...polyToCopy,
          id: `poly_${Date.now()}`,
          x:
            direction === "horizontal"
              ? polyToCopy.x + unscaledWidth
              : polyToCopy.x,
          y:
            direction === "vertical"
              ? polyToCopy.y + unscaledHeight
              : polyToCopy.y,
          locked: false,
        };
        setPolygons((p) => [...p, newPoly]);
        selectShape(newPoly.id);
      } else if (objToCopy) {
        const newObj: PlacedObject = {
          ...objToCopy,
          id: `${objToCopy.id.split("_")[0]}_${Date.now()}`,
          x:
            direction === "horizontal"
              ? objToCopy.x + unscaledWidth
              : objToCopy.x,
          y:
            direction === "vertical"
              ? objToCopy.y + unscaledHeight
              : objToCopy.y,
          locked: false,
        };
        setPlacedObjects((o) => [...o, newObj]);
        selectShape(newObj.id);
      }
      setMenu(null);
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
      for (let i = startCellX; i <= endCellX; i++)
        lines.push(
          <Line
            key={`v${i}`}
            points={[i * GRID_SIZE, topLeft.y, i * GRID_SIZE, bottomRight.y]}
            stroke="#D9DADA"
            strokeWidth={1 / scale}
          />
        );
      for (let j = startCellY; j <= endCellY; j++)
        lines.push(
          <Line
            key={`h${j}`}
            points={[topLeft.x, j * GRID_SIZE, bottomRight.x, j * GRID_SIZE]}
            stroke="#D9DADA"
            strokeWidth={1 / scale}
          />
        );
      return lines;
    };

    const snapColor = "#AFD069";
    const defaultColor = "#374151";
    const plottingShapes = React.useMemo(() => {
      if (activeTool.type !== "plot" || currentPoints.length === 0) {
        return null;
      }

      const mousePoint = snapDetails.isSnapped ? snapDetails.point : mousePos;
      const previewShapePoints = [...currentPoints, mousePoint.x, mousePoint.y];

      const tempVertices: Point[] = [];
      for (let i = 0; i < previewShapePoints.length; i += 2) {
        tempVertices.push({
          x: previewShapePoints[i],
          y: previewShapePoints[i + 1],
        });
      }

      const segments = [];
      const numTempVertices = tempVertices.length;

      for (let i = 0; i < numTempVertices - 1; i++) {
        const isLastSegment = i === numTempVertices - 2;
        const isAngleSnapSegment = isLastSegment && snapDetails.isAngleSnap;
        const p1 = tempVertices[i];
        const p2 = tempVertices[i + 1];
        const showThisLabel = isLastSegment ? !isNearVertex : true;

        segments.push(
          <LengthGuide
            key={`len-${i}`}
            p1={p1}
            p2={p2}
            scale={stage.scale}
            showLabel={showThisLabel}
            color={
              isLastSegment &&
              (snapDetails.isLineSnap || snapDetails.isAngleSnap)
                ? snapColor
                : defaultColor
            }
            strokeWidth={isAngleSnapSegment ? 2.5 : 2}
            offsetVector={{ x: 0, y: 0 }} // Plotting guides don't need an offset
          />
        );
      }
      if (numTempVertices >= 3) {
        segments.push(
          <LengthGuide
            key="len-close"
            p1={tempVertices[numTempVertices - 1]}
            p2={tempVertices[0]}
            scale={stage.scale}
            showLabel={true}
            dashed
            color={defaultColor}
            offsetVector={{ x: 0, y: 0 }}
          />
        );
      }

      const angles = [];
      if (!isNearVertex && numTempVertices >= 3) {
        for (let i = 0; i < numTempVertices; i++) {
          const p_prev =
            tempVertices[(i - 1 + numTempVertices) % numTempVertices];
          const p_vertex = tempVertices[i];
          const p_next = tempVertices[(i + 1) % numTempVertices];
          const angle = calculateAngle(p_prev, p_vertex, p_next);
          angles.push(
            <AngleGuide
              key={`ang-${i}`}
              p1={p_prev}
              vertex={p_vertex}
              p3={p_next}
              scale={stage.scale}
              text={`${angle.toFixed(1)}°`}
            />
          );
        }
      }

      return (
        <Group>
          {segments}
          {angles}
        </Group>
      );
    }, [
      activeTool,
      currentPoints,
      snapDetails,
      mousePos,
      stage.scale,
      isNearVertex,
    ]);

    const { polygonsToRender, selectedPolygon } = useMemo(() => {
      const selected = polygons.find((p) => p.id === selectedId);
      return {
        polygonsToRender: polygons.filter((p) => p.id !== selectedId),
        selectedPolygon: selected,
      };
    }, [polygons, selectedId]);

    const { objectsToRender, selectedObject } = useMemo(() => {
      const selected = placedObjects.find((o) => o.id === selectedId);
      return {
        objectsToRender: placedObjects.filter((o) => o.id !== selectedId),
        selectedObject: selected,
      };
    }, [placedObjects, selectedId]);

    const { notesToRender, selectedNote } = useMemo(() => {
      const selected = notes.find((n) => n.id === selectedId);
      return {
        notesToRender: notes.filter((n) => n.id !== selectedId),
        selectedNote: selected,
      };
    }, [notes, selectedId]);

    const handleSelect = useCallback(
      (id: string | null) => {
        // We only need to set the ID. The useLayoutEffect will handle the rest.
        selectShape(id);
      },
      [] // Dependencies are no longer needed
    );
    const handleSketchDragEnd = (e: KonvaEventObject<DragEvent>) => {
      handleInteractionEnd();
      if (!planningSketch) return;
      onSketchChange({
        ...planningSketch,
        x: e.target.x(),
        y: e.target.y(),
      });
    };

    useLayoutEffect(() => {
      if (!selectedId || (isInteracting && !isDraggingVertex)) {
        setFloatingLabels(null);
        setFloatingIconProps(null);
        return;
      }

      // ✅ FIX: Determine the type of the selected object.
      const isNote = notes.some((n) => n.id === selectedId);
      const isItem =
        polygons.some((p) => p.id === selectedId) ||
        placedObjects.some((o) => o.id === selectedId);

      // ✅ FIX: If the object's corresponding layer is hidden, hide its labels and icons.
      if ((isNote && !visibility.notes) || (isItem && !visibility.items)) {
        setFloatingLabels(null);
        setFloatingIconProps(null);
        return; // Exit early
      }

      const stageNode = stageRef.current;
      const node = stageNode?.findOne("#" + selectedId);

      if (!stageNode || !node) {
        return;
      }

      const timerId = setTimeout(() => {
        const currentNode = stageRef.current?.findOne("#" + selectedId);
        if (!currentNode || (isInteracting && !isDraggingVertex)) {
          setFloatingLabels(null);
          setFloatingIconProps(null);
          return;
        }

        let localPoints: Point[] = [];
        const poly = polygons.find((p) => p.id === selectedId);

        if (poly) {
          for (let i = 0; i < poly.points.length; i += 2) {
            localPoints.push({ x: poly.points[i], y: poly.points[i + 1] });
          }
        } else {
          const localRect = currentNode.getClientRect({ skipTransform: true });
          if (localRect.width > 0 || localRect.height > 0) {
            localPoints = [
              { x: localRect.x, y: localRect.y },
              { x: localRect.x + localRect.width, y: localRect.y },
              {
                x: localRect.x + localRect.width,
                y: localRect.y + localRect.height,
              },
              { x: localRect.x, y: localRect.y + localRect.height },
            ];
          }
        }

        if (localPoints.length > 0) {
          const absoluteTransform = currentNode.getAbsoluteTransform();
          const absolutePoints = localPoints.map((p) =>
            absoluteTransform.point(p)
          );

          // --- FLOATING LABELS LOGIC (Unchanged) ---
          const absoluteCentroid = absolutePoints.reduce(
            (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
            { x: 0, y: 0 }
          );
          if (absolutePoints.length > 0) {
            absoluteCentroid.x /= absolutePoints.length;
            absoluteCentroid.y /= absolutePoints.length;
          }
          const labels = (
            <Group listening={false}>
              {localPoints.map((p1_local, i) => {
                const p2_local = localPoints[(i + 1) % localPoints.length];
                const sideVector = vSub(p2_local, p1_local);
                const scaledVector = {
                  x: sideVector.x * currentNode.scaleX(),
                  y: sideVector.y * currentNode.scaleY(),
                };
                const trueLengthInPixels = vLength(scaledVector);
                const p1_abs = absolutePoints[i];
                const p2_abs = absolutePoints[(i + 1) % absolutePoints.length];
                const midPoint = {
                  x: (p1_abs.x + p2_abs.x) / 2,
                  y: (p1_abs.y + p2_abs.y) / 2,
                };
                const centroidToMid = vSub(midPoint, absoluteCentroid);
                const edgeVec = vSub(p2_abs, p1_abs);
                let edgeNormal = { x: -edgeVec.y, y: edgeVec.x };
                if (dotProduct(centroidToMid, edgeNormal) < 0) {
                  edgeNormal = vScale(edgeNormal, -1);
                }
                const normalizedNormal = vNormalize(edgeNormal);
                const offsetDist = 20;
                const effectiveScale = Math.max(
                  stageRef.current?.scaleX() || 1,
                  MIN_EFFECTIVE_SCALE
                );
                const offsetVector = vScale(
                  normalizedNormal,
                  offsetDist / effectiveScale
                );
                return (
                  <LengthGuide
                    key={`float-len-${selectedId}-${i}`}
                    p1={p1_abs}
                    p2={p2_abs}
                    measurementInPixels={trueLengthInPixels}
                    scale={stageRef.current?.scaleX() || 1}
                    showLabel={true}
                    color="black"
                    strokeWidth={1.5}
                    offsetVector={offsetVector}
                  />
                );
              })}
            </Group>
          );
          setFloatingLabels(labels);

          // --- 🚀 NEW ICON POSITIONING LOGIC ---
          let iconAnchorX = Infinity;
          let iconAnchorY = -Infinity;

          // Find the lowest, most left point of the actual transformed shape
          absolutePoints.forEach((p) => {
            if (p.x < iconAnchorX) iconAnchorX = p.x;
            if (p.y > iconAnchorY) iconAnchorY = p.y;
          });

          const scale = stageRef.current?.scaleX() || 1;

          const preferredMargin = -25; // The close distance you like when zoomed in.
          const zoomedOutMargin = 25; // A safe distance to clear the text when zoomed out.
          const scaleThreshold = 0.7; // The zoom level (e.g., 70%) where the switch happens.

          // If the view is zoomed in past the threshold, use your preferred margin.
          // If zoomed out, use the safe margin to prevent overlap.
          const margin =
            scale > scaleThreshold ? preferredMargin : zoomedOutMargin;

          const stagePos = stageRef.current?.position() || { x: 0, y: 0 };

          // Convert this precise world position to a screen position
          const iconScreenX = iconAnchorX * scale + stagePos.x;
          const iconScreenY = iconAnchorY * scale + stagePos.y;

          const allObjects = [
            ...polygons,
            ...placedObjects,
            ...notes,
            planningSketch,
          ].filter(Boolean);
          const selectedObject = allObjects.find(
            (obj) => obj!.id === selectedId
          );

          if (selectedObject) {
            setFloatingIconProps({
              x: iconScreenX, // Use the new accurate screen coordinate
              y: iconScreenY - margin,
              isLocked: selectedObject.locked,
              onLockToggle: () => handleLockToggle(selectedId),
              onSettingsClick: (e: KonvaEventObject<MouseEvent>) => {
                const isNote = notes.some((n) => n.id === selectedId);
                if (isNote) handleNoteSettingsClick(e, selectedId);
                else handleSettingsClick(e, selectedId);
              },
              stageScale: scale,
              showLock: "locked" in selectedObject,
            });
          }
        } else {
          setFloatingLabels(null);
          setFloatingIconProps(null);
        }
      }, 0);

      return () => clearTimeout(timerId);
      // ✅ FIX: Add the visibility states to the dependency array.
    }, [
      selectedId,
      isInteracting,
      polygons,
      isDraggingVertex,
      placedObjects,
      notes,
      planningSketch,
      stage.scale,
      stage.x,
      stage.y,
      transformCounter,
      handleLockToggle,
      visibility.items, // Added
      visibility.notes, // Added
    ]);
    const selectedNodeForScaling = stageRef.current?.findOne("#" + selectedId);
    const nodeScale = selectedNodeForScaling
      ? (selectedNodeForScaling.scaleX() + selectedNodeForScaling.scaleY()) / 2
      : 1;

    return (
      <div
        ref={containerRef}
        className={`w-full h-full  overflow-hidden ${
          activeTool.type == "select" ? "cursor-grab" : "cursor-crosshair"
        }`}
        style={{ touchAction: "none" }}
      >
        <Stage
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={handleStageMouseDown}
          onClick={handleCanvasClick}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          ref={stageRef}
          scaleX={stage.scale}
          scaleY={stage.scale}
          x={stage.x}
          y={stage.y}
          draggable={activeTool.type === "select" && !isDrawing}
          onDragMove={handleStageDrag}
          onDragEnd={handleStageDrag}
          onWheel={handleWheel}
        >
          <Layer listening={false} visible={visibility.grid}>
            {renderGrid()}
          </Layer>
          <Layer
            visible={
              !!planningSketch &&
              planningSketch.zIndex === 0 &&
              visibility.sketch
            }
          >
            {planningSketch && planningSketch.zIndex === 0 && (
              <SketchImage
                sketch={planningSketch}
                onDragStart={handleInteractionStart}
                onDragEnd={handleSketchDragEnd}
              />
            )}
          </Layer>

          {/* ✅ UPDATED ITEMS LAYER */}
          <Layer visible={visibility.items}>
            {/* 1. Render all polygons that are NOT selected */}
            {polygonsToRender.map((poly) => (
              <FinalPolygon
                key={poly.id}
                poly={poly}
                stageScale={stage.scale}
                grassPattern={textures[poly.textureId || ""]}
                isSelected={false}
                onSelect={() => {
                  handleSelect(poly.id);
                  setMenu(null);
                }}
                onDragStart={handleInteractionStart}
                onDragEnd={handleObjectDragEnd}
                onVertexDragStart={handleVertexDragStart}
                onVertexDragEnd={handleVertexDragEnd}
                onTransformEnd={handleTransformEnd}
                isDraggable={activeTool.type === "select" && !poly.locked}
                onPointUpdate={(pointIndex, newPoint) =>
                  handlePolygonPointUpdate(poly.id, pointIndex, newPoint)
                }
                onAddPoint={(segmentIndex, newPoint) =>
                  handlePolygonAddPoint(poly.id, segmentIndex, newPoint)
                }
                isListening={activeTool.type !== "plot"}
              />
            ))}

            {/* 2. Render all placed objects that are NOT selected */}
            {objectsToRender.map((obj) => {
              const baseWidth = obj.width || INITIAL_PRESET_SIZE;
              const baseHeight = obj.height || INITIAL_PRESET_SIZE;
              return (
                <Group
                  key={obj.id}
                  id={obj.id}
                  x={obj.x}
                  y={obj.y}
                  rotation={obj.rotation || 0}
                  scaleX={obj.scaleX || 1}
                  scaleY={obj.scaleY || 1}
                  draggable={activeTool.type === "select" && !obj.locked}
                  dragDistance={10}
                  onClick={(e) => {
                    handleSelect(obj.id);
                    setMenu(null);
                    e.cancelBubble = true;
                  }}
                  onTap={(e) => {
                    handleSelect(obj.id);
                    setMenu(null);
                    e.cancelBubble = true;
                  }}
                  onDragStart={handleInteractionStart}
                  onDragEnd={handleObjectDragEnd}
                  onTransformEnd={handleTransformEnd}
                  listening={activeTool.type !== "plot"}
                >
                  <PresetObject
                    shapeProps={{
                      ...obj,
                      width: baseWidth,
                      height: baseHeight,
                    }}
                    onSelect={() => selectShape(obj.id)}
                  />
                </Group>
              );
            })}

            {/* 3. Render the SELECTED polygon ON TOP */}
            {selectedPolygon && (
              <FinalPolygon
                key={selectedPolygon.id}
                poly={selectedPolygon}
                opacity={0.7}
                isListening={activeTool.type !== "plot"}
                stageScale={stage.scale}
                grassPattern={textures[selectedPolygon.textureId || ""]}
                isSelected={true}
                onSelect={() => {
                  handleSelect(selectedPolygon.id);
                  setMenu(null);
                }}
                onDragStart={handleInteractionStart}
                onDragEnd={handleObjectDragEnd}
                onVertexDragStart={handleVertexDragStart}
                onVertexDragEnd={handleVertexDragEnd}
                onTransformEnd={handleTransformEnd}
                isDraggable={
                  activeTool.type === "select" && !selectedPolygon.locked
                }
                onPointUpdate={(pointIndex, newPoint) =>
                  handlePolygonPointUpdate(
                    selectedPolygon.id,
                    pointIndex,
                    newPoint
                  )
                }
                onAddPoint={(segmentIndex, newPoint) =>
                  handlePolygonAddPoint(
                    selectedPolygon.id,
                    segmentIndex,
                    newPoint
                  )
                }
              />
            )}

            {/* 4. Render the SELECTED placed object ON TOP */}
            {selectedObject && (
              <Group
                key={selectedObject.id}
                id={selectedObject.id}
                opacity={0.7}
                x={selectedObject.x}
                y={selectedObject.y}
                rotation={selectedObject.rotation || 0}
                listening={activeTool.type !== "plot"}
                scaleX={selectedObject.scaleX || 1}
                scaleY={selectedObject.scaleY || 1}
                draggable={
                  activeTool.type === "select" && !selectedObject.locked
                }
                dragDistance={10}
                onClick={(e) => {
                  handleSelect(selectedObject.id);
                  setMenu(null);
                  e.cancelBubble = true;
                }}
                onTap={(e) => {
                  handleSelect(selectedObject.id);
                  setMenu(null);
                  e.cancelBubble = true;
                }}
                onDragStart={handleInteractionStart}
                onDragEnd={handleObjectDragEnd}
                onTransformEnd={handleTransformEnd}
              >
                <PresetObject
                  shapeProps={{
                    ...selectedObject,
                    width: selectedObject.width || INITIAL_PRESET_SIZE,
                    height: selectedObject.height || INITIAL_PRESET_SIZE,
                  }}
                  onSelect={() => selectShape(selectedObject.id)}
                />
              </Group>
            )}

            {activeTool.type === "plot" && (
              <Group>
                {plottingShapes}
                {currentPoints.length >= 6 && (
                  <Line
                    points={currentPoints}
                    fillPatternImage={textures[plotTexture?.id || ""]}
                    fillPatternScale={{ x: 0.2, y: 0.2 }}
                    closed
                    listening={false}
                    opacity={0.6}
                  />
                )}
                {currentPoints.map((_, i) =>
                  i % 2 === 0 ? (
                    <Circle
                      key={`point_${i}`}
                      x={currentPoints[i]}
                      y={currentPoints[i + 1]}
                      radius={(i === 0 && isClosing ? 10 : 5) / stage.scale}
                      fill={
                        i === currentPoints.length - 2 &&
                        snapDetails.isAngleSnap
                          ? snapColor
                          : i === 0 && isClosing
                          ? snapColor
                          : defaultColor
                      }
                      listening={false}
                    />
                  ) : null
                )}
                {currentPoints.length >= 6 && !isClosing && (
                  <Group
                    x={currentPoints[currentPoints.length - 2]}
                    y={currentPoints[currentPoints.length - 1]}
                    onClick={finishPlotting}
                    onTap={finishPlotting}
                  >
                    <Circle
                      radius={14 / stage.scale}
                      fill={snapColor}
                      shadowColor="black"
                      shadowBlur={5}
                      shadowOpacity={0.3}
                    />
                    <Path
                      data="M20 6 9 17l-5-5"
                      stroke="white"
                      strokeWidth={3 / stage.scale}
                      scale={{ x: 0.8 / stage.scale, y: 0.8 / stage.scale }}
                      offsetX={12}
                      offsetY={12}
                    />
                  </Group>
                )}
              </Group>
            )}
          </Layer>

          {/* This layer remains the same */}
          <Layer>
            <Transformer
              ref={trRef}
              rotateEnabled={true}
              flipEnabled={false}
              anchorSize={10 / stage.scale}
              borderStrokeWidth={2.5 / stage.scale}
              rotateAnchorOffset={35 / stage.scale}
              keepRatio={placedObjects.some((o) => o.id === selectedId)}
              onTransformStart={handleInteractionStart}
              onTransformEnd={handleTransformEnd}
              onTransform={() => setTransformCounter((c) => c + 1)}
            />

            <Group
              x={-stage.x / stage.scale}
              y={-stage.y / stage.scale}
              scaleX={1 / stage.scale}
              scaleY={1 / stage.scale}
              listening={false}
            >
              {floatingLabels}
            </Group>

            {floatingIconProps && (
              <Group
                x={(floatingIconProps.x - stage.x) / stage.scale}
                y={(floatingIconProps.y - stage.y) / stage.scale}
                scaleX={1 / stage.scale}
                scaleY={1 / stage.scale}
                listening={true}
              >
                <ObjectIcons
                  isLocked={floatingIconProps.isLocked}
                  onLockToggle={floatingIconProps.onLockToggle}
                  onSettingsClick={floatingIconProps.onSettingsClick}
                  stageScale={stage.scale}
                  showLock={floatingIconProps.showLock}
                />
              </Group>
            )}
          </Layer>

          {/* ✅ UPDATED NOTES LAYER */}
          <Layer visible={visibility.notes}>
            {/* 1. Render non-selected notes */}
            {notesToRender.map((note) => (
              <NoteObjectRenderer
                key={note.id}
                note={note}
                isSelected={false}
                onSelect={() => {
                  handleSelect(note.id);
                  setMenu(null);
                  setColorMenu(null);
                }}
                onDragStart={handleInteractionStart}
                onDragEnd={handleObjectDragEnd}
                onTransformEnd={handleTransformEnd}
                isDraggable={activeTool.type === "select" && !note.locked}
                stageScale={stage.scale}
                onTextDblClick={(e) => {
                  const node = e.target;
                  trRef.current?.hide();
                  node.hide();
                  setEditingTextNode(note);
                }}
              />
            ))}

            {/* 2. Render the selected note ON TOP */}
            {selectedNote && (
              <NoteObjectRenderer
                key={selectedNote.id}
                note={selectedNote}
                isSelected={true}
                onSelect={() => {
                  handleSelect(selectedNote.id);
                  setMenu(null);
                  setColorMenu(null);
                }}
                onDragStart={handleInteractionStart}
                onDragEnd={handleObjectDragEnd}
                onTransformEnd={handleTransformEnd}
                isDraggable={
                  activeTool.type === "select" && !selectedNote.locked
                }
                stageScale={stage.scale}
                onTextDblClick={(e) => {
                  const node = e.target;
                  trRef.current?.hide();
                  node.hide();
                  setEditingTextNode(selectedNote);
                }}
              />
            )}
          </Layer>

          <Layer
            visible={
              !!planningSketch &&
              planningSketch.zIndex === 1 &&
              visibility.sketch
            }
          >
            {planningSketch && planningSketch.zIndex === 1 && (
              <SketchImage
                sketch={planningSketch}
                onDragStart={handleInteractionStart}
                onDragEnd={handleSketchDragEnd}
              />
            )}
          </Layer>
          {/* ⛔️ The empty "top-layer" has been removed */}
        </Stage>
        {menu && (
          <div
            className="absolute bg-transparent flex flex-col items-start gap-2"
            style={{ top: menu.y, left: menu.x }}
          >
            <button
              onClick={() => setMenu(null)}
              className="bg-white p-2 rounded-md shadow-lg hover:bg-gray-100 transition-all"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={() => copyObject(menu.polyId, "horizontal")}
              className="bg-white text-black text-lg font-semibold px-4 py-2 rounded-md shadow-lg hover:bg-gray-100 transition-all w-full text-left"
            >
              Copy horizontally
            </button>
            <button
              onClick={() => copyObject(menu.polyId, "vertical")}
              className="bg-white text-black text-lg font-semibold px-4 py-2 rounded-md shadow-lg hover:bg-gray-100 transition-all w-full text-left"
            >
              Copy vertically
            </button>
          </div>
        )}

        {colorMenu && (
          <div
            className="absolute bg-white rounded-lg shadow-lg p-2 flex space-x-2"
            style={{ top: colorMenu.y, left: colorMenu.x }}
          >
            {(["gray", "blue", "yellow"] as NoteColor[]).map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(colorMenu.noteId, color)}
                className={`w-8 h-8 rounded-full border-2 border-white transition-transform hover:scale-110`}
                style={{
                  backgroundColor:
                    color === "gray"
                      ? "#E5E7EB"
                      : color === "blue"
                      ? "#BFDBFE"
                      : "#FDE68A",
                  borderColor:
                    notes.find((n) => n.id === colorMenu.noteId)?.fill === color
                      ? "#3B82F6"
                      : "white",
                }}
              />
            ))}
          </div>
        )}

        {editingTextNode && (
          <textarea
            ref={textEditRef}
            value={editingTextNode.text}
            onChange={handleTextEdit}
            onBlur={handleTextEditBlur}
            style={getTextAreaStyle(editingTextNode, stageRef.current)}
            className="absolute bg-transparent p-0 m-0 resize-none border-2 border-blue-500 rounded-md overflow-hidden focus:outline-none"
          />
        )}
      </div>
    );
  }
);
GardenCanvas.displayName = "GardenCanvas";
export default GardenCanvas;

const NOTE_COLORS: Record<NoteColor, string> = {
  gray: "#E5E7EB",
  blue: "#BFDBFE",
  yellow: "#FDE68A",
};
const NOTE_STROKE_COLOR = "#4B5563";
const CALLOUT_POINTER_HEIGHT = 10;

// Helper to calculate textarea position
// Helper to calculate textarea position
const getTextAreaStyle = (
  note: NoteObject,
  stage: Konva.Stage | null
): React.CSSProperties => {
  if (!stage) return { display: "none" };

  const group = stage.findOne("#" + note.id);
  if (!group) return { display: "none" };

  const textNode = group.findOne(".text_shape") as Konva.Text;
  if (!textNode) return { display: "none" };

  const textPosition = textNode.absolutePosition();
  const rotation = group.rotation();
  const scale = group.scaleX() * stage.scaleX();

  // --- iOS ZOOM FIX START ---
  // 1. Calculate the actual size the user sees on screen
  const currentFontSize = textNode.fontSize() * scale;

  // 2. Determine if we need to trick the browser (is font < 16px?)
  // If true, we set font-size to 16px (to stop zoom) and scale down the element.
  const minFontSize = 16;
  const isSmallText = currentFontSize < minFontSize;
  const correctionScale = isSmallText ? currentFontSize / minFontSize : 1;

  // 3. Adjust dimensions: If we scale down the element, we must make the
  //    width/height/padding LARGER in CSS so they shrink to the correct size.
  const finalFontSize = isSmallText ? minFontSize : currentFontSize;
  const finalWidth = (textNode.width() * scale) / correctionScale;
  const finalHeight = (textNode.height() * scale) / correctionScale;
  const finalPadding = (textNode.padding() * scale) / correctionScale;
  // --- iOS ZOOM FIX END ---

  return {
    position: "absolute",
    top: `${textPosition.y}px`,
    left: `${textPosition.x}px`,

    // Use the corrected dimensions
    width: `${finalWidth}px`,
    height: `${finalHeight}px`,
    fontSize: `${finalFontSize}px`,
    padding: `${finalPadding}px`,

    fontFamily: textNode.fontFamily(),

    // Apply rotation AND the correction scale
    // transform-origin: top left ensures it shrinks towards the correct anchor point
    transform: `rotate(${rotation}deg) scale(${correctionScale})`,
    transformOrigin: "top left",

    lineHeight: textNode.lineHeight(),
    margin: 0,
    background:
      note.type === "callout" ? NOTE_COLORS[note.fill] : "transparent",

    // Adjust border thickness so it doesn't get too thin when scaled down
    border: `${2 / correctionScale}px solid #3B82F6`,
    borderRadius:
      note.type === "callout"
        ? `${8 / correctionScale}px`
        : `${4 / correctionScale}px`,
    color: NOTE_STROKE_COLOR,

    resize: "none",
    overflow: "hidden",
    boxSizing: "border-box",
  };
};
interface NoteObjectRendererProps {
  note: NoteObject;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: KonvaEventObject<Event>) => void;
  isDraggable: boolean;
  stageScale: number;
  onTextDblClick: (e: KonvaEventObject<MouseEvent>) => void;
}
const NoteObjectRenderer = memo(
  ({
    note,
    isSelected,
    stageScale,
    onTextDblClick,
    ...props
  }: NoteObjectRendererProps) => {
    const shapeRef = useRef<any>(null);

    const renderShape = () => {
      const commonProps = {
        stroke: NOTE_STROKE_COLOR,
        strokeWidth: 2 / stageScale,
        fill: NOTE_COLORS[note.fill],
      };

      switch (note.type) {
        case "rectangle":
          return (
            <Rect {...commonProps} width={note.width} height={note.height} />
          );
        case "oval":
          return (
            <Ellipse
              {...commonProps}
              width={note.width}
              height={note.height}
              radiusX={note.width / 2}
              radiusY={note.height / 2}
              offsetX={-note.width / 2}
              offsetY={-note.height / 2}
            />
          );
        case "arrow":
          return (
            <Arrow
              points={note.points}
              pointerLength={10 / stageScale}
              pointerWidth={10 / stageScale}
              fill={NOTE_COLORS[note.fill]}
              stroke={"#000000"}
              strokeWidth={5 / stageScale}
            />
          );
        case "text":
          return (
            <Text
              name="text_shape"
              text={note.text || "Double click to edit"}
              fontSize={getFontSize(stageScale)}
              width={note.width || 150}
              height={note.height || 50}
              padding={5}
              verticalAlign="middle"
              fill={NOTE_STROKE_COLOR}
              onDblClick={onTextDblClick}
              onDblTap={onTextDblClick}
            />
          );

        // --- THIS IS THE NEW, MANUALLY RENDERED CALLOUT ---
        case "callout": {
          const pointerWidth = 15;
          const pointerHeight = CALLOUT_POINTER_HEIGHT;
          const cornerRadius = 8;

          let pointerPath = "";
          if (note.pointerDirection === "down") {
            // Pointer at the bottom-middle
            const startX = note.width / 2 - pointerWidth / 2;
            const startY = note.height;
            pointerPath = `M${startX},${startY} L${
              startX + pointerWidth
            },${startY} L${note.width / 2},${startY + pointerHeight} Z`;
          } else {
            // 'up'
            // Pointer at the top-middle
            const startX = note.width / 2 - pointerWidth / 2;
            const startY = 0;
            pointerPath = `M${startX},${startY} L${
              startX + pointerWidth
            },${startY} L${note.width / 2},${startY - pointerHeight} Z`;
          }

          return (
            <Group>
              {/* The main body */}
              <Rect
                {...commonProps}
                width={note.width}
                height={note.height}
                cornerRadius={cornerRadius}
              />
              {/* The pointer, drawn with a Path */}
              <Path
                data={pointerPath}
                fill={commonProps.fill}
                stroke={commonProps.stroke}
                strokeWidth={commonProps.strokeWidth}
              />
              {/* The text, positioned inside the body */}
              <Text
                name="text_shape"
                text={note.text || "Double click to edit"}
                fontSize={getFontSize(stageScale)}
                padding={12}
                fill={NOTE_STROKE_COLOR}
                width={note.width}
                height={note.height}
                verticalAlign="middle"
                onDblClick={onTextDblClick}
                onDblTap={onTextDblClick}
              />
            </Group>
          );
        }
        default:
          return null;
      }
    };

    return (
      <Group
        id={note.id}
        ref={shapeRef}
        x={note.x}
        y={note.y}
        rotation={note.rotation}
        scaleX={note.scaleX}
        scaleY={note.scaleY}
        offsetX={note.offsetX || 0}
        offsetY={note.offsetY || 0}
        draggable={props.isDraggable}
        dragDistance={10}
        onClick={props.onSelect}
        onTap={props.onSelect}
        onDragStart={props.onDragStart}
        onDragEnd={props.onDragEnd}
        onTransformEnd={props.onTransformEnd}
      >
        {renderShape()}
      </Group>
    );
  }
);
NoteObjectRenderer.displayName = "NoteObjectRenderer";

const AngleGuide = memo(
  ({
    p1,
    vertex,
    p3,
    text,
    scale,
  }: Omit<AngleGuideInfo, "id" | "type" | "angle"> & { scale: number }) => {
    const v1 = vNormalize(vSub(p1, vertex));
    const v2 = vNormalize(vSub(p3, vertex));

    if (isNaN(v1.x) || isNaN(v2.x)) return null;

    const bisector = vNormalize(vAdd(v1, v2));
    if (isNaN(bisector.x)) return null;

    const offset = ANGLE_TEXT_OFFSET / scale;
    const textPos = vAdd(vertex, vScale(bisector, offset));
    const fontSize = getFontSize(scale);

    return (
      <Text
        x={textPos.x}
        y={textPos.y}
        text={text}
        fontSize={fontSize}
        fill={"#374151"}
        fontStyle="bold"
        offsetX={(text.length * fontSize * 0.6) / 2}
        offsetY={fontSize / 2}
      />
    );
  }
);
AngleGuide.displayName = "AngleGuide";
interface LengthGuideProps {
  p1: Point;
  p2: Point;
  measurementInPixels?: number;
  scale: number;
  showLabel: boolean;
  dashed?: boolean;
  color?: string;
  strokeWidth?: number;
  offsetVector: Point;
}

const LengthGuide = memo(
  ({
    p1,
    p2,
    measurementInPixels,
    scale,
    showLabel,
    dashed,
    color = "#374151",
    strokeWidth = 2.5,
    offsetVector,
  }: LengthGuideProps) => {
    const trueLength = measurementInPixels ?? calculateDistance(p1, p2);
    const text = formatMeasurement(trueLength);

    const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const vec = vSub(p2, p1);
    const groupRotation = (Math.atan2(vec.y, vec.x) * 180) / Math.PI;

    const finalCenterPosition = vAdd(midPoint, offsetVector);

    const fontSize = getFontSize(scale);
    const estimatedTextWidth = text.length * fontSize * 0.55;
    const effectiveScale = Math.max(scale, MIN_EFFECTIVE_SCALE);
    const padding = 18 / effectiveScale;
    const gapSize = showLabel ? estimatedTextWidth + padding : 0;
    const totalLengthOnScreen = calculateDistance(p1, p2);

    const textRotation =
      groupRotation > 90 || groupRotation < -90
        ? groupRotation + 180
        : groupRotation;

    if (totalLengthOnScreen < gapSize) {
      if (!showLabel) return null;
      return (
        <Text
          x={finalCenterPosition.x}
          y={finalCenterPosition.y}
          text={text}
          fontSize={fontSize}
          fill={color}
          fontStyle="bold"
          offsetX={estimatedTextWidth / 2}
          offsetY={fontSize / 2}
          rotation={textRotation}
          listening={false}
        />
      );
    }

    const lineStart = -totalLengthOnScreen / 2;
    const lineEnd = totalLengthOnScreen / 2;
    const gapStart = -gapSize / 2;
    const gapEnd = gapSize / 2;

    const lineProps = {
      stroke: color,
      strokeWidth: strokeWidth / scale,
      listening: false,
      dash: dashed ? [6 / scale, 6 / scale] : undefined,
    };

    return (
      <Group listening={false}>
        <Group
          x={finalCenterPosition.x}
          y={finalCenterPosition.y}
          rotation={groupRotation}
        >
          <Line points={[lineStart, 0, gapStart, 0]} {...lineProps} />
          <Line points={[gapEnd, 0, lineEnd, 0]} {...lineProps} />
        </Group>
        {showLabel && (
          <Text
            text={text}
            fontSize={fontSize}
            fill={color}
            fontStyle="bold"
            x={finalCenterPosition.x}
            y={finalCenterPosition.y}
            offsetX={estimatedTextWidth / 2}
            offsetY={fontSize / 2}
            rotation={textRotation}
          />
        )}
      </Group>
    );
  }
);
LengthGuide.displayName = "LengthGuide";

interface FinalPolygonProps {
  poly: Polygon;
  stageScale: number;
  grassPattern?: HTMLImageElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: KonvaEventObject<Event>) => void;
  isDraggable: boolean;
  onPointUpdate: (pointIndex: number, newPoint: Point) => void;
  onVertexDragStart: () => void;
  onVertexDragEnd: () => void;
  onAddPoint: (segmentIndex: number, newPoint: Point) => void;
}

const FinalPolygon = memo(
  ({
    poly,
    stageScale,
    grassPattern,
    isSelected,
    onSelect,
    isDraggable,
    onPointUpdate,
    onVertexDragStart,
    onVertexDragEnd,
    onAddPoint,
    opacity = 1,
    isListening = true,
    ...props
  }: FinalPolygonProps) => {
    const groupRef = useRef<Konva.Group>(null);

    const vertices: Point[] = [];
    for (let i = 0; i < poly.points.length; i += 2) {
      vertices.push({ x: poly.points[i], y: poly.points[i + 1] });
    }

    const handlePointDragMove = (
      e: KonvaEventObject<DragEvent>,
      index: number
    ) => {
      const group = groupRef.current;
      if (!group) return;

      const transform = group.getAbsoluteTransform().copy().invert();
      if (!transform) return;

      const circle = e.target as Konva.Circle;
      const pos = circle.getAbsolutePosition();
      const localPos = transform.point(pos);

      onPointUpdate(index, localPos);
      e.cancelBubble = true;
    };

    const handlePointDragEnd = (e: KonvaEventObject<DragEvent>) => {
      onVertexDragEnd();
      e.cancelBubble = true;
    };

    // This now runs on CLICK, not mousedown, to separate clicks from drags.
    const handleEdgeClick = (e: KonvaEventObject<MouseEvent>) => {
      // Only add points if the polygon is selected and not locked.
      if (!isSelected || poly.locked) {
        return;
      }

      // Stop the event from bubbling to the group or stage.
      e.cancelBubble = true;

      const group = groupRef.current;
      const stage = e.target.getStage();
      if (!group || !stage) return;

      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;

      const localPos = group
        .getAbsoluteTransform()
        .copy()
        .invert()
        .point(pointerPos);

      let closestSegmentIndex = -1;
      let minDistance = Infinity;

      for (let i = 0; i < vertices.length; i++) {
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % vertices.length];

        const l2 = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
        if (l2 === 0) continue;

        let t =
          ((localPos.x - p1.x) * (p2.x - p1.x) +
            (localPos.y - p1.y) * (p2.y - p1.y)) /
          l2;
        t = Math.max(0, Math.min(1, t));

        const projection = {
          x: p1.x + t * (p2.x - p1.x),
          y: p1.y + t * (p2.y - p1.y),
        };
        const dist = calculateDistance(localPos, projection);

        if (dist < minDistance) {
          minDistance = dist;
          closestSegmentIndex = i;
        }
      }

      if (closestSegmentIndex !== -1) {
        onAddPoint(closestSegmentIndex, localPos);
      }
    };

    // New handlers to change the cursor on hover
    const handleMouseEnter = (e: KonvaEventObject<MouseEvent>) => {
      if (isSelected && !poly.locked) {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "crosshair";
      }
    };

    const handleMouseLeave = (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      // Reset the cursor; the main component's style will take over.
      if (stage) stage.container().style.cursor = "";
    };

    return (
      <Group
        id={poly.id}
        ref={groupRef}
        x={poly.x}
        y={poly.y}
        opacity={opacity}
        rotation={poly.rotation}
        scaleX={poly.scaleX}
        scaleY={poly.scaleY}
        onClick={onSelect}
        onTap={onSelect}
        draggable={isDraggable}
        dragDistance={10}
        listening={isListening}
        {...props}
      >
        <Line
          points={poly.points}
          fillPatternImage={grassPattern}
          fillPatternScale={{ x: 0.2, y: 0.2 }}
          stroke="black"
          strokeWidth={3 / stageScale}
          closed
          hitStrokeWidth={15 / stageScale}
          // Use onClick for adding points and hover events for the cursor
          onClick={handleEdgeClick}
          onTap={handleEdgeClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        {isSelected &&
          !poly.locked &&
          vertices.map((vertex, index) => (
            <Circle
              key={`handle-${index}`}
              x={vertex.x}
              y={vertex.y}
              radius={8 / stageScale}
              fill="#007AFF"
              stroke="white"
              strokeWidth={2 / stageScale}
              onDragStart={onVertexDragStart}
              draggable
              onDragMove={(e) => handlePointDragMove(e, index)}
              onDragEnd={handlePointDragEnd}
            />
          ))}
      </Group>
    );
  }
);
FinalPolygon.displayName = "FinalPolygon";

interface ObjectIconsProps {
  isLocked: boolean;
  onLockToggle: (e?: KonvaEventObject<MouseEvent>) => void;
  onSettingsClick: (e: KonvaEventObject<MouseEvent>) => void;
  stageScale: number;
  showLock?: boolean;
}
const ObjectIcons = memo(
  ({
    isLocked,
    onLockToggle,
    onSettingsClick,
    stageScale,
    showLock = true,
  }: ObjectIconsProps) => {
    const scaledSize = ICON_SIZE;
    const scaledSpacing = ICON_SPACING;

    const handleInteraction = (
      e: KonvaEventObject<MouseEvent> | KonvaEventObject<TouchEvent>,
      callback: Function
    ) => {
      e.cancelBubble = true;

      // ✅ CRITICAL FIX: The parent component expects e.evt.clientX/Y.
      // On mobile 'tap', the event is 'touchend' which lacks clientX.
      // We manually map the touch coordinates to clientX/Y so the parent doesn't crash.
      const evt = e.evt as any;
      if (evt.changedTouches && evt.changedTouches.length > 0) {
        const touch = evt.changedTouches[0];
        // Polyfill these properties if they are missing
        if (evt.clientX === undefined) evt.clientX = touch.clientX;
        if (evt.clientY === undefined) evt.clientY = touch.clientY;
      }

      callback(e);
    };

    const stopPropagation = (e: KonvaEventObject<TouchEvent>) => {
      e.cancelBubble = true;
    };

    return (
      <Group>
        {showLock && (
          <Group
            x={0}
            onClick={(e) => handleInteraction(e, onLockToggle)}
            onTap={(e) => handleInteraction(e, onLockToggle)}
            onTouchStart={stopPropagation}
            listening={true}
          >
            <Rect
              width={scaledSize}
              height={scaledSize}
              fill={isLocked ? "#F05822" : "#ffffff"}
              cornerRadius={4}
              shadowColor="black"
              shadowBlur={10}
              shadowOpacity={0.2}
              shadowOffset={{ x: 0, y: 2 }}
            />
            <Path
              data={isLocked ? lockIconPath : unlockIconPath}
              fill={isLocked ? "white" : "black"}
              scale={{ x: 1.1, y: 1.1 }}
              fillRule="evenodd"
              offsetX={12}
              offsetY={12}
              x={scaledSize / 2}
              y={scaledSize / 2}
              listening={false} // ✅ Ensure clicks pass through to the Rect
            />
          </Group>
        )}
        {!isLocked && (
          <Group
            x={showLock ? scaledSize + scaledSpacing : 0}
            onClick={(e) => handleInteraction(e, onSettingsClick)}
            onTap={(e) => handleInteraction(e, onSettingsClick)}
            onTouchStart={stopPropagation}
            listening={true}
          >
            <Rect
              width={scaledSize}
              height={scaledSize}
              fill="#ffffff"
              cornerRadius={4}
              shadowColor="black"
              shadowBlur={10}
              shadowOpacity={0.2}
              shadowOffset={{ x: 0, y: 2 }}
            />
            <Path
              data={settingsIconPath}
              fill="black"
              scale={{ x: 1.1, y: 1.1 }}
              offsetX={12}
              offsetY={12}
              x={scaledSize / 2}
              y={scaledSize / 2}
              listening={false} // ✅ Ensure clicks pass through to the Rect
            />
          </Group>
        )}
      </Group>
    );
  }
);
ObjectIcons.displayName = "ObjectIcons";
