import React from "react";
import IconButton from "../Buttons/IconButton";

const LocationCard = ({
  locationData,
  onDownload,
  onShare,
  sidebarCollapsed = false,
  className = "",
}) => {
  if (!locationData) return null;

  const {
    coordinates,
    address,
    elevation,
    terrain,
    climate,
    soilType,
    vegetation,
  } = locationData;

  return (
    <div
      className={`absolute bottom-24 left-1/2 transform -translate-x-1/2 w-80 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-2xl p-4 shadow-2xl transition-all duration-300 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Location Details
          </h3>
          <p className="text-sm text-gray-300">
            {address || "Unknown Location"}
          </p>
        </div>
        <div className="flex gap-2">
          <IconButton
            icon={<span className="text-sm">📤</span>}
            onClick={onShare}
            variant="ghost"
            size="sm"
            tooltip="Share location"
          />
          <IconButton
            icon={<span className="text-sm">💾</span>}
            onClick={onDownload}
            variant="ghost"
            size="sm"
            tooltip="Download data"
          />
        </div>
      </div>

      {/* Coordinates */}
      <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
        <div className="text-xs text-gray-400 mb-1">Coordinates</div>
        <div className="text-sm font-mono text-white">
          {coordinates?.lat?.toFixed(6) || "..."},{" "}
          {coordinates?.lng?.toFixed(6) || "..."}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-xs text-gray-400 mb-1">Elevation</div>
          <div className="text-sm font-semibold text-white">
            {elevation && elevation !== "..." ? `${elevation}m` : "..."}
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-xs text-gray-400 mb-1">Terrain</div>
          <div className="text-sm font-semibold text-white">
            {terrain || "..."}
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-xs text-gray-400 mb-1">Climate</div>
          <div className="text-sm font-semibold text-white">
            {climate || "..."}
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-xs text-gray-400 mb-1">Soil</div>
          <div className="text-sm font-semibold text-white">
            {soilType || "..."}
          </div>
        </div>
      </div>

      {/* Vegetation */}
      <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
        <div className="text-xs text-gray-400 mb-1">Vegetation</div>
        <div className="text-sm font-semibold text-white">
          {vegetation || "..."}
        </div>
      </div>
    </div>
  );
};

export default LocationCard;
