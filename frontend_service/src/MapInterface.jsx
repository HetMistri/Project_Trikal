import React, { useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ZoomIn,
  ZoomOut,
  Layers,
  MapPin,
  Satellite,
  Mountain,
  Activity,
  AlertTriangle,
  Info,
  BarChart3,
} from "lucide-react";
import L from "leaflet";

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Map click handler component
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

const MapInterface = () => {
  // State management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState([27.9881, 86.925]); // Everest region
  const [mapZoom, setMapZoom] = useState(10);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeLayer, setActiveLayer] = useState("satellite");
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Layer configurations
  const layers = {
    satellite: {
      name: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution:
        "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    },
    terrain: {
      name: "Terrain",
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    },
    standard: {
      name: "Standard",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  };

  // Event handlers
  const handleMapClick = useCallback((latlng) => {
    setSelectedLocation(latlng);
    console.log("Location selected:", latlng);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedLocation) return;

    setIsAnalyzing(true);

    // Simulate API call
    setTimeout(() => {
      setAnalysisResults({
        location: selectedLocation,
        riskLevel: "High",
        confidence: 0.87,
        landslideRisk: 0.73,
        floodRisk: 0.45,
        recommendations: [
          "Implement early warning systems",
          "Conduct regular slope stability monitoring",
          "Establish evacuation routes",
        ],
      });
      setIsAnalyzing(false);
    }, 2000);
  }, [selectedLocation]);

  const handleZoomIn = useCallback(() => {
    setMapZoom((prev) => Math.min(prev + 1, 18));
  }, []);

  const handleZoomOut = useCallback(() => {
    setMapZoom((prev) => Math.max(prev - 1, 3));
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-900 overflow-hidden">
      {/* Main Map Container */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100vh", width: "100vw" }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url={layers[activeLayer].url}
            attribution={layers[activeLayer].attribution}
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Selected Location</p>
                  <p className="text-sm text-gray-600">
                    {selectedLocation.lat.toFixed(4)},{" "}
                    {selectedLocation.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Sidebar Toggle Button */}
      <motion.button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-6 left-6 z-50 p-3 rounded-lg text-white shadow-lg transition-all duration-300 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          transform: sidebarOpen ? "translateX(320px)" : "translateX(0px)",
        }}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="fixed left-0 top-0 h-full w-80 z-40 bg-black/30 backdrop-blur-xl border-r border-white/10"
          >
            <div className="p-6 h-full overflow-y-auto">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Project Trikal
                </h1>
                <p className="text-white/70 text-sm">
                  AI-Powered Geohazard Analysis Platform
                </p>
              </div>

              {/* Location Info */}
              {selectedLocation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-blue-400" />
                    <span className="text-white font-medium">
                      Selected Location
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">
                    Lat: {selectedLocation.lat.toFixed(4)}
                    <br />
                    Lng: {selectedLocation.lng.toFixed(4)}
                  </p>
                  <motion.button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="mt-3 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition-colors"
                    whileHover={{ scale: isAnalyzing ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isAnalyzing ? "Analyzing..." : "Run Analysis"}
                  </motion.button>
                </motion.div>
              )}

              {/* Layer Controls */}
              <div className="mb-6">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Layers size={16} />
                  Map Layers
                </h3>
                <div className="space-y-2">
                  {Object.entries(layers).map(([key, layer]) => (
                    <button
                      key={key}
                      onClick={() => setActiveLayer(key)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        activeLayer === key
                          ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
                          : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      {layer.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-6">
                <h3 className="text-white font-medium mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 transition-colors">
                    View Historical Data
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 transition-colors">
                    Download Report
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 transition-colors">
                    Share Analysis
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Controls */}
      <div className="fixed top-6 right-6 z-40 flex flex-col gap-2">
        <motion.button
          onClick={handleZoomIn}
          className="p-3 rounded-lg text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ZoomIn size={20} />
        </motion.button>
        <motion.button
          onClick={handleZoomOut}
          className="p-3 rounded-lg text-white bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ZoomOut size={20} />
        </motion.button>
      </div>

      {/* Analysis Results */}
      <AnimatePresence>
        {analysisResults && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 w-96 z-40 bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <BarChart3 size={18} />
                Analysis Results
              </h3>
              <button
                onClick={() => setAnalysisResults(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Risk Level:</span>
                <span
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    analysisResults.riskLevel === "High"
                      ? "bg-red-600/30 text-red-300"
                      : analysisResults.riskLevel === "Medium"
                      ? "bg-yellow-600/30 text-yellow-300"
                      : "bg-green-600/30 text-green-300"
                  }`}
                >
                  {analysisResults.riskLevel}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-white/70">Confidence:</span>
                <span className="text-white">
                  {(analysisResults.confidence * 100).toFixed(0)}%
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Landslide Risk</span>
                  <span className="text-white">
                    {(analysisResults.landslideRisk * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analysisResults.landslideRisk * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Flood Risk</span>
                  <span className="text-white">
                    {(analysisResults.floodRisk * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${analysisResults.floodRisk * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {analysisResults.recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className="text-white/70 text-sm flex items-start gap-2"
                    >
                      <span className="text-blue-400 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-6 left-6 z-40 bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 p-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/30 rounded-lg">
            <Info size={16} className="text-blue-300" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">
              {selectedLocation ? "Location selected!" : "Click on the map"}
            </p>
            <p className="text-white/60 text-xs">
              {selectedLocation
                ? "Use the analysis button below"
                : "to select a location for analysis"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Floating Analysis Button */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <motion.button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl font-semibold text-lg shadow-2xl border border-blue-500/30 backdrop-blur-sm transition-all duration-300"
              whileHover={{ scale: isAnalyzing ? 1 : 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: isAnalyzing
                  ? "linear-gradient(45deg, #3b82f6, #1d4ed8)"
                  : "linear-gradient(45deg, #2563eb, #1e40af)",
                boxShadow: "0 20px 40px rgba(37, 99, 235, 0.3)",
              }}
            >
              <div className="flex items-center gap-3">
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <BarChart3 size={20} />
                    <span>Run Analysis</span>
                  </>
                )}
              </div>
            </motion.button>
            <div className="text-center mt-2">
              <p className="text-white/70 text-sm">
                Location: {selectedLocation.lat.toFixed(4)},{" "}
                {selectedLocation.lng.toFixed(4)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapInterface;
