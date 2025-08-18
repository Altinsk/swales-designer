// components/GardenCanvas.tsx
"use-client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
  memo,
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
} from "react-konva";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { PresetItem, Texture } from "./Toolbar"; // Import types
import PresetObject from "./PresetObject"; // Import the actual component
import { VisibilityState } from "@/app/page"; // Import visibility state type

// --- Configuration ---
const PIXELS_PER_METER = 40;
const GRID_SIZE = PIXELS_PER_METER;
const INITIAL_PRESET_SIZE = 100;
const MIN_FONT_SIZE = 10;
const SNAP_THRESHOLD = 6;
const ANGLE_SNAP_THRESHOLD = 8;
const CLOSE_THRESHOLD = 15;
const ANGLE_TEXT_OFFSET = 50;
const GUIDE_HIDE_THRESHOLD = 20;
const ICON_SIZE = 50;
const ICON_SPACING = 5;

const lockIconPath =
  "M5.25 9.30277V8C5.25 4.27208 8.27208 1.25 12 1.25C15.7279 1.25 18.75 4.27208 18.75 8V9.30277C18.9768 9.31872 19.1906 9.33948 19.3918 9.36652C20.2919 9.48754 21.0497 9.74643 21.6517 10.3483C22.2536 10.9503 22.5125 11.7081 22.6335 12.6082C22.75 13.4752 22.75 14.5775 22.75 15.9451V16.0549C22.75 17.4225 22.75 18.5248 22.6335 19.3918C22.5125 20.2919 22.2536 21.0497 21.6517 21.6516C21.0497 22.2536 20.2919 22.5125 19.3918 22.6335C18.5248 22.75 17.4225 22.75 16.0549 22.75H7.94513C6.57754 22.75 5.47522 22.75 4.60825 22.6335C3.70814 22.5125 2.95027 22.2536 2.34835 21.6516C1.74643 21.0497 1.48754 20.2919 1.36652 19.3918C1.24996 18.5248 1.24998 17.4225 1.25 16.0549V15.9451C1.24998 14.5775 1.24996 13.4752 1.36652 12.6082C1.48754 11.7081 1.74643 10.9503 2.34835 10.3483C2.95027 9.74643 3.70814 9.48754 4.60825 9.36652C4.80938 9.33948 5.02317 9.31872 5.25 9.30277ZM6.75 8C6.75 5.10051 9.10051 2.75 12 2.75C14.8995 2.75 17.25 5.10051 17.25 8V9.25344C16.8765 9.24999 16.4784 9.24999 16.0549 9.25H7.94513C7.52161 9.24999 7.12353 9.24999 6.75 9.25344V8ZM3.40901 11.409C3.68577 11.1322 4.07435 10.9518 4.80812 10.8531C5.56347 10.7516 6.56459 10.75 8 10.75H16C17.4354 10.75 18.4365 10.7516 19.1919 10.8531C19.9257 10.9518 20.3142 11.1322 20.591 11.409C20.8678 11.6858 21.0482 12.0743 21.1469 12.8081C21.2484 13.5635 21.25 14.5646 21.25 16C21.25 17.4354 21.2484 18.4365 21.1469 19.1919C21.0482 19.9257 20.8678 20.3142 20.591 20.591C20.3142 20.8678 19.9257 21.0482 19.1919 21.1469C18.4365 21.2484 17.4354 21.25 16 21.25H8C6.56459 21.25 5.56347 21.2484 4.80812 21.1469C4.07435 21.0482 3.68577 20.8678 3.40901 20.591C3.13225 20.3142 2.9518 19.9257 2.85315 19.1919C2.75159 18.4365 2.75 17.4354 2.75 16C2.75 14.5646 2.75159 13.5635 2.85315 12.8081C2.9518 12.0743 3.13225 11.6858 3.40901 11.409Z";
