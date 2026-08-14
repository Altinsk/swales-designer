// components/onboarding/SaveProjectStep.tsx
import React, { useState } from "react";

interface SaveProjectStepProps {
  onSave: (projectName: string) => void;
  isSaving?: boolean;
}

const SaveProjectStep: React.FC<SaveProjectStepProps> = ({
  onSave,
  isSaving = false,
}) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !isSaving) {
      onSave(name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <div>
        <label
          htmlFor="projectName"
          className="block text-sm font-medium text-[#404040]"
        >
          Garden Name
        </label>
        <input
          type="text"
          id="projectName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
          placeholder="e.g., My Backyard Paradise"
          autoFocus
          required
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!name.trim() || isSaving}
          className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {isSaving ? "Saving..." : "Save Garden"}
        </button>
      </div>
    </form>
  );
};

export default SaveProjectStep;
