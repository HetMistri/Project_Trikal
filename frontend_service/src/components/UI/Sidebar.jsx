import React from "react";

const Sidebar = ({
  entries = [],
  onEntryClick,
  selectedEntry,
  isCollapsed = false,
  onToggle,
  className = "",
}) => {
  return (
    <div
      className={`absolute top-0 left-0 h-full bg-white/10 backdrop-blur-3xl border-r border-white/20 flex flex-col shadow-2xl z-[400] transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-80"
      } ${className}`}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute top-6 right-4 z-10 p-2 text-gray-400 hover:text-white transition-colors duration-200"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={isCollapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
          />
        </svg>
      </button>

      {/* Minimized View */}
      {isCollapsed ? (
        <div className="flex flex-col items-center py-6 space-y-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12l5-5 3 3 7-7"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12l5 5 3-3 7 7"
              />
            </svg>
          </div>
          <div className="w-6 h-6 text-gray-400 cursor-pointer hover:text-white transition-colors">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="w-6 h-6 text-gray-400 cursor-pointer hover:text-white transition-colors">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </div>
          <div className="w-6 h-6 text-gray-400 cursor-pointer hover:text-white transition-colors">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01"
              />
            </svg>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12l5-5 3 3 7-7"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12l5 5 3-3 7 7"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Project Trikal</h1>
                <p className="text-sm text-gray-400">Geological Analysis</p>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search locations..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-xl transition-all duration-300"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Analysis Sessions */}
          <div className="flex-1 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white uppercase tracking-wide">
                  Analysis Sessions
                </h2>
                <div className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                  {entries.length}
                </div>
              </div>
            </div>

            {/* Entries List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4">
              {entries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4 flex justify-center">
                    <svg
                      className="w-12 h-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="text-white font-medium mb-2">
                    No analyses yet
                  </div>
                  <div className="text-sm text-gray-400 max-w-48 mx-auto">
                    Click anywhere on the map to start your first geological
                    analysis
                  </div>
                  <div className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <div className="text-xs text-blue-400 mb-2">
                      💡 Tip: Use the map controls to navigate to your area of
                      interest
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pb-4">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      onClick={() => onEntryClick(entry)}
                      className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer group ${
                        selectedEntry?.id === entry.id
                          ? "bg-blue-500/20 border-blue-500/40 shadow-lg"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">
                          {entry.address || "Unknown Location"}
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full border ${
                            entry.confidence >= 90
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : entry.confidence >= 70
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                          }`}
                        >
                          {entry.confidence}%
                        </div>
                      </div>

                      <div className="text-xs text-gray-400 mb-2">
                        {entry.preview}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs font-mono text-gray-500">
                          {entry.coordinates.lat.toFixed(4)},{" "}
                          {entry.coordinates.lng.toFixed(4)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <div className="text-xs text-gray-500 text-center">
              Powered by Project Trikal
              <br />
              v1.0.0
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
