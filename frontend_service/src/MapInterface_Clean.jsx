import React, { useState, useCallback, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL(
    "../node_modules/leaflet/dist/images/marker-icon-2x.png",
    import.meta.url
  ).href,
  iconUrl: new URL(
    "../node_modules/leaflet/dist/images/marker-icon.png",
    import.meta.url
  ).href,
  shadowUrl: new URL(
    "../node_modules/leaflet/dist/images/marker-shadow.png",
    import.meta.url
  ).href,
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

// Map viewport controller component
function MapViewController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (map && center && zoom) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);

  return null;
}

const MapInterface = () => {
  // Basic state management - only what's needed for the map
  const [mapCenter, setMapCenter] = useState([27.9881, 86.925]);
  const [mapZoom, setMapZoom] = useState(10);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Event handlers
  const handleMapClick = useCallback((latlng) => {
    setSelectedLocation(latlng);
    console.log("Location selected:", latlng);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-900 overflow-hidden">
      {/* Main Map Container */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100vh", width: "100vw" }}
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <MapViewController center={mapCenter} zoom={mapZoom} />
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
    </div>
  );
};

export default MapInterface;
