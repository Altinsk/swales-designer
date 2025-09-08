// app/share/[uuid]/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import axios from "axios";

// --- Component Imports ---
import TopBar from "@/components/TopBar";
import Toolbar, { PresetItem, Texture } from "@/components/Toolbar";
import CanvasControls from "@/components/CanvasControls";
import Header from "@/components/Header";
import RightToolbar from "@/components/RightToolbar";
import Modal from "@/components/Modal";
import Notification from "@/components/Notification";

// --- Onboarding Step Imports ---
import EnterSizeStep from "@/components/onboarding/EnterSizeStep";
import SelectShapeStep from "@/components/onboarding/SelectShapeStep";
import NewDrawingWarningStep from "@/components/onboarding/NewDrawingWarningStep";
import UploadPlanStep from "@/components/onboarding/UploadPlanStep";
import AlignMeasureStep from "@/components/onboarding/AlignMeasureStep";
import SelectTemplateStep from "@/components/onboarding/SelectTemplateStep";
import SelectPdfPageStep from "@/components/onboarding/SelectPdfPageStep";

// --- Auth Imports ---
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";
import { useAuth } from "@/context/AuthContext";

// --- Type Definitions (Copied from page.tsx) ---
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

const GardenCanvas = dynamic(() => import("@/components/GardenCanvas"), {
  ssr: false,
});

