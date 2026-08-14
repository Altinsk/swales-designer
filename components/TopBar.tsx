"use client";
import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Save,
  PenBox,
  Trash2,
  Share2,
  Undo2,
  Redo2,
  Printer,
  ImageUp,
  Layers,
  Edit,
  ImageIcon,
  Lock,
  Unlock,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
// ✅ ADDED: Import the new modal component
import { AllGardensModal } from "./AllGardensModal";

type Template = { id: string; name: string; src: string; json: string };

interface Project {
  ProjectId: number;
  Name: string;
  DateLastUpdated: string;
  ThumbnailUrl?: string;
}

interface TopBarProps {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onNewDrawing: () => void;
  onLoadTemplate: (jsonPath: string) => void;
  onUploadPlan: () => void;
  onToggleSketchLayer: () => void;
  onEditSketch: () => void;
  onToggleSketchLock: () => void;
  onDeleteSketch: () => void;
  onPrint: () => void;
  onShare: () => void;
  isSketchVisible: boolean;
  isSketchLocked: boolean;
  templates: Template[];
  className?: string;
  onSave: () => void;
  onSaveAs: () => void;
  onLoadProject: (projectId: number) => void;
  isSaving?: boolean;
}

const Icon = ({
  icon: IconComponent,
  title,
  onClick,
  disabled = false,
}: {
  icon: React.ElementType;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    title={title}
    onClick={onClick}
    disabled={disabled}
    className="p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  >
    <IconComponent className="w-6 h-6 text-[#404040]" strokeWidth={2} />
  </button>
);

const TopBar: React.FC<TopBarProps> = ({
  onUndo,
  onRedo,
  onDelete,
  onNewDrawing,
  onLoadTemplate,
  onUploadPlan,
  onToggleSketchLayer,
  onEditSketch,
  onToggleSketchLock,
  onDeleteSketch,
  onPrint,
  onShare,
  isSketchVisible,
  isSketchLocked,
  templates,
  className = "",
  onSave,
  onSaveAs,
  onLoadProject,
  isSaving = false,
}) => {
  const { user, token } = useAuth();
  const [myGardens, setMyGardens] = useState<Project[]>([]);
  // ✅ ADDED: State to control the modal visibility
  const [isAllGardensModalOpen, setIsAllGardensModalOpen] = useState(false);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const fetchRequestIdRef = useRef(0);
  const fetchMyGardens = async () => {
    if (!token) return;
    const requestId = ++fetchRequestIdRef.current;
    try {
      const res = await axios.get(`${API_URL}/projects?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Ignore this response if a newer fetchMyGardens call has since started.
      if (requestId !== fetchRequestIdRef.current) return;
      // ✅ MODIFIED: Handle both data structures (array or object with projects)
      if (res.data.success) {
        const projectsData = Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data.projects;
        setMyGardens(projectsData);
      }
    } catch (error) {
      console.error("Failed to fetch gardens", error);
    }
  };

  // This function is now passed to the modal for consistency
  const handleDeleteGarden = async (projectId: number) => {
    if (!token) return;
    try {
      await axios.delete(`${API_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Re-fetch the short list for the dropdown after deletion
      fetchMyGardens();
    } catch (error) {
      console.error("Failed to delete garden", error);
      alert("Could not delete garden.");
    }
  };

  const handleLoadAndCloseModal = (projectId: number) => {
    onLoadProject(projectId);
    setIsAllGardensModalOpen(false);
  };

  return (
    <>
      <header
        className={`bg-white/80 backdrop-blur-sm shadow-lg p-2 flex items-center gap-4 justify-between border border-gray-200 rounded-xl ${className}`}
      >
        {/* Left side icons (no change) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Icon
              icon={Save}
              title={!user ? "Log in to save" : isSaving ? "Saving..." : "Save"}
              onClick={onSave}
              disabled={!user || isSaving}
            />
            <Icon
              icon={PenBox}
              title={!user ? "Log in to save" : isSaving ? "Saving..." : "Save As"}
              onClick={onSaveAs}
              disabled={!user || isSaving}
            />
            <Icon icon={Trash2} title="Delete Selected" onClick={onDelete} />
            <Icon icon={Share2} title="Share" onClick={onShare} />
          </div>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <Icon icon={Undo2} title="Undo (Ctrl+Z)" onClick={onUndo} />
            <Icon icon={Redo2} title="Redo (Ctrl+Y)" onClick={onRedo} />
            <Icon
              icon={Printer}
              title={user ? "Print" : "Log in to print"}
              onClick={onPrint}
            />
            <div className="relative group">
              <Icon
                icon={ImageUp}
                title="Planning Sketch"
                onClick={onUploadPlan}
              />
              {isSketchVisible && (
                <div className="absolute left-0 mt-2 w-auto bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-1 z-40">
                  <Icon
                    icon={Layers}
                    title="Bring to Front / Send to Back"
                    onClick={onToggleSketchLayer}
                  />
                  <Icon
                    icon={Edit}
                    title="Edit Sketch Position"
                    onClick={onEditSketch}
                  />
                  <Icon
                    icon={isSketchLocked ? Unlock : Lock}
                    title={isSketchLocked ? "Unlock Sketch" : "Lock Sketch"}
                    onClick={onToggleSketchLock}
                  />
                  <Icon
                    icon={Trash2}
                    title="Delete Sketch"
                    onClick={onDeleteSketch}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-3 mr-2">
          <button
            onClick={onNewDrawing}
            className="px-4 whitespace-nowrap py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            New Drawing
          </button>
          {/* Templates Dropdown (no change) */}
          <div className="relative group">
            <button className="px-4 py-2 text-sm font-semibold text-[#404040] bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">
              Templates
            </button>
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 space-y-1">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onLoadTemplate(template.json)}
                  className="flex items-center p-2 rounded-md hover:bg-gray-100 text-sm w-full text-left"
                >
                  <img
                    src={template.src}
                    alt={template.name}
                    className="w-10 h-10 object-cover rounded-md mr-3"
                  />
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* My Gardens Dropdown */}
          {user && (
            <div className="relative group">
              <button
                onMouseEnter={fetchMyGardens}
                className="px-4 whitespace-nowrap py-2 text-sm font-semibold text-[#404040] bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
              >
                My Gardens
              </button>
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 space-y-1 z-50">
                <div className="flex justify-between items-center text-sm pb-1 border-b border-gray-200">
                  <span className="font-semibold text-[#404040]">
                    Recent Gardens
                  </span>
                  {/* ✅ MODIFIED: Button now opens the modal */}
                  <button
                    onClick={() => setIsAllGardensModalOpen(true)}
                    className="text-blue-600 text-xs cursor-pointer opacity-80 hover:opacity-100 transition-opacity duration-300"
                  >
                    Show All
                  </button>
                </div>
                {myGardens.length > 0 ? (
                  myGardens.map((garden) => (
                    <div
                      key={garden.ProjectId}
                      onClick={() => onLoadProject(garden.ProjectId)}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 text-sm w-full cursor-pointer"
                    >
                      {garden.ThumbnailUrl ? (
                        <img
                          src={garden.ThumbnailUrl}
                          alt={garden.Name}
                          className="w-16 h-12 object-cover rounded-md mr-4 bg-gray-100"
                        />
                      ) : (
                        <div className="w-16 h-12 flex items-center justify-center bg-gray-100 rounded-md mr-4">
                          <ImageIcon className="w-6 h-6 text-[#a3a3a3]" />
                        </div>
                      )}
                      <div className="flex-grow text-left">
                        <p className="font-semibold truncate">{garden.Name}</p>
                        <p className="text-xs text-[#737373]">
                          Updated:{" "}
                          {new Date(
                            garden.DateLastUpdated
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              "Are you sure you want to delete this garden? This cannot be undone."
                            )
                          ) {
                            handleDeleteGarden(garden.ProjectId);
                          }
                        }}
                        className="p-1 rounded-full text-[#a3a3a3] hover:bg-red-100 hover:text-red-600 ml-2 flex-shrink-0"
                        title="Delete Garden"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-[#737373] p-4">
                    You have no saved gardens.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ✅ ADDED: Render the modal when its state is open */}
      <AllGardensModal
        isOpen={isAllGardensModalOpen}
        onClose={() => setIsAllGardensModalOpen(false)}
        onLoadProject={handleLoadAndCloseModal}
        onDeleteProject={handleDeleteGarden}
      />
    </>
  );
};

export default TopBar;
