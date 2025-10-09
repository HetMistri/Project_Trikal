import React from "react";
import PrimaryButton from "./PrimaryButton";

const ActionButtons = ({
  showSummary,
  isLoading,
  onSubmit,
  onCancel,
  onClear,
  sidebarCollapsed = false,
  className = "",
}) => {
  const positionClass = showSummary
    ? `bottom-4 ${sidebarCollapsed ? "left-[26rem]" : "left-[42rem]"}`
    : "bottom-4 left-1/2 transform -translate-x-1/2";

  if (showSummary) {
    return (
      <div
        className={`absolute ${positionClass} flex gap-3 transition-all duration-300 ${className}`}
      >
        <PrimaryButton
          onClick={onClear}
          variant="secondary"
          className="shadow-2xl"
        >
          Clear
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div
      className={`absolute ${positionClass} flex gap-3 transition-all duration-300 ${className}`}
    >
      <PrimaryButton onClick={onCancel} variant="ghost" className="shadow-2xl">
        Cancel
      </PrimaryButton>
      <PrimaryButton
        onClick={onSubmit}
        loading={isLoading}
        disabled={isLoading}
        className="shadow-2xl"
      >
        {isLoading ? "Analyzing..." : "Analyze Location"}
      </PrimaryButton>
    </div>
  );
};

export default ActionButtons;
