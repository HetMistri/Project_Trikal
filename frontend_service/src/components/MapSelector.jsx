import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue in react-leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Component to handle map click events and zoom tracking
function LocationMarker({ position, setPosition, setZoomLevel }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
    zoomend() {
      setZoomLevel(map.getZoom());
    },
  });

  return position === null ? null : <Marker position={position} />;
}

function MapSelector() {
  const [position, setPosition] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(2);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleConfirm = () => {
    if (!position) {
      setMessage('⚠️ Please select a location on the map first!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('');

    // Create payload with coordinates and timestamp
    const payload = {
      latitude: position.lat,
      longitude: position.lng,
      timestamp: new Date().toISOString(),
    };

    // Print to console (instead of API call until backend is ready)
    console.log('📍 Location Selected:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Latitude:', payload.latitude);
    console.log('📌 Longitude:', payload.longitude);
    console.log('🕐 Timestamp:', payload.timestamp);
    console.log('📦 Full Payload:', JSON.stringify(payload, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
      setMessage(`✅ Coordinates logged to console!\nLat: ${position.lat.toFixed(6)}, Lng: ${position.lng.toFixed(6)}`);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    }, 500);
  };

  return (
    <div className="map-selector-container">
      {/* Floating header */}
      <div className="header-panel">
        <h1>Select Location on Map</h1>
        <p className="instructions">
          Click anywhere on the map to select coordinates. Open browser console (F12) to view output.
        </p>
      </div>

      {/* Floating coordinates display */}
      {position && (
        <div className="coordinates-display">
          <strong>Selected Coordinates:</strong>
          <br />
          Latitude: {position.lat.toFixed(6)}
          <br />
          Longitude: {position.lng.toFixed(6)}
        </div>
      )}

      {/* Fullscreen map */}
      <div className="map-wrapper">
        <MapContainer
          key="map-container"
          center={[20, 0]}
          zoom={2}
          minZoom={2}
          maxZoom={18}
          scrollWheelZoom={true}
          zoomControl={true}
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            minZoom={1}
          />
          <LocationMarker 
            position={position} 
            setPosition={setPosition}
            setZoomLevel={setZoomLevel}
          />
        </MapContainer>
      </div>

      {/* Info panel showing zoom level */}
      <div className="info-panel">
        <div className="info-item">
          🔍 Zoom: {zoomLevel}/18
        </div>
        {position && (
          <div className="info-item">
            📍 Location selected
          </div>
        )}
      </div>

      {/* Floating action buttons */}
      {position && (
        <div className="action-buttons">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="confirm-button"
          >
            {loading ? '⏳ Logging...' : '✓ Confirm & Log'}
          </button>
          <button
            onClick={() => {
              setPosition(null);
              setMessage('');
            }}
            className="clear-button"
            disabled={loading}
          >
            ✕ Clear
          </button>
        </div>
      )}

      {/* Floating message */}
      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default MapSelector;
