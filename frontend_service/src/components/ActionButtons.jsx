import React from "react";
import { Check, X, Trash2, Loader2 } from "lucide-react";

const ActionButtons = ({
  showSummary,
  isLoading,
  onSubmit,
  onCancel,
  onClear,
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-4 z-1000">
      {!showSummary ? (
        <>
          {/* Submit Button */}
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="group relative px-8 py-4 bg-green-500 hover:bg-green-600 disabled:bg-green-400 disabled:cursor-not-allowed text-white rounded-2xl font-semibold shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-green-500/25 flex items-center space-x-3 min-w-[140px]"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Check className="w-5 h-5" />
            )}
            <span>{isLoading ? "Analyzing..." : "Submit"}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity -z-10"></div>
          </button>

          {/* Cancel Button */}
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="group relative px-8 py-4 bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-2xl font-semibold shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-red-500/25 flex items-center space-x-3"
          >
            <X className="w-5 h-5" />
            <span>Cancel</span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl opacity-0 group-hover:opacity-100 group-disabled:opacity-0 transition-opacity -z-10"></div>
          </button>
        </>
      ) : (
        <>
          {/* Disabled Submit Button */}
          <button
            disabled
            className="px-8 py-4 bg-gray-600 text-gray-400 rounded-2xl font-semibold shadow-2xl cursor-not-allowed flex items-center space-x-3 opacity-60"
          >
            <Check className="w-5 h-5" />
            <span>Submitted</span>
          </button>

          {/* Clear Button */}
          <button
            onClick={onClear}
            className="group relative px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-semibold shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-red-500/25 flex items-center space-x-3"
          >
            <Trash2 className="w-5 h-5" />
            <span>Clear</span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
          </button>
        </>
      )}
    </div>
  );
};

export default ActionButtons;
