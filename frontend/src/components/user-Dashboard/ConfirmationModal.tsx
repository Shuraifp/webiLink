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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm Action
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                disabled={loading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 transition-colors ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors ${
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