// components/onboarding/SelectShapeStep.tsx
import { Upload, LayoutTemplate, PenTool } from "lucide-react"; // Using lucide-react for icons
import React from "react";

// A reusable card component for this step
const ShapeCard = ({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className="flex flex-col items-center justify-center p-4 border rounded-lg text-center hover:border-green-500 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <div className="mb-2">{children}</div>
    <span className="font-semibold text-gray-700">{label}</span>
  </button>
);

interface SelectShapeStepProps {
  onSelectRectangle: () => void;
  onStartFreeDraw: () => void;
  onUploadPlan: () => void;
  onShowTemplates: () => void;
}

const SelectShapeStep: React.FC<SelectShapeStepProps> = ({
  onSelectRectangle,
  onStartFreeDraw,
  onUploadPlan,
  onShowTemplates,
}) => {
  return (
    <div>
      <p className="text-gray-600 mt-1 mb-6">
        How would you like to start your garden plan?
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <ShapeCard onClick={onSelectRectangle} label="Draw rectangular garden">
          <div className="w-24 h-24 flex items-center justify-center">
            <img src="/draw_rect.png" alt="Draw rectangle" />
          </div>
        </ShapeCard>
        <ShapeCard onClick={onStartFreeDraw} label="Draw any plot shape">
          <div className="w-24 h-24 flex items-center justify-center">
            <img src="/draw_plot.png" alt="Draw freeform plot" />
          </div>
        </ShapeCard>
        <ShapeCard onClick={onUploadPlan} label="Upload planning sketch">
          <div className="w-24 h-24 flex items-center justify-center">
            <Upload className="w-12 h-12 text-gray-500" />
          </div>
        </ShapeCard>
        <ShapeCard onClick={onShowTemplates} label="Use garden template">
          <div className="w-24 h-24 flex items-center justify-center">
            <img src="/garden_template.png" alt="Garden templates" />
          </div>
        </ShapeCard>
      </div>
    </div>
  );
};

export default SelectShapeStep;
