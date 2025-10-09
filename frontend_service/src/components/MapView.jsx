import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import anime from "animejs";
import Sidebar from "./Sidebar";
import LocationCard from "./LocationCard";
import ActionButtons from "./ActionButtons";
import MapControls from "./MapControls";
import { useSlideIn, useFadeIn } from "../hooks/useAnimations";

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

// Map click handler component
function MapClickHandler({ onMapClick }) {
  const map = useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick({ lat, lng });

      // Add a subtle ripple effect at click position
      const clickPoint = map.latLngToContainerPoint(e.latlng);
      createRippleEffect(clickPoint.x, clickPoint.y);
    },
  });

  return null;
}

// Ripple effect function
const createRippleEffect = (x, y) => {
  const ripple = document.createElement("div");
  ripple.className = "click-ripple";
  ripple.style.left = `${x - 25}px`;
  ripple.style.top = `${y - 25}px`;

  document.querySelector(".leaflet-container").appendChild(ripple);

  anime({
    targets: ripple,
    scale: [0, 3],
    opacity: [0.6, 0],
    duration: 800,
    easing: "easeOutQuart",
    complete: () => ripple.remove(),
  });
};

const MapView = () => {
  const [marker, setMarker] = useState(null);
  const [showLocationCard, setShowLocationCard] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [historyEntries, setHistoryEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);

  // Use custom animation hooks
  useSlideIn(showLocationCard, "up", 200);
  useFadeIn(showSummary, 400);

  const handleMapClick = async (coordinates) => {
    setMarker(coordinates);
    setShowLocationCard(true);
    setShowSummary(false);
    setIsLoading(true);

    // Animate card entrance with Apple-style easing
    setTimeout(() => {
      anime({
        targets: ".location-card",
        translateY: [100, 0],
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 700,
        easing: "cubicBezier(0.175, 0.885, 0.32, 1.275)",
      });
    }, 100);

    // Simulate API call delay
    setTimeout(async () => {
      // Fetch location data (mock for now)
      const mockLocationData = {
        coordinates,
        address: await getAddressFromCoordinates(coordinates),
        elevation: Math.floor(Math.random() * 3000) + 100,
        terrain: ["Mountain", "Valley", "Plain", "Hill"][
          Math.floor(Math.random() * 4)
        ],
        climate: ["Temperate", "Cold", "Arid", "Tropical"][
          Math.floor(Math.random() * 4)
        ],
        soilType: ["Clay", "Sand", "Loam", "Silt"][
          Math.floor(Math.random() * 4)
        ],
        vegetation: [
          "Dense Forest",
          "Sparse Vegetation",
          "Grassland",
          "Agricultural",
        ][Math.floor(Math.random() * 4)],
      };

      setLocationData(mockLocationData);
      setIsLoading(false);
    }, 1500);
  };

  const getAddressFromCoordinates = async (coords) => {
    // Mock reverse geocoding - in real app, use actual geocoding service
    const regions = [
      "Himalayas Region",
      "Everest Base Camp Area",
      "Annapurna Circuit",
      "Langtang Valley",
      "Mustang District",
      "Dolpo Region",
    ];

    const randomRegion = regions[Math.floor(Math.random() * regions.length)];
    return `${randomRegion}, Nepal`;
  };

  const handleSubmit = async () => {
    if (!locationData) return;

    setIsLoading(true);
    setShowSummary(true);

    // Apple-style card expansion animation
    anime({
      targets: ".location-card",
      height: "auto",
      duration: 1000,
      easing: "cubicBezier(0.25, 0.46, 0.45, 0.94)",
      begin: () => {
        // Add loading shimmer effect
        anime({
          targets: ".summary-loading",
          opacity: [0.3, 0.7, 0.3],
          duration: 1500,
          loop: true,
          easing: "easeInOutSine",
        });
      },
    });

    // Simulate AI analysis delay
    setTimeout(() => {
      // Generate comprehensive mock summary data
      const summary = {
        id: Date.now(),
        coordinates: locationData.coordinates,
        address: locationData.address,
        analysis: {
          geologicalFeatures: [
            "Metamorphic rock formations",
            "Quaternary sedimentary deposits",
            "Active tectonic zones",
            "Glacial valley features",
          ],
          riskAssessment: {
            landslide: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
            earthquake: ["Low", "Medium", "High"][
              Math.floor(Math.random() * 3)
            ],
            flooding: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
            erosion: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
          },
          recommendations: [
            "Conduct detailed geological survey before construction",
            "Implement proper drainage systems",
            "Monitor seismic activity regularly",
            "Consider soil stabilization measures",
            "Establish early warning systems",
          ],
          sustainability: {
            carbonFootprint: `${(Math.random() * 10).toFixed(1)} tons CO2/year`,
            biodiversityIndex: `${(Math.random() * 100).toFixed(0)}%`,
            waterQuality: ["Excellent", "Good", "Fair", "Poor"][
              Math.floor(Math.random() * 4)
            ],
          },
        },
        timestamp: new Date().toISOString(),
        terrain: locationData.terrain,
        elevation: locationData.elevation,
        confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
      };

      setSummaryData(summary);
      setIsLoading(false);

      // Add to history with animation
      const historyEntry = {
        id: summary.id,
        address: summary.address,
        coordinates: summary.coordinates,
        timestamp: summary.timestamp,
        preview: `${summary.terrain} terrain at ${summary.elevation}m elevation`,
        confidence: summary.confidence,
      };

      setHistoryEntries((prev) => [historyEntry, ...prev]);

      // Animate summary content
      anime({
        targets: ".summary-content > *",
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        delay: anime.stagger(100),
        easing: "easeOutQuart",
      });
    }, 2000);
  };

  const handleCancel = () => {
    anime({
      targets: ".location-card",
      translateY: [0, 100],
      opacity: [1, 0],
      scale: [1, 0.9],
      duration: 500,
      easing: "cubicBezier(0.55, 0.055, 0.675, 0.19)",
      complete: () => {
        setMarker(null);
        setShowLocationCard(false);
        setLocationData(null);
        setIsLoading(false);
      },
    });
  };

  const handleClear = () => {
    anime({
      targets: ".location-card",
      translateY: [0, 100],
      opacity: [1, 0],
      scale: [1, 0.9],
      duration: 500,
      easing: "cubicBezier(0.55, 0.055, 0.675, 0.19)",
      complete: () => {
        setMarker(null);
        setShowLocationCard(false);
        setShowSummary(false);
        setLocationData(null);
        setSummaryData(null);
        setSelectedEntry(null);
        setIsLoading(false);
      },
    });
  };

  const handleHistoryClick = (entry) => {
    setSelectedEntry(entry);
    setMarker(entry.coordinates);
    setShowLocationCard(true);
    setShowSummary(true);
    setIsLoading(false);

    // Mock loading the full summary data
    const mockSummary = {
      ...entry,
      analysis: {
        geologicalFeatures: [
          "Metamorphic rock formations",
          "Quaternary sedimentary deposits",
          "Active tectonic zones",
        ],
        riskAssessment: {
          landslide: "Low",
          earthquake: "Medium",
          flooding: "Low",
          erosion: "Low",
        },
        recommendations: [
          "Conduct detailed geological survey",
          "Monitor groundwater levels",
          "Implement erosion control measures",
        ],
        sustainability: {
          carbonFootprint: "5.2 tons CO2/year",
          biodiversityIndex: "78%",
          waterQuality: "Good",
        },
      },
    };

    setSummaryData(mockSummary);
    setLocationData({
      coordinates: entry.coordinates,
      address: entry.address,
      elevation: 1250,
      terrain: "Mountain",
      climate: "Temperate",
      soilType: "Clay",
      vegetation: "Dense Forest",
    });

    // Animate card entrance from history
    anime({
      targets: ".location-card",
      translateY: [100, 0],
      opacity: [0, 1],
      scale: [0.95, 1],
      duration: 600,
      easing: "easeOutQuart",
    });
  };

  return (
    <div className="w-full h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Sidebar */}
      <Sidebar
        entries={historyEntries}
        onEntryClick={handleHistoryClick}
        selectedEntry={selectedEntry}
      />

      {/* Main Map Container */}
      <div className="flex-1 relative overflow-hidden">
        <MapContainer
          ref={mapRef}
          center={[28.238, 83.9956]} // Nepal coordinates
          zoom={8}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          <MapClickHandler onMapClick={handleMapClick} />

          {marker && (
            <Marker
              position={[marker.lat, marker.lng]}
              icon={createCustomIcon()}
            />
          )}
        </MapContainer>

        {/* Map Controls */}
        <MapControls mapRef={mapRef} />

        {/* Location Card */}
        {showLocationCard && locationData && (
          <LocationCard
            locationData={locationData}
            summaryData={summaryData}
            showSummary={showSummary}
            isLoading={isLoading}
            onDownload={() => console.log("Download clicked")}
            onShare={() => console.log("Share clicked")}
          />
        )}

        {/* Action Buttons */}
        {showLocationCard && (
          <ActionButtons
            showSummary={showSummary}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onClear={handleClear}
          />
        )}
      </div>
    </div>
  );
};

export default MapView;
