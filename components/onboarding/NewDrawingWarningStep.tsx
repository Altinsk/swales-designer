// components/onboarding/NewDrawingWarningStep.tsx
import React from "react";

interface NewDrawingWarningStepProps {
  onDiscard: () => void;
  onSave: () => void;
}

const NewDrawingWarningStep: React.FC<NewDrawingWarningStepProps> = ({
  onDiscard,
  onSave,
}) => {
  return (
    <div>
      <p className="text-gray-600 my-4 text-lg">
        Do you want to save your existing garden before you start a new plan?
      </p>
      <div className="mt-8 flex justify-end items-center gap-4">
        <button
          onClick={onDiscard}
          className="px-6 py-2 rounded-full text-gray-700 border border-gray-300 hover:bg-gray-100 transition-colors font-semibold"
        >
          Discard
        </button>
        <button
          onClick={onSave}
          className="px-6 py-2 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default NewDrawingWarningStep;
