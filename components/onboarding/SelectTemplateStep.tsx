// components/onboarding/SelectTemplateStep.tsx
import React from "react";

interface Template {
  id: string;
  name: string;
  src: string;
  json: string;
}

interface SelectTemplateStepProps {
  templates: Template[];
  onSelectTemplate: (jsonPath: string) => void;
}

const SelectTemplateStep: React.FC<SelectTemplateStepProps> = ({
  templates,
  onSelectTemplate,
}) => {
  return (
    <div>
      <p className="text-gray-600 mt-1 mb-6">
        Choose a pre-designed garden layout to get started quickly.
      </p>
      <div className="grid grid-cols-3 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.json)}
            className="flex flex-col items-center justify-start p-2 border rounded-lg text-center hover:border-green-500 hover:shadow-md transition-all"
          >
            <img
              src={template.src}
              alt={template.name}
              className="w-full h-32 object-cover rounded-md mb-2"
            />
            <span className="font-semibold text-gray-700 text-sm">
              {template.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectTemplateStep;
