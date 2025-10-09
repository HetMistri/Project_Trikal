import React from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

// Components
import Sidebar from "../components/UI/Sidebar";
import LocationCard from "../components/Cards/LocationCard";
import AnalysisCard from "../components/Cards/AnalysisCard";
import ActionButtons from "../components/Buttons/ActionButtons";
import MapControls from "../components/UI/MapControls";

// Hooks
import { useMapInteractions, useMapControls } from "../hooks/useMap";
import { useAnalysisState } from "../hooks/useAnalysis";
import { useSlideIn, useFadeIn } from "../hooks/useAnimations";

// Services
import { geocodingService } from "../services/geocoding";
import { analysisService } from "../services/analysis";

// Utils
import { coordinateUtils } from "../utils/coordinates";
import { formatUtils } from "../utils/formatting";

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom dark marker icon
const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="marker-container">
        <div class="marker-pin"></div>
        <div class="marker-pulse"></div>
      </div>
    `,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40],
  });
};

// Normalize coordinates to valid ranges
const normalizeCoordinates = (lat, lng) => {
  // Normalize latitude to -90 to 90
  const normalizedLat = Math.max(-90, Math.min(90, lat));

  // Normalize longitude to -180 to 180
  let normalizedLng = lng;
  while (normalizedLng > 180) normalizedLng -= 360;
  while (normalizedLng < -180) normalizedLng += 360;

  return { lat: normalizedLat, lng: normalizedLng };
};

const MapView = () => {
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Mobile detection
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse sidebar on mobile
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Map interactions
  const { marker, mapRef, handleMapClick, clearMarker, MapClickHandler } =
    useMapInteractions();
  const { zoomIn, zoomOut, resetView, getCurrentLocation } =
    useMapControls(mapRef);

  // Analysis state
  const {
    locationData,
    summaryData,
    isLoading,
    showLocationCard,
    showSummary,
    historyEntries,
    selectedEntry,
    startAnalysis,
    setAnalysisData,
    setSummaryAnalysis,
    addToHistory,
    selectHistoryEntry,
    clearAnalysis,
    cancelAnalysis,
    startFullAnalysis,
  } = useAnalysisState();

  // Handle map click
  const onMapClick = async (coordinates) => {
    // Normalize coordinates to ensure they're within valid ranges
    const normalizedCoords = normalizeCoordinates(
      coordinates.lat,
      coordinates.lng
    );

    handleMapClick(normalizedCoords);

    // Show location card immediately without loading state
    const preliminaryData = {
      coordinates: normalizedCoords,
      address: "Loading...",
      elevation: "...",
      terrain: "...",
      climate: "...",
      soilType: "...",
      vegetation: "...",
    };

    setAnalysisData(preliminaryData);
    startAnalysis(normalizedCoords);

    try {
      // Get address from coordinates
      const address = await geocodingService.getAddressFromCoordinates(
        normalizedCoords.lat,
        normalizedCoords.lng
      );

      // Get location data
      const locationInfo = await analysisService.getLocationData(
        normalizedCoords
      );
      locationInfo.address = address;

      setAnalysisData(locationInfo);
    } catch (error) {
      console.error("Failed to get location data:", error);
      cancelAnalysis();
    }
  };

  // Handle analysis submission
  const handleSubmit = async () => {
    if (!locationData) return;

    startFullAnalysis(); // Start loading state for full analysis

    try {
      const analysis = await analysisService.getGeologicalAnalysis(
        locationData.coordinates,
        locationData
      );

      setSummaryAnalysis(analysis);

      // Add to history
      const historyEntry = {
        id: analysis.id,
        address: analysis.address,
        coordinates: analysis.coordinates,
        timestamp: analysis.timestamp,
        preview: `${analysis.terrain} terrain at ${analysis.elevation}m elevation`,
        confidence: analysis.confidence,
      };

      addToHistory(historyEntry);
    } catch (error) {
      console.error("Analysis failed:", error);
    }
  };

  // Handle history entry click
  const handleHistoryClick = async (entry) => {
    selectHistoryEntry(entry);

    try {
      const analysisData = await analysisService.getHistoryEntry(entry.id);

      const mockSummary = {
        ...entry,
        analysis: analysisData.analysis,
      };

      setSummaryAnalysis(mockSummary);
      setAnalysisData({
        coordinates: entry.coordinates,
        address: entry.address,
        elevation: 1250,
        terrain: "Mountain",
        climate: "Temperate",
        soilType: "Clay",
        vegetation: "Dense Forest",
      });
    } catch (error) {
      console.error("Failed to load history entry:", error);
    }
  };

  // Handle clear
  const handleClear = () => {
    clearAnalysis();
    clearMarker();
  };

  // Handle download
  const handleDownload = () => {
    // Will implement export functionality
    console.log("Download analysis data");
  };

  // Handle share
  const handleShare = () => {
    // Will implement share functionality
    console.log("Share analysis");
  };

  return (
    <div className="w-full h-screen relative overflow-hidden">
      {/* Full Screen Map Background */}
      <div className="absolute inset-0">
        <MapContainer
          ref={mapRef}
          center={[28.238, 83.9956]} // Nepal coordinates
          zoom={8}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          attributionControl={false}
          minZoom={3}
          maxZoom={19}
          worldCopyJump={true}
          maxBounds={[
            [-90, -180],
            [90, 180],
          ]}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            minZoom={3}
            maxZoom={19}
          />

          <MapClickHandler onMapClick={onMapClick} />

          {marker && (
            <Marker
              position={[marker.lat, marker.lng]}
              icon={createCustomIcon()}
            />
          )}
        </MapContainer>
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Sidebar */}
        <div className="pointer-events-auto">
          <Sidebar
            entries={historyEntries}
            onEntryClick={handleHistoryClick}
            selectedEntry={selectedEntry}
            isCollapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Map Controls */}
        <div className="pointer-events-auto">
          <MapControls mapRef={mapRef} />
        </div>

        {/* Location Card */}
        {showLocationCard && locationData && !showSummary && (
          <div className="pointer-events-auto">
            <LocationCard
              locationData={locationData}
              onDownload={handleDownload}
              onShare={handleShare}
              className="z-[500]"
              sidebarCollapsed={sidebarCollapsed}
              isMobile={isMobile}
            />
          </div>
        )}

        {/* Analysis Card */}
        <div className="pointer-events-auto">
          <AnalysisCard
            summaryData={summaryData}
            locationData={locationData}
            isVisible={showSummary}
            className="z-[400]"
            sidebarCollapsed={sidebarCollapsed}
            isMobile={isMobile}
          />
        </div>

        {/* Action Buttons */}
        {showLocationCard && (
          <div className="pointer-events-auto">
            <ActionButtons
              showSummary={showSummary}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              onCancel={cancelAnalysis}
              onClear={handleClear}
              className="z-[600]"
              sidebarCollapsed={sidebarCollapsed}
              isMobile={isMobile}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
