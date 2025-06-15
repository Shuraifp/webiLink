"use client";

import { X } from "lucide-react";
import { createContext, useContext, useState } from "react";

interface ConfirmationModalContextType {
  confirm: (message: string, onConfirm: () => void) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const ConfirmationModalContext = createContext<
  ConfirmationModalContextType | undefined
>(undefined);

export const useConfirmationModal = () => {
  const context = useContext(ConfirmationModalContext);
  if (!context) {
    throw new Error(
      "useConfirmationModal must be used within a ConfirmationModalProvider"
    );
  }
  return context;
};

export const ConfirmationModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);
  const [loading, setLoading] = useState(false);

  const confirm = (msg: string, callback: () => void) => {
    setMessage(msg);
    setOnConfirm(() => callback);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    setIsModalOpen(false);
    setMessage("");
    setOnConfirm(null);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setMessage("");
    setOnConfirm(null);
  };

  return (
    <ConfirmationModalContext.Provider value={{ confirm, loading, setLoading }}>
      {children}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        >
          <div className="bg-white w-96 py-8 px-4 rounded-lg shadow-lg max-w-sm">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-semibold text-gray-700">
                Confirmation
              </h2>
              <button
                onClick={handleClose}
                className="text-red-700 hover:text-red-800 transition-colors"
                disabled={loading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex space-x-2">
              <button
                onClick={handleClose}
                className={`w-full py-3 rounded-lg text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 transition-colors ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`w-full py-3 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmationModalContext.Provider>
  );
};