const unlockIconPath =
  "M6.75 8C6.75 5.10051 9.10051 2.75 12 2.75C14.4453 2.75 16.5018 4.42242 17.0846 6.68694C17.1879 7.08808 17.5968 7.32957 17.9979 7.22633C18.3991 7.12308 18.6405 6.7142 18.5373 6.31306C17.788 3.4019 15.1463 1.25 12 1.25C8.27208 1.25 5.25 4.27208 5.25 8V9.30277C5.02317 9.31872 4.80938 9.33948 4.60825 9.36652C3.70814 9.48754 2.95027 9.74643 2.34835 10.3483C1.74643 10.9503 1.48754 11.7081 1.36652 12.6082C1.24996 13.4752 1.24998 14.5775 1.25 15.9451V16.0549C1.24998 17.4225 1.24996 18.5248 1.36652 19.3918C1.48754 20.2919 1.74643 21.0497 2.34835 21.6516C2.95027 22.2536 3.70814 22.5125 4.60825 22.6335C5.47522 22.75 6.57754 22.75 7.94513 22.75H16.0549C17.4225 22.75 18.5248 22.75 19.3918 22.6335C20.2919 22.5125 21.0497 22.2536 21.6517 21.6516C22.2536 21.0497 22.5125 20.2919 22.6335 19.3918C22.75 18.5248 22.75 17.4225 22.75 16.0549V15.9451C22.75 14.5775 22.75 13.4752 22.6335 12.6082C22.5125 11.7081 22.2536 10.9503 21.6517 10.3483C21.0497 9.74643 20.2919 9.48754 19.3918 9.36652C18.5248 9.24996 17.4225 9.24998 16.0549 9.25H7.94513C7.52161 9.24999 7.12353 9.24999 6.75 9.25344V8ZM3.40901 11.409C3.68577 11.1322 4.07435 10.9518 4.80812 10.8531C5.56347 10.7516 6.56459 10.75 8 10.75H16C17.4354 10.75 18.4365 10.7516 19.1919 10.8531C19.9257 10.9518 20.3142 11.1322 20.591 11.409C20.8678 11.6858 21.0482 12.0743 21.1469 12.8081C21.2484 13.5635 21.25 14.5646 21.25 16C21.25 17.4354 21.2484 18.4365 21.1469 19.1919C21.0482 19.9257 20.8678 20.3142 20.591 20.591C20.3142 20.8678 19.9257 21.0482 19.1919 21.1469C18.4365 21.2484 17.4354 21.25 16 21.25H8C6.56459 21.25 5.56347 21.2484 4.80812 21.1469C4.07435 21.0482 3.68577 20.8678 3.40901 20.591C3.13225 20.3142 2.9518 19.9257 2.85315 19.1919C2.75159 18.4365 2.75 17.4354 2.75 16C2.75 14.5646 2.75159 13.5635 2.85315 12.8081C2.9518 12.0743 3.13225 11.6858 3.40901 11.409Z";
const settingsIconPath =
  "M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84 c-0.24,0-0.44,0.17-0.48,0.41L9.18,5.05C8.59,5.29,8.06,5.62,7.56,5.99L5.17,5.03C4.95,4.95,4.7,5.02,4.58,5.24l-1.92,3.32 c-0.12,0.22-0.07,0.47,0.12,0.61l2.03,1.58C4.74,11.36,4.72,11.68,4.72,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.42,2.24 c0.04,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.48-0.41l0.42-2.24c0.59-0.24,1.12-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0.01,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z";

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
type HistoryState = { polygons: Polygon[]; placedObjects: PlacedObject[] };
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
  Math.max(14 / stageScale, MIN_FONT_SIZE);
const vSub = (p1: Point, p2: Point) => ({ x: p1.x - p2.x, y: p1.y - p2.y });
const vAdd = (p1: Point, p2: Point) => ({ x: p1.x + p2.x, y: p1.y + p2.y });
const vScale = (p: Point, s: number) => ({ x: p.x * s, y: p.y * s });
const vLength = (p: Point) => Math.sqrt(p.x * p.x + p.y * p.y);
const vNormalize = (p: Point) => {
  const len = vLength(p);
  return len > 0 ? vScale(p, 1 / len) : { x: 0, y: 0 };
};
const dotProduct = (p1: Point, p2: Point) => p1.x * p2.x + p1.y * p2.y;

