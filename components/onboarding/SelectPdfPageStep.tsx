// components/onboarding/SelectPdfPageStep.tsx
import React, { useState } from "react";

interface SelectPdfPageStepProps {
  imageUrls: string[];
  onSelect: (url: string) => void;
  onClose: () => void;
}

const SelectPdfPageStep: React.FC<SelectPdfPageStepProps> = ({
  imageUrls,
  onSelect,
  onClose,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSelect = () => {
    if (selectedImage) {
      onSelect(selectedImage);
    }
  };

  return (
    <div>
      <p className="text-gray-600 my-4">
        Your PDF has been processed. Please select the page you'd like to use as
        your plan.
      </p>
      <div className="max-h-[60vh] overflow-y-auto p-2 bg-gray-100 rounded-lg">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {imageUrls.map((url, index) => (
            <div
              key={url}
              onClick={() => setSelectedImage(url)}
              className={`cursor-pointer border-4 rounded-md transition-all duration-200 ${
                selectedImage === url
                  ? "border-green-500 scale-105"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <img
                src={url}
                alt={`PDF Page ${index + 1}`}
                className="w-full h-auto object-contain rounded-sm"
              />
              <p className="text-center text-xs font-semibold bg-gray-200 p-1">
                Page {index + 1}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 flex justify-end items-center gap-4">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-full text-gray-700 border border-gray-300 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSelect}
          disabled={!selectedImage}
          className="px-6 py-2 rounded-full bg-green-600 text-white font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-700"
        >
          Use this page
        </button>
      </div>
    </div>
  );
};

export default SelectPdfPageStep;
