// components/Modal.tsx
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  modalClassName?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  modalClassName,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0   z-50 flex justify-center items-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div
        className={`bg-white rounded-lg shadow-2xl p-6 relative animate-fade-in-up ${
          modalClassName ?? "w-full max-w-2xl max-h-[90%] overflow-auto"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9ca3af] hover:text-[#1f2937] transition-colors"
          aria-label="Close modal"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-3xl font-bold text-[#1f2937] mb-2">{title}</h2>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