// --- Main Component ---
const GardenCanvas = forwardRef<
  any, // Using 'any' for simplicity with the extended handles
  {
    activeTool: Tool;
    selectedPreset: PresetItem | null;
    onObjectAdd: () => void;
    setActiveTool: (tool: Tool) => void;
    plotTexture: Texture | null;
    config: any;
    visibility: VisibilityState;
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
    },
    ref
  ) => {
    const [polygons, setPolygons] = useState<Polygon[]>([]);
    const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
    const [dimensions, setDimensions] = useState({ width: 1, height: 1 });
    const [currentPoints, setCurrentPoints] = useState<number[]>([]);
    const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 });
    const [selectedId, selectShape] = useState<string | null>(null);
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
      { polygons: [], placedObjects: [] },
    ]);
    const [historyStep, setHistoryStep] = useState(0);
    const trRef = useRef<Konva.Transformer>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleLockToggle = (id: string) => {
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
    };

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
      if (
        JSON.stringify(lastState) !==
        JSON.stringify({ polygons, placedObjects })
      ) {
        currentHistory.push({ polygons, placedObjects });
        setHistory(currentHistory);
        setHistoryStep(currentHistory.length - 1);
      }
    }, [history, historyStep, polygons, placedObjects]);

    const handleUndo = useCallback(() => {
      if (historyStep > 0) {
        const newStep = historyStep - 1;
        const prevState = history[newStep];
        setPolygons(prevState.polygons);
        setPlacedObjects(prevState.placedObjects);
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
        setHistoryStep(newStep);
        selectShape(null);
      }
    }, [history, historyStep]);

    const handleDelete = useCallback(() => {
      if (!selectedId) return;
      setPolygons((polygons) => polygons.filter((p) => p.id !== selectedId));
      setPlacedObjects((placedObjects) =>
        placedObjects.filter((o) => o.id !== selectedId)
      );
      selectShape(null);
    }, [selectedId]);

    // Preload all textures from config
    useEffect(() => {
      const allTextures = config?.tools.find((t: any) => t.id === "plot")
        ?.textures as Texture[];
      if (allTextures) {
        const loaded: { [key: string]: HTMLImageElement } = {};
        allTextures.forEach((tex) => {
          const image = new window.Image();
          image.src = tex.src;
          image.crossOrigin = "Anonymous";
          image.onload = () => {
            loaded[tex.id] = image;
            // This update is a bit inefficient, but simple
            setTextures((prev) => ({ ...prev, [tex.id]: image }));
          };
        });
      }
    }, [config]);

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
        if ((e.ctrlKey || e.metaKey) && e.key === "y") {
          e.preventDefault();
          handleRedo();
        }
        if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
          e.preventDefault();
          handleDelete();
        }
        if (
          e.key === "Escape" &&
          activeTool === "plot" &&
          currentPoints.length > 0
        ) {
          e.preventDefault();
          setCurrentPoints([]);
          setActiveTool("select");
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
    ]);

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
        };
        setPlacedObjects((prev) => [...prev, newObject]);
        onObjectAdd();
        selectShape(newObject.id);
      }
    }, [
      selectedPreset,
      dimensions,
      onObjectAdd,
      stage.x,
      stage.y,
      stage.scale,
    ]);

    useEffect(() => {
      const transformer = trRef.current;
      const selectedNode = stageRef.current?.findOne("#" + selectedId);

      const selectedPoly = polygons.find((p) => p.id === selectedId);
      const selectedObj = placedObjects.find((o) => o.id === selectedId);

      if (
        transformer &&
        selectedNode &&
        !selectedPoly?.locked &&
        !selectedObj?.locked
      ) {
        transformer.nodes([selectedNode]);
      } else if (transformer) {
        transformer.nodes([]);
      }
      transformer?.getLayer()?.batchDraw();
    }, [selectedId, polygons, placedObjects]);

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

    const handleObjectDragEnd = (e: KonvaEventObject<DragEvent>) => {
      e.cancelBubble = true;
      const node = e.target;
      const id = node.id();
      setPolygons((current) =>
        current.map((p) =>
          p.id === id ? { ...p, x: node.x(), y: node.y() } : p
        )
      );
      setPlacedObjects((current) =>
        current.map((o) =>
          o.id === id ? { ...o, x: node.x(), y: node.y() } : o
        )
      );
    };

    const handleTransformEnd = (e: KonvaEventObject<Event>) => {
      e.cancelBubble = true;
      const node = e.target;
      const id = node.id();
      const commonProps = {
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        scaleX: node.scaleX(),
        scaleY: node.scaleY(),
      };
      setPolygons((current) =>
        current.map((p) => (p.id === id ? { ...p, ...commonProps } : p))
      );
      setPlacedObjects((current) =>
        current.map((o) => (o.id === id ? { ...o, ...commonProps } : o))
      );
    };

    useImperativeHandle(ref, () => ({
      zoomIn: () => setStage((s) => ({ ...s, scale: s.scale * 1.2 })),
      zoomOut: () => setStage((s) => ({ ...s, scale: s.scale / 1.2 })),
      undo: handleUndo,
      redo: handleRedo,
      deleteSelected: handleDelete,
    }));

    const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        selectShape(null);
        setMenu(null); // Close menu on deselect
      }
    };

    const finishPlotting = () => {
      if (currentPoints.length < 6) return;
      const newPolygon: Polygon = {
        id: `poly_${Date.now()}`,
        points: [...currentPoints],
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        locked: false,
        textureId: plotTexture?.id,
      };
      setPolygons((prev) => [...prev, newPolygon]);
      setCurrentPoints([]);
      selectShape(newPolygon.id);
      setActiveTool("select");
    };

    const handleCanvasClick = (e: KonvaEventObject<MouseEvent>) => {
      if (e.target !== e.target.getStage()) {
        return;
      }
      if (activeTool !== "plot") return;
      if (isClosing) {
        finishPlotting();
        return;
      }
      const pos = stageRef.current?.getRelativePointerPosition();
      if (!pos) return;

      const clickPos = snapDetails.isSnapped ? snapDetails.point : pos;
      setCurrentPoints((prev) => [...prev, clickPos.x, clickPos.y]);
      setIsNearVertex(true);
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

      if (activeTool !== "plot" || currentPoints.length === 0) {
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

    const handleSettingsClick = (
      e: KonvaEventObject<MouseEvent>,
      polyId: string
    ) => {
      e.evt.preventDefault();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const x = e.evt.clientX - containerRect.left;
      const y = e.evt.clientY - containerRect.top;

      setMenu({ x: x - 5, y: y - 130, polyId });
    };

    const copyPolygon = (
      polyId: string,
      direction: "horizontal" | "vertical"
    ) => {
      const polyToCopy = polygons.find((p) => p.id === polyId);
      const node = stageRef.current?.findOne("#" + polyId);
      if (!polyToCopy || !node) return;

      const BoundingBox = node.getClientRect({ skipTransform: false });
      const newX =
        direction === "horizontal"
          ? polyToCopy.x + BoundingBox.width
          : polyToCopy.x;
      const newY =
        direction === "vertical"
          ? polyToCopy.y + BoundingBox.height
          : polyToCopy.y;

      const newPoly: Polygon = {
        ...polyToCopy,
        id: `poly_${Date.now()}`,
        x: newX,
        y: newY,
        locked: false,
      };

      setPolygons((p) => [...p, newPoly]);
      selectShape(newPoly.id);
      setMenu(null);
    };
    const copyObject = (
      objectId: string,
      direction: "horizontal" | "vertical"
    ) => {
      const node = stageRef.current?.findOne("#" + objectId);
      if (!node) return;

      const polyToCopy = polygons.find((p) => p.id === objectId);
      const objToCopy = placedObjects.find((o) => o.id === objectId);

      const boundingBox = node.getClientRect({ skipTransform: false });

      // 1. Get the current scale from the stage
      const currentScale = stageRef.current?.scaleX() || 1;

      // 2. Calculate the true, unscaled width and height
      const unscaledWidth = boundingBox.width / currentScale;
      const unscaledHeight = boundingBox.height / currentScale;

      if (polyToCopy) {
        const newPoly: Polygon = {
          ...polyToCopy,
          id: `poly_${Date.now()}`,
          x:
            direction === "horizontal"
              ? polyToCopy.x + unscaledWidth // 3. Use the unscaled width
              : polyToCopy.x,
          y:
            direction === "vertical"
              ? polyToCopy.y + unscaledHeight // 3. Use the unscaled height
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
              ? objToCopy.x + unscaledWidth // 3. Use the unscaled width
              : objToCopy.x,
          y:
            direction === "vertical"
              ? objToCopy.y + unscaledHeight // 3. Use the unscaled height
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
            stroke="#e5e7eb"
            strokeWidth={1 / scale}
          />
        );
      for (let j = startCellY; j <= endCellY; j++)
        lines.push(
          <Line
            key={`h${j}`}
            points={[topLeft.x, j * GRID_SIZE, bottomRight.x, j * GRID_SIZE]}
            stroke="#e5e7eb"
            strokeWidth={1 / scale}
          />
        );
      return lines;
    };

    const snapColor = "#AFD069";
    const defaultColor = "#374151";
    const plottingShapes = React.useMemo(() => {
      if (activeTool !== "plot" || currentPoints.length === 0) {
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

    return (
      <div
        ref={containerRef}
        className={`w-full h-full bg-white overflow-hidden ${
          activeTool == "select" ? "cursor-grab" : "cursor-crosshair"
        }`}
      >
        <Stage
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={checkDeselect}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          ref={stageRef}
          scaleX={stage.scale}
          scaleY={stage.scale}
          x={stage.x}
          y={stage.y}
          draggable={activeTool === "select"}
          onDragMove={handleStageDrag}
          onDragEnd={handleStageDrag}
          onWheel={handleWheel}
        >
          <Layer listening={false} visible={visibility.grid}>
            {renderGrid()}
          </Layer>
          <Layer visible={visibility.items}>
            {activeTool === "plot" && (
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

            {polygons.map((poly) => (
              <FinalPolygon
                key={poly.id}
                poly={poly}
                stageScale={stage.scale}
                grassPattern={textures[poly.textureId || ""]}
                isSelected={selectedId === poly.id}
                onSelect={() => {
                  selectShape(poly.id);
                  setMenu(null);
                }}
                onDragEnd={handleObjectDragEnd}
                onTransformEnd={handleTransformEnd}
                onLockToggle={() => handleLockToggle(poly.id)}
                isDraggable={activeTool === "select" && !poly.locked}
                onSettingsClick={(e) => handleSettingsClick(e, poly.id)}
                onPointUpdate={(pointIndex, newPoint) =>
                  handlePolygonPointUpdate(poly.id, pointIndex, newPoint)
                }
              />
            ))}

            {placedObjects.map((obj) => {
              const isSelected = selectedId === obj.id;
              // Use the BASE dimensions, NOT multiplied by scale here
              const baseWidth = obj.width || INITIAL_PRESET_SIZE;
              const baseHeight = obj.height || INITIAL_PRESET_SIZE;

              const halfW = baseWidth / 2;
              const halfH = baseHeight / 2;

              // Corner points are now based on unscaled dimensions
              const corners = {
                tl: { x: -halfW, y: -halfH },
                tr: { x: halfW, y: -halfH },
                br: { x: halfW, y: halfH },
                bl: { x: -halfW, y: halfH },
              };

              return (
                <Group
                  key={obj.id}
                  id={obj.id}
                  x={obj.x}
                  y={obj.y}
                  rotation={obj.rotation || 0}
                  // CORRECT: Apply the object's scale to the group directly.
                  // The Transformer will now correctly modify these values.
                  scaleX={obj.scaleX || 1}
                  scaleY={obj.scaleY || 1}
                  draggable={activeTool === "select" && !obj.locked}
                  onClick={(e) => {
                    selectShape(obj.id);
                    setMenu(null);
                    e.cancelBubble = true;
                  }}
                  onTap={(e) => {
                    selectShape(obj.id);
                    setMenu(null);
                    e.cancelBubble = true;
                  }}
                  onDragEnd={handleObjectDragEnd}
                  onTransformEnd={handleTransformEnd}
                >
                  <PresetObject
                    shapeProps={{
                      ...obj,
                      // CORRECT: Pass the base, unscaled dimensions to the image
                      width: baseWidth,
                      height: baseHeight,
                    }}
                    onSelect={() => selectShape(obj.id)}
                  />

                  {/* Side lengths now use the corrected component and props */}
                  {isSelected && (
                    <Group listening={false}>
                      <UprightLengthText
                        p1={corners.tl}
                        p2={corners.tr}
                        scale={stage.scale}
                        parentRotation={obj.rotation || 0}
                        objectScaleX={obj.scaleX || 1}
                        objectScaleY={obj.scaleY || 1}
                        offset={-20}
                      />
                      {/* <UprightLengthText
                        p1={corners.tr}
                        p2={corners.br}
                        scale={stage.scale}
                        parentRotation={obj.rotation || 0}
                        objectScaleX={obj.scaleX || 1}
                        objectScaleY={obj.scaleY || 1}
                        offset={-20}
                      />
                      <UprightLengthText
                        p1={corners.br}
                        p2={corners.bl}
                        scale={stage.scale}
                        parentRotation={obj.rotation || 0}
                        objectScaleX={obj.scaleX || 1}
                        objectScaleY={obj.scaleY || 1}
                        offset={-20}
                      /> */}
                      <UprightLengthText
                        p1={corners.bl}
                        p2={corners.tl}
                        scale={stage.scale}
                        parentRotation={obj.rotation || 0}
                        objectScaleX={obj.scaleX || 1}
                        objectScaleY={obj.scaleY || 1}
                        offset={-30}
                      />
                    </Group>
                  )}

                  {/* External Icons */}
                  {isSelected && (
                    <Group
                      x={0} // Position to the right of the object
                      // Position above the BASE height
                      y={0}
                    >
                      <ObjectIcons
                        isLocked={!!obj.locked}
                        onLockToggle={() => handleLockToggle(obj.id)}
                        onSettingsClick={(e) => handleSettingsClick(e, obj.id)}
                        stageScale={stage.scale * (obj.scaleY || 1)} // Adjust icon scale based on object scale
                      />
                    </Group>
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
              // UPDATE: Keep transformer aspect ratio for presets
              keepRatio={placedObjects.some((o) => o.id === selectedId)}
            />
          </Layer>
        </Stage>

        {/* UPDATE: Use generalized copyObject function */}
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
      </div>
    );
  }
);
GardenCanvas.displayName = "GardenCanvas";
export default GardenCanvas;

// --- 🔽 GUIDE COMPONENTS 🔽 ---

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
  scale: number;
  showLabel: boolean;
  dashed?: boolean;
  color?: string;
  strokeWidth?: number;
  offset?: number;
}

const LengthGuide = memo(
  ({
    p1,
    p2,
    scale,
    showLabel,
    dashed,
    color = "#374151",
    strokeWidth = 2.5,
    offset = 0,
  }: LengthGuideProps) => {
    const text = formatMeasurement(calculateDistance(p1, p2));
    const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const vec = vSub(p2, p1);
    const groupRotation = (Math.atan2(vec.y, vec.x) * 180) / Math.PI;

    const fontSize = getFontSize(scale);
    const estimatedTextWidth = text.length * fontSize * 0.55;
    const padding = 18 / scale;
    const gapSize = showLabel ? estimatedTextWidth + padding : 0;
    const totalLength = calculateDistance(p1, p2);

    if (totalLength < gapSize) {
      if (!showLabel) return null;
      // For very short lines, just show the text, already centered
      const textRotation = 0;
      return (
        <Text
          x={midPoint.x}
          y={midPoint.y}
          text={text}
          fontSize={fontSize}
          fill={color}
          fontStyle="bold"
          offsetX={estimatedTextWidth / 2}
          offsetY={fontSize / 2}
          rotation={textRotation}
        />
      );
    }

    const lineStart = -totalLength / 2;
    const lineEnd = totalLength / 2;
    const gapStart = -gapSize / 2;
    const gapEnd = gapSize / 2;

    const lineProps = {
      stroke: color,
      strokeWidth: strokeWidth / scale,
      listening: false,
      dash: dashed ? [6 / scale, 6 / scale] : undefined,
    };

    const textRotation = -groupRotation;

    return (
      <Group x={midPoint.x} y={midPoint.y} rotation={groupRotation}>
        <Group y={offset / scale}>
          <Line points={[lineStart, 0, gapStart, 0]} {...lineProps} />
          {showLabel && (
            <Text
              text={text}
              fontSize={fontSize}
              fill={color}
              fontStyle="bold"
              offsetX={estimatedTextWidth / 2}
              offsetY={fontSize / 2}
              y={0}
              rotation={textRotation}
            />
          )}
          <Line points={[gapEnd, 0, lineEnd, 0]} {...lineProps} />
        </Group>
      </Group>
    );
  }
);
LengthGuide.displayName = "LengthGuide";

// --- 🔽 UPDATED COMPONENT FOR FINAL POLYGONS 🔽 ---
interface FinalPolygonProps {
  poly: Polygon;
  stageScale: number;
  grassPattern?: HTMLImageElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: KonvaEventObject<Event>) => void;
  onLockToggle: () => void;
  isDraggable: boolean;
  onSettingsClick: (e: KonvaEventObject<MouseEvent>) => void;
  onPointUpdate: (pointIndex: number, newPoint: Point) => void;
}

const FinalPolygon = memo(
  ({
    poly,
    stageScale,
    grassPattern,
    isSelected,
    onSelect,
    onLockToggle,
    isDraggable,
    onSettingsClick,
    onPointUpdate,
    ...props
  }: FinalPolygonProps) => {
    const groupRef = useRef<Konva.Group>(null);

    const vertices: Point[] = [];
    for (let i = 0; i < poly.points.length; i += 2) {
      vertices.push({ x: poly.points[i], y: poly.points[i + 1] });
    }

    const centroid = vertices.reduce(
      (acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y }),
      { x: 0, y: 0 }
    );
    if (vertices.length > 0) {
      centroid.x /= vertices.length;
      centroid.y /= vertices.length;
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
      e.cancelBubble = true;
    };

    // const lockIconPath =
    //   "M5.25 9.30277V8C5.25 4.27208 8.27208 1.25 12 1.25C15.7279 1.25 18.75 4.27208 18.75 8V9.30277C18.9768 9.31872 19.1906 9.33948 19.3918 9.36652C20.2919 9.48754 21.0497 9.74643 21.6517 10.3483C22.2536 10.9503 22.5125 11.7081 22.6335 12.6082C22.75 13.4752 22.75 14.5775 22.75 15.9451V16.0549C22.75 17.4225 22.75 18.5248 22.6335 19.3918C22.5125 20.2919 22.2536 21.0497 21.6517 21.6516C21.0497 22.2536 20.2919 22.5125 19.3918 22.6335C18.5248 22.75 17.4225 22.75 16.0549 22.75H7.94513C6.57754 22.75 5.47522 22.75 4.60825 22.6335C3.70814 22.5125 2.95027 22.2536 2.34835 21.6516C1.74643 21.0497 1.48754 20.2919 1.36652 19.3918C1.24996 18.5248 1.24998 17.4225 1.25 16.0549V15.9451C1.24998 14.5775 1.24996 13.4752 1.36652 12.6082C1.48754 11.7081 1.74643 10.9503 2.34835 10.3483C2.95027 9.74643 3.70814 9.48754 4.60825 9.36652C4.80938 9.33948 5.02317 9.31872 5.25 9.30277ZM6.75 8C6.75 5.10051 9.10051 2.75 12 2.75C14.8995 2.75 17.25 5.10051 17.25 8V9.25344C16.8765 9.24999 16.4784 9.24999 16.0549 9.25H7.94513C7.52161 9.24999 7.12353 9.24999 6.75 9.25344V8ZM3.40901 11.409C3.68577 11.1322 4.07435 10.9518 4.80812 10.8531C5.56347 10.7516 6.56459 10.75 8 10.75H16C17.4354 10.75 18.4365 10.7516 19.1919 10.8531C19.9257 10.9518 20.3142 11.1322 20.591 11.409C20.8678 11.6858 21.0482 12.0743 21.1469 12.8081C21.2484 13.5635 21.25 14.5646 21.25 16C21.25 17.4354 21.2484 18.4365 21.1469 19.1919C21.0482 19.9257 20.8678 20.3142 20.591 20.591C20.3142 20.8678 19.9257 21.0482 19.1919 21.1469C18.4365 21.2484 17.4354 21.25 16 21.25H8C6.56459 21.25 5.56347 21.2484 4.80812 21.1469C4.07435 21.0482 3.68577 20.8678 3.40901 20.591C3.13225 20.3142 2.9518 19.9257 2.85315 19.1919C2.75159 18.4365 2.75 17.4354 2.75 16C2.75 14.5646 2.75159 13.5635 2.85315 12.8081C2.9518 12.0743 3.13225 11.6858 3.40901 11.409Z";
    // const unlockIconPath =
    //   "M6.75 8C6.75 5.10051 9.10051 2.75 12 2.75C14.4453 2.75 16.5018 4.42242 17.0846 6.68694C17.1879 7.08808 17.5968 7.32957 17.9979 7.22633C18.3991 7.12308 18.6405 6.7142 18.5373 6.31306C17.788 3.4019 15.1463 1.25 12 1.25C8.27208 1.25 5.25 4.27208 5.25 8V9.30277C5.02317 9.31872 4.80938 9.33948 4.60825 9.36652C3.70814 9.48754 2.95027 9.74643 2.34835 10.3483C1.74643 10.9503 1.48754 11.7081 1.36652 12.6082C1.24996 13.4752 1.24998 14.5775 1.25 15.9451V16.0549C1.24998 17.4225 1.24996 18.5248 1.36652 19.3918C1.48754 20.2919 1.74643 21.0497 2.34835 21.6516C2.95027 22.2536 3.70814 22.5125 4.60825 22.6335C5.47522 22.75 6.57754 22.75 7.94513 22.75H16.0549C17.4225 22.75 18.5248 22.75 19.3918 22.6335C20.2919 22.5125 21.0497 22.2536 21.6517 21.6516C22.2536 21.0497 22.5125 20.2919 22.6335 19.3918C22.75 18.5248 22.75 17.4225 22.75 16.0549V15.9451C22.75 14.5775 22.75 13.4752 22.6335 12.6082C22.5125 11.7081 22.2536 10.9503 21.6517 10.3483C21.0497 9.74643 20.2919 9.48754 19.3918 9.36652C18.5248 9.24996 17.4225 9.24998 16.0549 9.25H7.94513C7.52161 9.24999 7.12353 9.24999 6.75 9.25344V8ZM3.40901 11.409C3.68577 11.1322 4.07435 10.9518 4.80812 10.8531C5.56347 10.7516 6.56459 10.75 8 10.75H16C17.4354 10.75 18.4365 10.7516 19.1919 10.8531C19.9257 10.9518 20.3142 11.1322 20.591 11.409C20.8678 11.6858 21.0482 12.0743 21.1469 12.8081C21.2484 13.5635 21.25 14.5646 21.25 16C21.25 17.4354 21.2484 18.4365 21.1469 19.1919C21.0482 19.9257 20.8678 20.3142 20.591 20.591C20.3142 20.8678 19.9257 21.0482 19.1919 21.1469C18.4365 21.2484 17.4354 21.25 16 21.25H8C6.56459 21.25 5.56347 21.2484 4.80812 21.1469C4.07435 21.0482 3.68577 20.8678 3.40901 20.591C3.13225 20.3142 2.9518 19.9257 2.85315 19.1919C2.75159 18.4365 2.75 17.4354 2.75 16C2.75 14.5646 2.75159 13.5635 2.85315 12.8081C2.9518 12.0743 3.13225 11.6858 3.40901 11.409Z";
    // const settingsIconPath =
    //   "M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84 c-0.24,0-0.44,0.17-0.48,0.41L9.18,5.05C8.59,5.29,8.06,5.62,7.56,5.99L5.17,5.03C4.95,4.95,4.7,5.02,4.58,5.24l-1.92,3.32 c-0.12,0.22-0.07,0.47,0.12,0.61l2.03,1.58C4.74,11.36,4.72,11.68,4.72,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.42,2.24 c0.04,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.48-0.41l0.42-2.24c0.59-0.24,1.12-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0.01,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z";

    const iconSize = 45;

    return (
      <Group
        id={poly.id}
        ref={groupRef}
        x={poly.x}
        y={poly.y}
        rotation={poly.rotation}
        scaleX={poly.scaleX}
        scaleY={poly.scaleY}
        onClick={onSelect}
        onTap={onSelect}
        draggable={isDraggable}
        {...props}
      >
        <Line
          points={poly.points}
          fillPatternImage={grassPattern}
          fillPatternScale={{ x: 0.2, y: 0.2 }}
          stroke="black"
          strokeWidth={3 / stageScale}
          closed
        />
        {isSelected &&
          vertices.map((p1, i) => {
            const p2 = vertices[(i + 1) % vertices.length];
            const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
            const centroidToMid = vSub(midPoint, centroid);
            const edgeVec = vSub(p2, p1);
            const localYNormal = { x: -edgeVec.y, y: edgeVec.x };
            const dot = dotProduct(localYNormal, centroidToMid);
            const offsetSign = Math.sign(dot) || 1;
            const desiredOffset = 20;

            return (
              <LengthGuide
                key={`side-${i}`}
                p1={p1}
                p2={p2}
                scale={stageScale}
                showLabel={true}
                color="black"
                strokeWidth={1.5}
                offset={offsetSign * desiredOffset}
              />
            );
          })}
        {isSelected && (
          <Group
            x={centroid.x - (iconSize + 10) / 2 / stageScale}
            y={centroid.y}
            scaleX={1 / stageScale}
            scaleY={1 / stageScale}
            onClick={(e) => {
              e.cancelBubble = true;
              onLockToggle();
            }}
            onTap={(e) => {
              e.cancelBubble = true;
              onLockToggle();
            }}
          >
            <Rect
              width={iconSize}
              height={iconSize}
              offsetX={iconSize / 2}
              offsetY={iconSize / 2}
              fill={poly.locked ? "#F05822" : "#ffffffff"}
              cornerRadius={2}
              opacity={0.9}
              shadowColor="black"
              shadowBlur={10}
              shadowOpacity={0.3}
            />
            <Path
              data={poly.locked ? lockIconPath : unlockIconPath}
              fill={poly.locked ? "white" : "black"}
              fillRule="evenodd"
              scale={{ x: 1.3, y: 1.3 }}
              offsetX={12}
              offsetY={12}
            />
          </Group>
        )}
        {isSelected && !poly.locked && (
          <Group
            x={centroid.x + (iconSize + 10) / 2 / stageScale}
            y={centroid.y}
            scaleX={1 / stageScale}
            scaleY={1 / stageScale}
            onClick={(e) => {
              e.cancelBubble = true;
              onSettingsClick(e);
            }}
            onTap={(e) => {
              e.cancelBubble = true;
              onSettingsClick(e);
            }}
          >
            <Rect
              width={iconSize}
              height={iconSize}
              offsetX={iconSize / 2}
              offsetY={iconSize / 2}
              fill={"#ffffff"}
              cornerRadius={2}
              opacity={0.9}
              shadowColor="black"
              shadowBlur={10}
              shadowOpacity={0.3}
            />
            <Path
              data={settingsIconPath}
              fill={"black"}
              scale={{ x: 1.3, y: 1.3 }}
              offsetX={12}
              offsetY={12}
            />
          </Group>
        )}
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

interface UprightLengthTextProps {
  p1: Point;
  p2: Point;
  scale: number; // This is the stage's scale for font size
  offset?: number;
  parentRotation: number;
  objectScaleX: number; // The object's own scaleX
  objectScaleY: number; // The object's own scaleY
}

const UprightLengthText = memo(
  ({
    p1,
    p2,
    scale,
    offset = 0,
    parentRotation,
    objectScaleX,
    objectScaleY,
  }: UprightLengthTextProps) => {
    // Calculate distance based on unscaled points
    const baseDist = calculateDistance(p1, p2);

    // Determine if the edge is primarily horizontal or vertical
    const isHorizontal = Math.abs(p1.y - p2.y) < 1;

    // Apply the object's own scale to get the final visual distance
    const finalDist = isHorizontal
      ? baseDist * objectScaleX
      : baseDist * objectScaleY;
    const text = formatMeasurement(finalDist);

    const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const vec = vSub(p2, p1);

    // Normal vector to the edge for offsetting the text
    const normal = vNormalize({ x: -vec.y, y: vec.x });
    const textPos = vAdd(midPoint, vScale(normal, offset / scale));
    const fontSize = getFontSize(scale);

    return (
      <Text
        x={textPos.x}
        y={textPos.y}
        text={text}
        fontSize={fontSize}
        padding={10}
        fill="black"
        fontStyle="bold"
        offsetX={(text.length * fontSize * 0.55) / 2}
        offsetY={fontSize / 2}
        rotation={-parentRotation} // Counter-rotate to stay upright
        listening={false}
      />
    );
  }
);
UprightLengthText.displayName = "UprightLengthText";

interface ObjectIconsProps {
  isLocked: boolean;
  onLockToggle: (e: KonvaEventObject<MouseEvent>) => void;
  onSettingsClick: (e: KonvaEventObject<MouseEvent>) => void;
  stageScale: number;
}
const ObjectIcons = memo(
  ({
    isLocked,
    onLockToggle,
    onSettingsClick,
    stageScale,
  }: ObjectIconsProps) => {
    const iconScale = 1 / stageScale;
    const scaledSize = ICON_SIZE * iconScale;
    const scaledSpacing = ICON_SPACING * iconScale;

    const handleEvent = (
      e: KonvaEventObject<MouseEvent>,
      callback: Function
    ) => {
      e.cancelBubble = true;
      callback(e);
    };

    return (
      <Group>
        {/* Lock Icon */}
        <Group
          x={-(scaledSize + scaledSpacing) / 2}
          onClick={(e) => handleEvent(e, onLockToggle)}
          onTap={(e) => handleEvent(e, onLockToggle)}
        >
          <Rect
            width={scaledSize}
            height={scaledSize}
            fill={isLocked ? "#F05822" : "#ffffff"}
            cornerRadius={4 * iconScale}
            shadowColor="black"
            shadowBlur={10 * iconScale}
            shadowOpacity={0.2}
            shadowOffset={{ x: 0, y: 2 * iconScale }}
          />
          <Path
            data={isLocked ? lockIconPath : unlockIconPath}
            fill={isLocked ? "white" : "black"}
            scale={{ x: 1.3 * iconScale, y: 1.3 * iconScale }}
            fillRule="evenodd"
            offsetX={12}
            offsetY={12}
            x={scaledSize / 2}
            y={scaledSize / 2}
          />
        </Group>
        {/* Settings Icon (only if not locked) */}
        {!isLocked && (
          <Group
            x={(scaledSize + scaledSpacing) / 2}
            onClick={(e) => handleEvent(e, onSettingsClick)}
            onTap={(e) => handleEvent(e, onSettingsClick)}
          >
            <Rect
              width={scaledSize}
              height={scaledSize}
              fill="#ffffff"
              cornerRadius={4 * iconScale}
              shadowColor="black"
              shadowBlur={10 * iconScale}
              shadowOpacity={0.2}
              shadowOffset={{ x: 0, y: 2 * iconScale }}
            />
            <Path
              data={settingsIconPath}
              fill="black"
              scale={{ x: 1.3 * iconScale, y: 1.3 * iconScale }}
              offsetX={12}
              offsetY={12}
              x={scaledSize / 2}
              y={scaledSize / 2}
            />
          </Group>
        )}
      </Group>
    );
  }
);
ObjectIcons.displayName = "ObjectIcons";
