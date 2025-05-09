"use client";

import { X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export default function ConfirmationModal({
  message,
  isModalOpen,
  setIsModalOpen,
  onConfirm,
  loading = false,
}: {
  message: string;
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  onConfirm: () => void;
  loading?: boolean;
}) {
  return (
    <>
      {isModalOpen && (
        <div
          className="fixed inset-0 z-20 min-h-screen flex justify-center items-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="bg-white w-96 py-8 px-4 rounded-lg shadow-lg max-w-sm">
            <div className="flex justify-between items-center mb-5">
              <p className="text-2xl raleway ml-2 font-semibold text-center text-gray-700">
                Confirmation
              </p>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-white focus:outline-none rounded-sm text-red-700 hover:text-red-800 mr-1 cursor-pointer"
                disabled={loading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <p>{message}</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    onConfirm();
                    setIsModalOpen(false);
                  }}
                  className={`w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Confirm"}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={`w-full py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}