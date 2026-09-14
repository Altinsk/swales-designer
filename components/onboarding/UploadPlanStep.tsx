// components/onboarding/UploadPlanStep.tsx
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface UploadPlanStepProps {
  onFileUpload: (file: File) => void;
  onClose: () => void;
}

// Matches the "up to 5 MB" claim in the copy below - dropzone's config had
// no maxSize at all, so that claim was never actually enforced: a much
// larger file was accepted silently, read into a base64 data URL client-
// side, and saved as part of the project JSON with no warning.
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const UploadPlanStep: React.FC<UploadPlanStepProps> = ({
  onFileUpload,
  onClose,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0]);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
    maxSize: MAX_SIZE_BYTES,
  });

  const rejectionError = fileRejections[0]?.errors[0];

  return (
    <div>
      <p className="text-[#525252] my-4">
        Here you can upload an existing plan. This could be a landscape
        architect&apos;s plan or a hand-drawn sketch. Please consider the following:
      </p>
      <ul className="list-disc text-sm list-inside text-[#525252] space-y-2 my-4">
        <li>You can use JPEG or PNG formats with a file size up to 5 MB.</li>
        <li>
          You can use a <strong>PDF</strong> with a file size up to 5 MB and
          choose which page you want to use.
        </li>
        <li>
          The drawing should be as true to scale as possible. As satellite &
          drone images often contain distortions, we advise against their use.
        </li>
      </ul>
      <div
        {...getRootProps()}
        className={`mt-6 p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isDragActive ? "border-green-500 bg-green-50" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-[#737373]">
          Files can be added via drag/drop, clipboard or by{" "}
          <span className="text-green-600 font-semibold">Search</span>.
        </p>
      </div>
      {rejectionError && (
        <p className="text-red-600 text-sm mt-3" role="alert">
          {rejectionError.code === "file-too-large"
            ? `That file is too large — please use a file under 5 MB.`
            : rejectionError.code === "file-invalid-type"
            ? "That file type isn't supported — please use JPEG, PNG, or PDF."
            : rejectionError.message}
        </p>
      )}
      <div className="mt-8 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-full text-[#404040] border border-gray-300 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UploadPlanStep;
