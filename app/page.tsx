// app/page.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import {
  Brush,
  Layers,
  MousePointer2,
  MoreHorizontal,
  Plus,
  TreePine,
  X,
  Edit, // <-- ADD THIS
  Trash2,
} from "lucide-react";

// --- Component Imports ---
import TopBar from "@/components/TopBar";
import Toolbar, { PresetItem, Texture } from "@/components/Toolbar";
import CanvasControls from "@/components/CanvasControls";
import Header from "@/components/Header";
import RightToolbar from "@/components/RightToolbar";
import Modal from "@/components/Modal";
import Notification from "@/components/Notification";
import SaveProjectStep from "@/components/onboarding/SaveProjectStep";

// --- Onboarding Step Imports ---
import EnterSizeStep from "@/components/onboarding/EnterSizeStep";
import SelectShapeStep from "@/components/onboarding/SelectShapeStep";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import NewDrawingWarningStep from "@/components/onboarding/NewDrawingWarningStep";
import UploadPlanStep from "@/components/onboarding/UploadPlanStep";
import AlignMeasureStep from "@/components/onboarding/AlignMeasureStep";
import SelectTemplateStep from "@/components/onboarding/SelectTemplateStep";
import SelectPdfPageStep from "@/components/onboarding/SelectPdfPageStep";

// --- Auth Imports ---
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";
import { useAuth } from "@/context/AuthContext";
import { AllGardensModal } from "@/components/AllGardensModal";

// --- Type Definitions (no changes) ---
interface AppConfig {
  tools: any[];
  objects: any[];
  templates: any[];
}
export type NoteShape = "text" | "rectangle" | "oval" | "callout" | "arrow";
export type ActiveToolType = "select" | "plot" | "note";
export interface ActiveTool {
  type: ActiveToolType;
  shape?: NoteShape;
}
export interface CanvasHandles {
  zoomIn: () => void;
  zoomOut: () => void;
  undo: () => void;
  redo: () => void;
  deleteSelected: () => void;
  center: () => void;
  addRectangle: (width: number, height: number) => void;
  isCanvasEmpty: () => boolean;
  getCanvasState: () => string;
  clearCanvas: () => void;
  loadCanvasState: (data: any) => void;
  addPlanningSketch: (data: {
    src: string;
    rotation: number;
    pixelScale: number;
  }) => void;
  toggleSketchLock: () => void;
  deleteSketch: () => void;
  toggleSketchLayer: () => void;
  editSketch: () => void;
  getStageNode: () => any;
}
export type VisibilityToggle = "grid" | "sketch" | "items" | "notes";
export interface VisibilityState {
  grid: boolean;
  sketch: boolean;
  items: boolean;
  notes: boolean;
}

// ✨ NEW: Type for the active mobile panel
type MobilePanel = "tools" | "objects" | "layers" | "actions" | null;

const GardenCanvas = dynamic(() => import("@/components/GardenCanvas"), {
  ssr: false,
});

