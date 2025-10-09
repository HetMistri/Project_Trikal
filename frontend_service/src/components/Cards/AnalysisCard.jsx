import React from "react";
import PrimaryButton from "../Buttons/PrimaryButton";

const AnalysisCard = ({
  summaryData,
  locationData,
  isVisible = false,
  sidebarCollapsed = false,
  className = "",
}) => {
  if (!isVisible || !summaryData) return null;

  const {
    geological,
    environmental,
    riskAssessment,
    recommendations,
    sustainability,
  } = summaryData.analysis;

  return (
    <div
      className={`absolute ${
        sidebarCollapsed
          ? "left-14 sm:left-20"
          : "left-64 sm:left-72 lg:left-[21rem]"
      } top-2 sm:top-4 bottom-2 sm:bottom-4 w-72 sm:w-80 lg:w-96 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl transition-all duration-300 flex flex-col ${className}`}
      style={{
        maxHeight: "calc(100vh - 1rem)",
        "@media (min-width: 640px)": { maxHeight: "calc(100vh - 2rem)" },
      }}
    >
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-white/10">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
          Geological Analysis
        </h2>
        <p className="text-sm text-gray-300">
          {locationData?.address || "Selected Location"}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
            Confidence: {summaryData.confidence}%
          </div>
          <div className="text-xs text-gray-400">
            {new Date(summaryData.timestamp).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-4">
          {/* Geological Section */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              🪨 Geological Composition
            </h3>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-sm font-medium text-white mb-2">
                  Primary Components
                </h4>
                <div className="space-y-1">
                  {geological.composition.map((comp, idx) => (
                    <div key={idx} className="text-sm text-gray-300">
                      • {comp}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-sm font-medium text-white mb-2">
                  Rock Formation
                </h4>
                <div className="space-y-1">
                  {geological.rockFormation.map((rock, idx) => (
                    <div key={idx} className="text-sm text-gray-300">
                      • {rock}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Environmental Section */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Environmental Factors
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="text-xs text-gray-400 mb-1">Soil pH</div>
                <div className="text-sm font-semibold text-white">
                  {environmental.soilPH}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="text-xs text-gray-400 mb-1">Moisture</div>
                <div className="text-sm font-semibold text-white">
                  {environmental.moisture}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="text-xs text-gray-400 mb-1">Drainage</div>
                <div className="text-sm font-semibold text-white">
                  {environmental.drainage}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="text-xs text-gray-400 mb-1">Erosion</div>
                <div className="text-sm font-semibold text-white">
                  {environmental.erosion}
                </div>
              </div>
            </div>
          </section>

          {/* Risk Assessment */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              Risk Assessment
            </h3>
            <div className="space-y-2">
              {Object.entries(riskAssessment).map(([risk, level]) => (
                <div
                  key={risk}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                >
                  <span className="text-sm text-white capitalize">{risk}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      level === "Low"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : level === "Medium"
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
                    }`}
                  >
                    {level}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Recommendations */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              💡 Recommendations
            </h3>
            <div className="space-y-2">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="text-sm text-gray-300">• {rec}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Sustainability */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              🌱 Sustainability Metrics
            </h3>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-gray-400 mb-1">
                  Carbon Footprint
                </div>
                <div className="text-sm font-semibold text-white">
                  {sustainability.carbonFootprint}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-gray-400 mb-1">
                  Biodiversity Index
                </div>
                <div className="text-sm font-semibold text-white">
                  {sustainability.biodiversityIndex}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-gray-400 mb-1">Water Quality</div>
                <div className="text-sm font-semibold text-white">
                  {sustainability.waterQuality}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-3">
          <PrimaryButton
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => console.log("Export report")}
          >
            📄 Export Report
          </PrimaryButton>
          <PrimaryButton
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => console.log("Share analysis")}
          >
            📤 Share
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCard;
