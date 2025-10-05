import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import axios from 'axios';
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
  
  // Backend URL - can be configured via .env
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  const handleConfirm = async () => {
    if (!position) {
      setMessage('⚠️ Please select a location on the map first!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('');

    // Create payload with coordinates
    const payload = {
      latitude: position.lat,
      longitude: position.lng,
    };

    // Log to console for debugging
    console.log('📍 Sending to Backend:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📌 Latitude:', payload.latitude);
    console.log('📌 Longitude:', payload.longitude);
    console.log('� URL:', `${BACKEND_URL}/api/aoi-format/`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // try {
    //   // Send to Django backend
    //   const response = await axios.post(
    //     `${BACKEND_URL}/api/aoi-format/`,
    //     payload
    //   );

  console.log('📍 Sending to Backend:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 Method: POST');
    console.log('🔗 URL:', `${BACKEND_URL}/api/aoi-format/`);
    console.log('📌 Latitude:', payload.latitude);
    console.log('📌 Longitude:', payload.longitude);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    console.log('📋 Headers: Content-Type: application/json');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      // Send to Django backend with explicit configuration
      const response = await axios({
        method: 'POST',  // Explicitly set POST method
        url: `${BACKEND_URL}/api/aoi-format/`,
        data: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('✅ Backend Response:', response.data);
      
      // Show success message with backend response
      const aoi = response.data.aoi || 'N/A';
      const startDate = response.data.input_date?.start || 'N/A';
      const endDate = response.data.input_date?.end || 'N/A';
      
      setMessage(
        `✅ Success! Data sent to backend.\n` +
        `AOI: ${aoi.substring(0, 50)}${aoi.length > 50 ? '...' : ''}\n` +
        `Date Range: ${startDate.substring(0, 10)} to ${endDate.substring(0, 10)}`
      );

      // Auto-hide success message after 7 seconds
      setTimeout(() => setMessage(''), 7000);
      
    } catch (error) {
      console.error('❌ Error sending to backend:', error);
      
      let errorMessage = '❌ Error sending to backend.\n';
      
      if (error.response) {
        // Server responded with error status (4xx, 5xx)
        errorMessage += `Status: ${error.response.status}\n`;
        errorMessage += `Message: ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage += 'No response from server.\n';
        errorMessage += 'Is Django running at http://localhost:8000?';
      } else {
        // Something else happened
        errorMessage += error.message;
      }
      
      setMessage(errorMessage);
      
      // Auto-hide error message after 10 seconds
      setTimeout(() => setMessage(''), 10000);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="map-selector-container">
      {/* Floating header */}
      <div className="header-panel">
        <h1>Select Location on Map</h1>
        <p className="instructions">
          Click anywhere on the map to select coordinates. Data will be sent to Django backend.
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
            {loading ? '⏳ Sending...' : '✓ Send to Backend'}
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
