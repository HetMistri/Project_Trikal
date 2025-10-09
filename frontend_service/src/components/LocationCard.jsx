import React from "react";
import {
  MapPin,
  Mountain,
  Thermometer,
  Ruler,
  AlertTriangle,
  Download,
  Share2,
  FileText,
  TrendingUp,
  Shield,
  Loader2,
  Droplets,
  Trees,
  Gauge,
} from "lucide-react";

const LocationCard = ({
  locationData,
  summaryData,
  showSummary,
  isLoading,
  onDownload,
  onShare,
}) => {
  const formatCoordinate = (coord) => {
    return Math.abs(coord).toFixed(6) + "°" + (coord >= 0 ? "N" : "S");
  };

  const formatLongitude = (coord) => {
    return Math.abs(coord).toFixed(6) + "°" + (coord >= 0 ? "E" : "W");
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "low":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  const LoadingShimmer = () => (
    <div className="summary-loading animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-white/10 rounded w-3/4"></div>
        <div className="h-4 bg-white/10 rounded w-1/2"></div>
        <div className="h-4 bg-white/10 rounded w-2/3"></div>
      </div>
    </div>
  );

  return (
    <div className="location-card absolute bottom-20 left-1/2 transform -translate-x-1/2 w-96 max-w-[90vw] z-1000">
      <div className="bg-black/20 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-xl">
                Location Analysis
              </h3>
              <p className="text-gray-400 text-sm">Geological Survey Results</p>
            </div>
          </div>
          {isLoading && (
            <div className="flex items-center space-x-2 text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs">Analyzing...</span>
            </div>
          )}
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">
              Latitude
            </p>
            <p className="text-white font-mono text-sm font-medium">
              {formatCoordinate(locationData.coordinates.lat)}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">
              Longitude
            </p>
            <p className="text-white font-mono text-sm font-medium">
              {formatLongitude(locationData.coordinates.lng)}
            </p>
          </div>
        </div>

        {/* Basic Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center">
              <Mountain className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-gray-400 text-sm">Terrain</span>
            </div>
            <span className="text-white text-sm font-medium">
              {locationData.terrain}
            </span>
          </div>

          <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center">
              <Ruler className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-gray-400 text-sm">Elevation</span>
            </div>
            <span className="text-white text-sm font-medium">
              {locationData.elevation}m
            </span>
          </div>

          <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center">
              <Thermometer className="w-4 h-4 text-orange-400 mr-2" />
              <span className="text-gray-400 text-sm">Climate</span>
            </div>
            <span className="text-white text-sm font-medium">
              {locationData.climate}
            </span>
          </div>

          <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center">
              <Trees className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-gray-400 text-sm">Vegetation</span>
            </div>
            <span className="text-white text-sm font-medium">
              {locationData.vegetation}
            </span>
          </div>
        </div>

        {/* Address */}
        <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-xl p-4 mb-6 border border-white/10">
          <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">
            Location
          </p>
          <p className="text-white text-sm font-medium">
            {locationData.address}
          </p>
        </div>

        {/* Summary Section */}
        {showSummary && (
          <div className="summary-content mt-6 space-y-6 border-t border-white/10 pt-6">
            {isLoading ? (
              <LoadingShimmer />
            ) : summaryData ? (
              <>
                {/* Confidence Score */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold flex items-center">
                      <Gauge className="w-4 h-4 mr-2 text-blue-400" />
                      Analysis Confidence
                    </h4>
                    <span className="text-blue-400 font-bold">
                      {summaryData.confidence}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${summaryData.confidence}%` }}
                    ></div>
                  </div>
                </div>

                {/* Geological Features */}
                <div>
                  <h4 className="text-white font-semibold mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                    Geological Features
                  </h4>
                  <div className="space-y-3">
                    {summaryData.analysis.geologicalFeatures.map(
                      (feature, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors"
                        >
                          <div className="w-2 h-2 bg-blue-400 rounded-full mr-3 flex-shrink-0"></div>
                          <span className="text-gray-300 text-sm">
                            {feature}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Risk Assessment */}
                <div>
                  <h4 className="text-white font-semibold mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-yellow-400" />
                    Risk Assessment
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(summaryData.analysis.riskAssessment).map(
                      ([risk, level]) => (
                        <div
                          key={risk}
                          className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                        >
                          <span className="text-gray-300 text-sm capitalize font-medium">
                            {risk}
                          </span>
                          <span
                            className={`text-xs px-3 py-1 rounded-full border ${getRiskColor(
                              level
                            )}`}
                          >
                            {level}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Sustainability Metrics */}
                {summaryData.analysis.sustainability && (
                  <div>
                    <h4 className="text-white font-semibold mb-4 flex items-center">
                      <Trees className="w-5 h-5 mr-2 text-green-400" />
                      Sustainability Metrics
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                        <span className="text-gray-300 text-sm">
                          Carbon Footprint
                        </span>
                        <span className="text-white text-sm font-medium">
                          {summaryData.analysis.sustainability.carbonFootprint}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                        <span className="text-gray-300 text-sm">
                          Biodiversity Index
                        </span>
                        <span className="text-white text-sm font-medium">
                          {
                            summaryData.analysis.sustainability
                              .biodiversityIndex
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                        <span className="text-gray-300 text-sm">
                          Water Quality
                        </span>
                        <span className="text-white text-sm font-medium">
                          {summaryData.analysis.sustainability.waterQuality}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div>
                  <h4 className="text-white font-semibold mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-orange-400" />
                    Recommendations
                  </h4>
                  <div className="space-y-3">
                    {summaryData.analysis.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="flex items-start bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                        <span className="text-gray-300 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Options */}
                <div className="flex space-x-3 pt-4 border-t border-white/10">
                  <button
                    onClick={onDownload}
                    className="flex-1 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 group"
                  >
                    <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">Download</span>
                  </button>

                  <button
                    onClick={onShare}
                    className="flex-1 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 group"
                  >
                    <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">Share</span>
                  </button>

                  <button
                    onClick={() => console.log("Report clicked")}
                    className="flex-1 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 group"
                  >
                    <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">Report</span>
                  </button>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationCard;