export default function SharePage() {
  const params = useParams();
  const uuid = params.uuid as string;

  const { user, token } = useAuth();
  const canvasRef = useRef<CanvasHandles>(null);

  // --- State Management ---
  const [isLoading, setIsLoading] = useState(true);
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

  const [visibility, setVisibility] = useState<VisibilityState>({
    grid: true,
    sketch: false,
    items: true,
    notes: true,
  });

  const [activeModal, setActiveModal] = useState<
    | "selectShape"
    | "enterSize"
    | "newDrawingWarning"
    | "uploadPlan"
    | "alignMeasure"
    | "selectTemplate"
    | "selectPdfPage"
    | "login"
    | "share"
    | "signup"
    | null
  >(null); // Start with no modal on share page

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // --- Effects ---
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

  // Effect to load the shared project data
  // Effect to load the shared project data
  useEffect(() => {
    // This effect will run when config is loaded. At that point, GardenCanvas
    // will be mounted in the same render cycle, making the ref available.
    setNotification("Loading shared garden...");
    setTimeout(() => {
      console.log("Effect triggered with:", {
        uuid,
        config,
        canvasRef: canvasRef,
      });

      if (uuid && config && canvasRef) {
        console.log("All dependencies ready:", {
          uuid,
          config,
          canvasRef: canvasRef.current,
        });

        const loadSharedProject = async () => {
          try {
            const res = await axios.get(`${API_URL}/shares/${uuid}`);
            const project = res.data.data;
            if (project && project.ProjectData) {
              const projectData = JSON.parse(project.ProjectData);
              canvasRef.current?.loadCanvasState(projectData);
              setNotification(
                `Viewing shared garden. Any changes you make here won't affect the original.`
              );
            }
          } catch (err) {
            console.error("Failed to load shared project:", err);
            setNotification(
              "Error: Could not load this shared garden. It may have been deleted."
            );
          }
        };

        loadSharedProject();
      }
    }, 500);
  }, [uuid, config]); // The dependencies are correct

  // All handlers are the same as page.tsx, so we copy them over
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
  };
  const handleNewDrawingClick = () => {
    const isEmpty = canvasRef.current?.isCanvasEmpty() ?? true;
    if (isEmpty) {
      handlePositionLawn();
    } else {
      setActiveModal("newDrawingWarning");
    }
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
  };
  const handlePdfPageSelect = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setActiveModal("alignMeasure");
  };
  const handleSaveAs = async () => {
    const projectName = prompt("Please enter a name for your garden:");
    if (projectName && canvasRef.current && token) {
      const canvasState = canvasRef.current.getCanvasState();
      try {
        const res = await axios.post(
          `${API_URL}/projects`,
          { name: projectName, projectData: canvasState },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          setCurrentProject({
            id: res.data.data.ProjectId,
            name: res.data.data.Name,
          });
          setNotification("Garden saved successfully to your account!");
        }
      } catch (err) {
        setNotification("Error: Could not save garden.");
      }
    } else if (!token) {
      setNotification("Please log in to save your work.");
      setActiveModal("login");
    }
  };
  const handleSave = async () => {
    if (!token) {
      setNotification("Please log in to save your work.");
      setActiveModal("login");
      return;
    }
    // On a shared page, "Save" should act like "Save As"
    // because the user doesn't own this project.
    handleSaveAs();
  };
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
  };
  const handleShare = async () => {
    if (!canvasRef.current) return;

    setNotification("Creating share link...");
    try {
      const canvasState = canvasRef.current.getCanvasState();
      const res = await axios.post(`${API_URL}/shares`, {
        projectData: canvasState,
      });
      if (res.data.success) {
        const url = `${window.location.origin}/share/${res.data.data.uuid}`;
        setShareUrl(url);
        setActiveModal("share"); // Open the share modal
        setNotification(null); // Clear loading notification
      }
    } catch (err) {
      setNotification("Error: Could not create share link.");
    } finally {
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // To trigger the browser's native alert, you must prevent the default action
      // and set a return value (for legacy browser support).
      event.preventDefault();
      event.returnValue = "";
    };

    // Add the event listener when the component mounts
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const closeShareModal = () => {
    setShareUrl(null);
    setActiveModal(null);
  };

  const handleObjectAdded = () => setSelectedPreset(null);
  const handleVisibilityChange = (key: VisibilityToggle) =>
    setVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
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
      <Header
        onLoginClick={() => setActiveModal("login")}
        onSignupClick={() => setActiveModal("signup")}
      />
      <div className="h-screen w-screen bg-gray-200 font-sans relative overflow-hidden ">
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
        <TopBar
          onUndo={handleUndo}
          onRedo={handleRedo}
          onDelete={handleDelete}
          onNewDrawing={handleNewDrawingClick}
          onLoadTemplate={handleLoadTemplate}
          onPrint={() => window.print()}
          templates={config.templates}
          className="absolute top-24 left-1/2 -translate-x-1/2 z-30 w-fit "
          onUploadPlan={() => setActiveModal("uploadPlan")}
          onToggleSketchLayer={() => canvasRef.current?.toggleSketchLayer()}
          onToggleSketchLock={() => canvasRef.current?.toggleSketchLock()}
          onDeleteSketch={() => canvasRef.current?.deleteSketch()}
          onEditSketch={() => canvasRef.current?.editSketch()}
          isSketchVisible={!!planningSketch}
          onSave={handleSave}
          onSaveAs={handleSaveAs}
          onLoadProject={handleLoadProject}
          onShare={handleShare}
        />
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onSelectPreset={handleSelectPreset}
          onSelectTexture={(texture) => {
            setPlotTexture(texture);
            setActiveTool({ type: "plot" });
          }}
          onSelectNoteTool={(shape) => setActiveTool({ type: "note", shape })}
          config={config}
          className="absolute top-40 left-4 z-30"
        />
        <RightToolbar
          visibility={visibility}
          onCenterCanvas={() => canvasRef.current?.center()}
          onVisibilityChange={handleVisibilityChange}
          className="absolute top-40 right-4 z-30"
        />
        <CanvasControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          scaleIndicatorPixels={40 * canvasScale}
        />
        {/* --- Modals --- */}
        {activeModal === "share" && shareUrl && (
          <Modal
            isOpen={true}
            onClose={closeShareModal}
            title="Share Your Garden Plan"
          >
            <div className="p-4">
              <p className="text-gray-600 mb-3">
                Anyone with this link can view and edit a copy of your garden.
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  onFocus={(e) => e.target.select()}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setNotification("Link copied to clipboard!");
                  }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
              <div className="mt-4 text-right">
                <button
                  onClick={closeShareModal}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}
        {activeModal === "login" && (
          <Modal
            isOpen={true}
            onClose={handleCloseModal}
            title="Login to Your Account"
          >
            <LoginModal
              onClose={handleCloseModal}
              onSwitchToSignup={() => setActiveModal("signup")}
            />
          </Modal>
        )}
        {activeModal === "signup" && (
          <Modal
            isOpen={true}
            onClose={handleCloseModal}
            title="Create an Account"
          >
            <SignupModal
              onClose={handleCloseModal}
              onSwitchToLogin={() => setActiveModal("login")}
            />
          </Modal>
        )}
        {activeModal === "selectShape" && (
          <Modal
            isOpen={true}
            onClose={handleCloseModal}
            title="Select plot shape"
          >
            <SelectShapeStep
              onSelectRectangle={handleSelectRectangle}
              onStartFreeDraw={() => {
                handleCloseModal();
                setActiveTool({ type: "plot" });
                setNotification("Please position your first corner.");
              }}
              onUploadPlan={() => setActiveModal("uploadPlan")}
              onShowTemplates={() => setActiveModal("selectTemplate")}
            />
          </Modal>
        )}
        {activeModal === "enterSize" && (
          <Modal
            isOpen={true}
            onClose={handleCloseModal}
            title="Enter plot size"
          >
            <EnterSizeStep onPositionPlot={handlePositionPlot} />
          </Modal>
        )}
        {activeModal === "newDrawingWarning" && (
          <Modal
            isOpen={true}
            onClose={handleCloseModal}
            title="Start a new plan?"
          >
            <NewDrawingWarningStep
              onDiscard={handlePositionLawn}
              onSave={handleSave}
            />
          </Modal>
        )}
        {activeModal === "uploadPlan" && (
          <Modal
            isOpen={true}
            onClose={handleCloseModal}
            title="Upload existing plan"
          >
            {isProcessingPdf ? (
              <div className="flex flex-col items-center justify-center p-8">
                <svg
                  className="animate-spin -ml-1 mr-3 h-10 w-10 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="mt-4 text-gray-600">Processing PDF...</p>
              </div>
            ) : (
              <UploadPlanStep
                onFileUpload={handleFileUpload}
                onClose={handleCloseModal}
              />
            )}
          </Modal>
        )}
        {activeModal === "alignMeasure" && uploadedImage && (
          <Modal isOpen={true} onClose={handleCloseModal} title="Align measure">
            <AlignMeasureStep
              imageSrc={uploadedImage}
              onAddSketch={(data) => {
                const stageNode = canvasRef.current?.getStageNode();
                if (!stageNode) return;
                const { width: viewWidth, height: viewHeight } =
                  stageNode.size();
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
            />
          </Modal>
        )}
        {activeModal === "selectTemplate" && config?.templates && (
          <Modal
            isOpen={true}
            onClose={handleCloseModal}
            title="Select a garden template"
          >
            <SelectTemplateStep
              templates={config.templates}
              onSelectTemplate={handleLoadTemplate}
            />
          </Modal>
        )}
        {activeModal === "selectPdfPage" && (
          <Modal
            isOpen={true}
            onClose={handleCloseModal}
            title="Select a Page from your PDF"
          >
            <SelectPdfPageStep
              imageUrls={pdfPageImages}
              onSelect={handlePdfPageSelect}
              onClose={handleCloseModal}
            />
          </Modal>
        )}
      </div>
    </>
  );
}
