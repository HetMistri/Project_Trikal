import React from "react";
import { Clock, MapPin, ChevronRight, Search, TrendingUp } from "lucide-react";

const Sidebar = ({ entries, onEntryClick, selectedEntry }) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCoordinates = (coordinates) => {
    return `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return "text-green-400 bg-green-500/20";
    if (confidence >= 70) return "text-yellow-400 bg-yellow-500/20";
    return "text-red-400 bg-red-500/20";
  };

  return (
    <div className="w-80 h-full bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Project Trikal</h1>
            <p className="text-gray-400 text-sm">Geological Analysis</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3 border border-blue-500/20 backdrop-blur-sm">
          <p className="text-blue-400 text-xs font-medium uppercase tracking-wider mb-1">
            Analysis Sessions
          </p>
          <p className="text-white text-lg font-bold">{entries.length}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <input
            type="text"
            placeholder="Search locations..."
            className="w-full pl-10 pr-4 py-3 text-sm bg-white/5 backdrop-blur-xl border border-white/20 text-white rounded-xl placeholder:text-white/60 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Entries List */}
      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-white font-medium mb-2">No analyses yet</h3>
            <p className="text-sm opacity-75 mb-4">
              Click anywhere on the map to start your first geological analysis
            </p>
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-3 border border-blue-500/20">
              <p className="text-xs text-blue-400">
                💡 Tip: Use the map controls to navigate to your area of
                interest
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2">
            <div className="mb-4 px-2">
              <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Recent Analyses
              </h3>
            </div>

            {entries.map((entry, index) => (
              <div
                key={entry.id}
                onClick={() => onEntryClick(entry)}
                className={`
                  p-4 rounded-xl mb-3 cursor-pointer transition-all duration-300
                  hover:bg-white/10 group relative overflow-hidden border
                  ${
                    selectedEntry?.id === entry.id
                      ? "bg-blue-500/15 border-blue-400/30 shadow-lg shadow-blue-500/10"
                      : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
                  }
                `}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "slideInFromRight 0.6s ease-out forwards",
                }}
              >
                {/* Selection indicator */}
                {selectedEntry?.id === entry.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-blue-600 rounded-r"></div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Header with confidence badge */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium text-sm truncate mr-2">
                        {entry.address.split(",")[0]}
                      </h3>
                      {entry.confidence && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(
                            entry.confidence
                          )}`}
                        >
                          {entry.confidence}%
                        </span>
                      )}
                    </div>

                    {/* Full address */}
                    <p className="text-gray-400 text-xs mb-2 truncate">
                      {entry.address}
                    </p>

                    {/* Coordinates */}
                    <p className="text-gray-500 text-xs mb-3 font-mono">
                      {formatCoordinates(entry.coordinates)}
                    </p>

                    {/* Preview */}
                    <p className="text-gray-300 text-xs mb-3 line-clamp-2">
                      {entry.preview}
                    </p>

                    {/* Timestamp */}
                    <div className="flex items-center text-gray-500 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(entry.timestamp)}
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400 ml-2 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-center">
          <div className="bg-white/5 rounded-lg p-3 mb-3">
            <p className="text-white text-sm font-medium mb-1">
              {entries.length} Analysis Complete
            </p>
            <p className="text-gray-400 text-xs">
              {entries.length > 0
                ? "Great work! Keep exploring."
                : "Ready to start analyzing"}
            </p>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>Powered by Project Trikal</p>
            <p className="opacity-60">v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