export default function Home() {
  const { user, token } = useAuth();
  const canvasRef = useRef<CanvasHandles>(null);

  // --- State Management ---
  const [activeTool, setActiveTool] = useState<ActiveTool>({ type: "select" });
  const [selectedPreset, setSelectedPreset] = useState<PresetItem | null>(null);
  const [plotTexture, setPlotTexture] = useState<Texture | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [planningSketch, setPlanningSketch] = useState<any | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [notification, setNotification] = useState<string | null>(null);
  const [currentProject, setCurrentProject] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [pdfPageImages, setPdfPageImages] = useState<string[]>([]);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isCreatingShareLink, setIsCreatingShareLink] = useState(false);
  const postSaveCallback = useRef<(() => void) | null>(null);
  const [visibility, setVisibility] = useState<VisibilityState>({
    grid: true,
    sketch: false,
    items: true,
    notes: true,
  });
  // ✨ NEW: State to manage which mobile panel is open
  const [activeMobilePanel, setActiveMobilePanel] = useState<MobilePanel>(null);

  const [activeModal, setActiveModal] = useState<
    | "welcome"
    | "selectShape"
    | "enterSize"
    | "newDrawingWarning"
    | "uploadPlan"
    | "alignMeasure"
    | "selectTemplate"
    | "selectPdfPage"
    | "login"
    | "signup"
    | "share"
    | "saveAs"
    | "allGardens"
    | null
  >("welcome");

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  // --- Effects (no changes) ---
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

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        body > *, #__next > * { visibility: hidden; }
        #print-container, #print-container * { visibility: visible; }
        #print-container { position: absolute; left: 0; top: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
        #print-image { max-width: 100%; max-height: 100vh; object-fit: contain; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // --- Handlers ---
  const handleCloseModal = () => {
    if (isProcessingPdf) return;
    setActiveModal(null);
  };
  const handlePositionLawn = () => {
    canvasRef.current?.clearCanvas();
    setCurrentProject(null);
    setActiveModal("selectShape");
  };
  const handleSelectRectangle = () => setActiveModal("enterSize");
  const handlePositionPlot = (width: number, height: number) => {
    canvasRef.current?.addRectangle(width, height);
    handleCloseModal();
  };
  const handleSelectPreset = (preset: PresetItem) => {
    setActiveTool({ type: "select" });
    setSelectedPreset(preset);
    setActiveMobilePanel(null); // Close panel on selection
  };
  const handleNewDrawingClick = () => {
    const isEmpty = canvasRef.current?.isCanvasEmpty() ?? true;
    if (isEmpty) {
      handlePositionLawn();
    } else {
      setActiveModal("newDrawingWarning");
    }
    setActiveMobilePanel(null);
  };
  const handlePrint = () => {
    const stage = canvasRef.current?.getStageNode();
    if (!stage) {
      setNotification("Canvas is not ready to print.");
      return;
    }
    const dataURL = stage.toDataURL({ pixelRatio: 2 });
    let printContainer = document.getElementById("print-container");
    if (printContainer) {
      printContainer.innerHTML = "";
    } else {
      printContainer = document.createElement("div");
      printContainer.id = "print-container";
      document.body.appendChild(printContainer);
    }
    const img = new Image();
    img.id = "print-image";
    img.src = dataURL;
    printContainer.appendChild(img);
    img.onload = () => {
      const cleanup = () => {
        if (printContainer) {
          document.body.removeChild(printContainer);
        }
        window.removeEventListener("afterprint", cleanup);
      };
      window.addEventListener("afterprint", cleanup);
      window.print();
    };
    setActiveMobilePanel(null);
  };
  const handleShare = async () => {
    if (!canvasRef.current) return;
    setIsCreatingShareLink(true);
    setNotification("Creating share link...");
    try {
      const canvasState = canvasRef.current.getCanvasState();
      const res = await axios.post(`${API_URL}/shares`, {
        projectData: canvasState,
      });
      if (res.data.success) {
        const url = `${window.location.origin}/share/${res.data.data.uuid}`;
        setShareUrl(url);
        setActiveModal("share");
        setNotification(null);
      }
    } catch (err) {
      setNotification("Error: Could not create share link.");
    } finally {
      setIsCreatingShareLink(false);
      setActiveMobilePanel(null);
    }
  };
  const closeShareModal = () => {
    setShareUrl(null);
    setActiveModal(null);
  };
  const handleLoadTemplate = (templateJsonPath: string) => {
    fetch(templateJsonPath)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          canvasRef.current?.loadCanvasState(data);
          setCurrentProject(null);
          handleCloseModal();
        }
      })
      .catch((err) => console.error("Failed to load template:", err));
    setActiveMobilePanel(null);
  };
  const handleFileUpload = async (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") {
          setUploadedImage(e.target.result);
          setActiveModal("alignMeasure");
        }
      };
      reader.readAsDataURL(file);
    } else if (file.type === "application/pdf") {
      setIsProcessingPdf(true);
      setActiveModal("uploadPlan");
      const formData = new FormData();
      formData.append("pdfFile", file);
      try {
        setNotification("Processing your PDF, this may take a moment...");
        const res = await axios.post(`${API_URL}/upload/pdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setPdfPageImages(res.data.data.imageUrls);
        setActiveModal("selectPdfPage");
      } catch (error) {
        console.error("PDF processing failed", error);
        setNotification("Error: Could not process the PDF file.");
        setActiveModal("uploadPlan");
      } finally {
        setIsProcessingPdf(false);
        setNotification(null);
      }
    }
    setActiveMobilePanel(null);
  };
  const handlePdfPageSelect = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setActiveModal("alignMeasure");
  };
  const getCanvasData = () => {
    if (!canvasRef.current) return null;
    const stage = canvasRef.current.getStageNode();
    if (!stage) return null;
    const canvasState = canvasRef.current.getCanvasState();
    const thumbnail = stage.toDataURL({
      pixelRatio: 0.2,
      mimeType: "image/jpeg",
      quality: 0.6,
    });
    return { canvasState, thumbnail };
  };
  const handleSaveAs = () => {
    setActiveModal("saveAs");
    setActiveMobilePanel(null);
  };
  const executeSaveAs = async (projectName: string) => {
    if (!token) {
      setNotification("You must be logged in to save.");
      return;
    }
    const canvasData = getCanvasData();
    if (!canvasData) return;
    try {
      const res = await axios.post(
        `${API_URL}/projects`,
        {
          name: projectName,
          projectData: canvasData.canvasState,
          thumbnail: canvasData.thumbnail,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setCurrentProject({
          id: res.data.data.ProjectId,
          name: res.data.data.Name,
        });
        setNotification("Garden saved successfully!");
        handleCloseModal();
        if (postSaveCallback.current) {
          postSaveCallback.current();
          postSaveCallback.current = null;
        }
      }
    } catch (err) {
      setNotification("Error: Could not save garden.");
      if (postSaveCallback.current) {
        postSaveCallback.current();
        postSaveCallback.current = null;
      }
    }
  };
  const handleSave = async (options?: { onSuccess?: () => void }) => {
    const canvasData = getCanvasData();
    const { onSuccess } = options || {};
    if (!canvasData || !token) return;
    if (currentProject) {
      try {
        await axios.put(
          `${API_URL}/projects/${currentProject.id}`,
          {
            name: currentProject.name,
            projectData: canvasData.canvasState,
            thumbnail: canvasData.thumbnail,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotification("Garden updated!");
        if (onSuccess) onSuccess();
      } catch (err) {
        setNotification("Error: Could not update garden.");
      }
    } else {
      postSaveCallback.current = onSuccess || null;
      handleSaveAs();
    }
    setActiveMobilePanel(null);
  };
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  const handleLoadProject = async (projectId: number) => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const project = res.data.data;
      if (project && project.ProjectData) {
        const projectData = JSON.parse(project.ProjectData);
        canvasRef.current?.loadCanvasState(projectData);
        setCurrentProject({ id: project.ProjectId, name: project.Name });
        setNotification(`Loaded "${project.Name}"`);
      }
    } catch (err) {
      setNotification("Error: Could not load garden.");
    }
    setActiveMobilePanel(null);
  };
  const handleObjectAdded = () => setSelectedPreset(null);
  const handleVisibilityChange = (key: VisibilityToggle) =>
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  const handleZoomIn = () => canvasRef.current?.zoomIn();
  const handleZoomOut = () => canvasRef.current?.zoomOut();
  const handleUndo = () => {
    canvasRef.current?.undo();
    setActiveMobilePanel(null);
  };
  const handleRedo = () => {
    canvasRef.current?.redo();
    setActiveMobilePanel(null);
  };
  const handleDelete = () => {
    canvasRef.current?.deleteSelected();
    setActiveMobilePanel(null);
  };

  const handleDeleteGarden = async (projectId: number) => {
    if (!token) return;
    try {
      await axios.delete(`${API_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotification("Garden deleted successfully.");
      // NOTE: The modal will re-fetch its own data.
      // If the deleted project was the one currently loaded, you might want to clear the canvas.
      if (currentProject?.id === projectId) {
        handlePositionLawn(); // or canvasRef.current?.clearCanvas();
      }
    } catch (error) {
      console.error("Failed to delete garden", error);
      setNotification("Error: Could not delete garden.");
    }
  };

  // ✨ NEW: Handler to toggle mobile panels
  const toggleMobilePanel = (panel: MobilePanel) => {
    setActiveMobilePanel((current) => (current === panel ? null : panel));
  };

  if (!config) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-200">
        <p className="text-lg font-medium text-gray-600">Loading Planner...</p>
      </div>
    );
  }

  return (
    <>
      {/* ✅ MODIFIED: Changed to a flexbox column layout */}
      <div className="h-dvh w-screen bg-gray-200 font-sans flex flex-col overflow-hidden">
        <Header
          onLoginClick={() => setActiveModal("login")}
          onSignupClick={() => setActiveModal("signup")}
        />

        {/* ✅ MODIFIED: Main content area that grows to fill space */}
        <main className="flex-grow relative overflow-hidden">
          {notification && (
            <Notification
              message={notification}
              onDismiss={() => setNotification(null)}
            />
          )}

          <GardenCanvas
            ref={canvasRef}
            activeTool={activeTool}
            selectedPreset={selectedPreset}
            onObjectAdd={handleObjectAdded}
            setActiveTool={setActiveTool}
            plotTexture={plotTexture}
            config={config}
            planningSketch={planningSketch}
            onSketchChange={setPlanningSketch}
            visibility={visibility}
            onScaleChange={setCanvasScale}
          />

          {/* --- Desktop Toolbars --- */}
          <TopBar
            onUndo={handleUndo}
            onRedo={handleRedo}
            onDelete={handleDelete}
            onNewDrawing={handleNewDrawingClick}
            onLoadTemplate={handleLoadTemplate}
            onPrint={handlePrint}
            onShare={handleShare}
            templates={config.templates}
            // ✅ MODIFIED: Responsive visibility and positioning
            className="hidden lg:flex absolute top-34 left-1/2 -translate-x-1/2 z-30 w-fit"
            onUploadPlan={() => setActiveModal("uploadPlan")}
            onToggleSketchLayer={() => canvasRef.current?.toggleSketchLayer()}
            onToggleSketchLock={() => canvasRef.current?.toggleSketchLock()}
            onDeleteSketch={() => canvasRef.current?.deleteSketch()}
            onEditSketch={() => canvasRef.current?.editSketch()}
            isSketchVisible={!!planningSketch}
            onSave={() => handleSave()}
            onSaveAs={handleSaveAs}
            onLoadProject={handleLoadProject}
          />

          <Toolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            onSelectPreset={handleSelectPreset}
            onSelectTexture={(texture) => {
              setPlotTexture(texture);
              setActiveTool({ type: "plot" });
              setActiveMobilePanel(null);
            }}
            onSelectNoteTool={(shape) => {
              setActiveTool({ type: "note", shape });
              setActiveMobilePanel(null);
            }}
            config={config}
            // ✅ MODIFIED: Responsive visibility and positioning
            className="hidden lg:flex absolute top-44 left-4 z-30"
          />

          <RightToolbar
            visibility={visibility}
            onCenterCanvas={() => canvasRef.current?.center()}
            onVisibilityChange={handleVisibilityChange}
            // ✅ MODIFIED: Responsive visibility and positioning
            className="hidden lg:flex absolute top-44 right-4 z-30"
          />

          <CanvasControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            scaleIndicatorPixels={40 * canvasScale}
          />

          {/* --- Mobile UI --- */}
          <div className="lg:hidden">
            {/* ✨ NEW: Mobile Panel Overlay */}
            {activeMobilePanel && (
              <div
                className="absolute inset-0 bg-black/30 z-40"
                onClick={() => setActiveMobilePanel(null)}
              ></div>
            )}

            {/* ✨ NEW: Panel for Tools & Notes */}
            {activeMobilePanel === "tools" && (
              <div className="absolute bottom-24 left-4 z-50">
                <Toolbar
                  activeTool={activeTool}
                  setActiveTool={setActiveTool}
                  onSelectPreset={handleSelectPreset}
                  onSelectTexture={(texture) => {
                    setPlotTexture(texture);
                    setActiveTool({ type: "plot" });
                    setActiveMobilePanel(null);
                  }}
                  onSelectNoteTool={(shape) => {
                    setActiveTool({ type: "note", shape });
                    setActiveMobilePanel(null);
                  }}
                  config={config}
                  className="w-64" // Give it a fixed width in panel mode
                />
              </div>
            )}

            {/* ✨ NEW: Panel for Layers/Visibility */}
            {activeMobilePanel === "layers" && (
              <div className="absolute bottom-24 right-4 z-50">
                <RightToolbar
                  visibility={visibility}
                  onCenterCanvas={() => canvasRef.current?.center()}
                  onVisibilityChange={handleVisibilityChange}
                />
              </div>
            )}

            {activeMobilePanel === "actions" && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-lg flex flex-col w-64 space-y-1 z-50">
                {/* --- User-specific actions --- */}
                <button
                  onClick={() => handleSave()}
                  disabled={!token}
                  className="w-full text-left p-3 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!token ? "Login to save" : "Save Project"}
                >
                  Save Project
                </button>
                <button
                  onClick={handleShare}
                  disabled={!token}
                  className="w-full text-left p-3 text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!token ? "Login to share" : "Share"}
                >
                  Share
                </button>

                <div className="border-t border-gray-200 mx-2 !my-2"></div>

                {/* --- Planning Sketch Section --- */}
                <button
                  onClick={() => {
                    setActiveModal("uploadPlan");
                    setActiveMobilePanel(null);
                  }}
                  className="w-full text-left p-3 text-gray-700 rounded-lg hover:bg-gray-100"
                  title="Upload Planning Sketch"
                >
                  {planningSketch
                    ? "Change Planning Sketch"
                    : "Upload Planning Sketch"}
                </button>

                {/* Conditionally render sketch controls */}
                {planningSketch && (
                  <div className="pl-4 ml-3 border-l-2 border-gray-200 flex flex-col space-y-1">
                    <button
                      onClick={() => {
                        canvasRef.current?.editSketch();
                        setActiveMobilePanel(null);
                      }}
                      className="flex items-center w-full text-left p-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Edit Sketch Position"
                    >
                      <Edit className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Edit Position</span>
                    </button>
                    {/* <button
                      onClick={() => {
                        canvasRef.current?.toggleSketchLayer();
                        setActiveMobilePanel(null);
                      }}
                      className="flex items-center w-full text-left p-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100"
                      title="Bring to Front / Send to Back"
                    >
                      <Layers className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Toggle Layer</span>
                    </button> */}
                    <button
                      onClick={() => {
                        canvasRef.current?.deleteSketch();
                        setActiveMobilePanel(null);
                      }}
                      className="flex items-center w-full text-left p-2 text-sm text-red-500 rounded-lg hover:bg-red-50"
                      title="Delete Sketch"
                    >
                      <Trash2 className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Delete Sketch</span>
                    </button>
                  </div>
                )}

                <div className="border-t border-gray-200 mx-2 !my-2"></div>

                {/* --- Other Actions --- */}
                <button
                  onClick={() => {
                    setActiveModal("selectTemplate");
                    setActiveMobilePanel(null);
                  }}
                  className="w-full text-left p-3 text-gray-700 rounded-lg hover:bg-gray-100"
                  title="Load a Template"
                >
                  Use a Template
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full text-left p-3 text-gray-700 rounded-lg hover:bg-gray-100"
                  title="Print Page"
                >
                  Print Page
                </button>

                <div className="border-t border-gray-200 mx-2 !my-2"></div>

                {/* --- History and Delete --- */}
                <button
                  onClick={handleUndo}
                  className="w-full text-left p-3 text-gray-700 rounded-lg hover:bg-gray-100"
                  title="Undo"
                >
                  Undo
                </button>
                <button
                  onClick={handleRedo}
                  className="w-full text-left p-3 text-gray-700 rounded-lg hover:bg-gray-100"
                  title="Redo"
                >
                  Redo
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full text-left p-3 text-red-500 rounded-lg hover:bg-red-50"
                  title="Delete Selected"
                >
                  Delete Selected
                </button>
              </div>
            )}
            {/* ✨ NEW: Main Mobile Toolbar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/80 backdrop-blur-md shadow-2xl rounded-full p-2">
              <button
                onClick={() => toggleMobilePanel("tools")}
                className={`p-4 rounded-full transition-colors ${
                  activeMobilePanel === "tools"
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                <Brush className="w-6 h-6" />
              </button>
              <button
                onClick={() => toggleMobilePanel("layers")}
                className={`p-4 rounded-full transition-colors ${
                  activeMobilePanel === "layers"
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                <Layers className="w-6 h-6" />
              </button>
              <button
                onClick={handleNewDrawingClick}
                className="p-6 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transform hover:scale-105 transition-transform"
              >
                <Plus className="w-8 h-8" />
              </button>
              <button
                onClick={() => toggleMobilePanel("actions")}
                className={`p-4 rounded-full transition-colors ${
                  activeMobilePanel === "actions"
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                <MoreHorizontal className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  if (token) {
                    setActiveModal("allGardens");
                  } else {
                    setActiveModal("login");
                  }
                }}
                className="p-4 rounded-full hover:bg-gray-200"
                title={token ? "My Gardens" : "Login to see your gardens"}
              >
                <TreePine className="w-6 h-6" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* --- Modals (No changes needed here) --- */}
      {activeModal === "saveAs" && (
        <Modal
          isOpen={true}
          onClose={handleCloseModal}
          title="Save Your Garden"
        >
          <SaveProjectStep onSave={executeSaveAs} />
        </Modal>
      )}
      {/* ... all other modals ... */}
      {activeModal === "login" && (
        <Modal
          isOpen={true}
          onClose={handleCloseModal}
          title="Login to Your Account"
        >
          {" "}
          <LoginModal
            onClose={handleCloseModal}
            onSwitchToSignup={() => setActiveModal("signup")}
          />{" "}
        </Modal>
      )}
      {activeModal === "signup" && (
        <Modal
          isOpen={true}
          onClose={handleCloseModal}
          title="Create an Account"
        >
          {" "}
          <SignupModal
            onClose={handleCloseModal}
            onSwitchToLogin={() => setActiveModal("login")}
          />{" "}
        </Modal>
      )}
      {activeModal === "welcome" && (
        <Modal
          isOpen={true}
          onClose={handleCloseModal}
          title="Swales permaculture design planner quick guide"
        >
          {" "}
          <WelcomeStep onPositionLawn={handlePositionLawn} />{" "}
        </Modal>
      )}
      {activeModal === "selectShape" && (
        <Modal
          isOpen={true}
          onClose={handleCloseModal}
          title="Select plot shape"
        >
          {" "}
          <SelectShapeStep
            onSelectRectangle={handleSelectRectangle}
            onStartFreeDraw={() => {
              handleCloseModal();
              setActiveTool({ type: "plot" });
              setNotification("Please position your first corner.");
            }}
            onUploadPlan={() => setActiveModal("uploadPlan")}
            onShowTemplates={() => setActiveModal("selectTemplate")}
          />{" "}
        </Modal>
      )}
      {activeModal === "enterSize" && (
        <Modal isOpen={true} onClose={handleCloseModal} title="Enter plot size">
          {" "}
          <EnterSizeStep onPositionPlot={handlePositionPlot} />{" "}
        </Modal>
      )}
      {activeModal === "newDrawingWarning" && (
        <Modal
          isOpen={true}
          onClose={handleCloseModal}
          title="Start a new plan?"
        >
          {" "}
          <NewDrawingWarningStep
            onDiscard={handlePositionLawn}
            onSave={() => {
              if (!token) {
                setActiveModal("login");
                return;
              }

              handleSave({ onSuccess: handlePositionLawn });
            }}
          />{" "}
        </Modal>
      )}
      {activeModal === "uploadPlan" && (
        <Modal
          isOpen={true}
          onClose={handleCloseModal}
          title="Upload existing plan"
        >
          {" "}
          {isProcessingPdf ? (
            <div className="flex flex-col items-center justify-center p-8">
              {" "}
              <svg
                className="animate-spin -ml-1 mr-3 h-10 w-10 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                {" "}
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>{" "}
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>{" "}
              </svg>{" "}
              <p className="mt-4 text-gray-600">Processing PDF...</p>{" "}
            </div>
          ) : (
            <UploadPlanStep
              onFileUpload={handleFileUpload}
              onClose={handleCloseModal}
            />
          )}{" "}
        </Modal>
      )}
      {activeModal === "alignMeasure" && uploadedImage && (
        <Modal isOpen={true} onClose={handleCloseModal} title="Align measure">
          {" "}
          <AlignMeasureStep
            imageSrc={uploadedImage}
            onAddSketch={(data) => {
              const stageNode = canvasRef.current?.getStageNode();
              if (!stageNode) return;
              const { width: viewWidth, height: viewHeight } = stageNode.size();
              const stagePos = stageNode.position();
              const stageScale = stageNode.scaleX();
              const centerX = (viewWidth / 2 - stagePos.x) / stageScale;
              const centerY = (viewHeight / 2 - stagePos.y) / stageScale;
              const newSketch = {
                id: `sketch_${Date.now()}`,
                src: data.src,
                x: centerX,
                y: centerY,
                rotation: data.rotation,
                pixelScale: data.pixelScale,
                locked: true,
                zIndex: 0,
              };
              setPlanningSketch(newSketch);
              handleCloseModal();
            }}
            onClose={handleCloseModal}
          />{" "}
        </Modal>
      )}
      {activeModal === "selectTemplate" && config?.templates && (
        <Modal
          isOpen={true}
          onClose={handleCloseModal}
          title="Select a garden template"
        >
          {" "}
          <SelectTemplateStep
            templates={config.templates}
            onSelectTemplate={handleLoadTemplate}
          />{" "}
        </Modal>
      )}
      {activeModal === "selectPdfPage" && (
        <Modal
          isOpen={true}
          onClose={handleCloseModal}
          title="Select a Page from your PDF"
        >
          {" "}
          <SelectPdfPageStep
            imageUrls={pdfPageImages}
            onSelect={handlePdfPageSelect}
            onClose={handleCloseModal}
          />{" "}
        </Modal>
      )}

      {activeModal === "allGardens" && (
        <AllGardensModal
          isOpen={true}
          onClose={handleCloseModal}
          onLoadProject={(projectId) => {
            handleLoadProject(projectId);
            handleCloseModal();
          }}
          onDeleteProject={handleDeleteGarden}
        />
      )}
      {activeModal === "share" && shareUrl && (
        <Modal
          isOpen={true}
          onClose={closeShareModal}
          title="Share Your Garden Plan"
        >
          {" "}
          <div className="p-4">
            {" "}
            <p className="text-gray-600 mb-3">
              {" "}
              Anyone with this link can view and edit a copy of your garden.{" "}
            </p>{" "}
            <div className="flex items-center space-x-2">
              {" "}
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                onFocus={(e) => e.target.select()}
              />{" "}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  setNotification("Link copied to clipboard!");
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                {" "}
                Copy{" "}
              </button>{" "}
            </div>{" "}
            <div className="mt-4 text-right">
              {" "}
              <button
                onClick={closeShareModal}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {" "}
                Close{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </Modal>
      )}
    </>
  );
}
