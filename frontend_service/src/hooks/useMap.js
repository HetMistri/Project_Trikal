import { useState, useCallback, useRef } from "react";
import { useMapEvents } from "react-leaflet";

export const useMapInteractions = () => {
  const [marker, setMarker] = useState(null);
  const [clickPosition, setClickPosition] = useState(null);
  const mapRef = useRef(null);

  const handleMapClick = useCallback((coordinates) => {
    setMarker(coordinates);
    setClickPosition(coordinates);
  }, []);

  const clearMarker = useCallback(() => {
    setMarker(null);
    setClickPosition(null);
  }, []);

  const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        onMapClick({ lat, lng });
      },
    });
    return null;
  };

  return {
    marker,
    clickPosition,
    mapRef,
    handleMapClick,
    clearMarker,
    MapClickHandler,
  };
};

export const useMapControls = (mapRef) => {
  const zoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1);
    }
  }, [mapRef]);

  const zoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1);
    }
  }, [mapRef]);

  const resetView = useCallback(
    (center = [28.238, 83.9956], zoom = 8) => {
      if (mapRef.current) {
        mapRef.current.setView(center, zoom);
      }
    },
    [mapRef]
  );

  const goToLocation = useCallback(
    (lat, lng, zoom = 13) => {
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], zoom);
      }
    },
    [mapRef]
  );

  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            resolve({ lat: latitude, lng: longitude });
            if (mapRef.current) {
              mapRef.current.setView([latitude, longitude], 13);
            }
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error("Geolocation not supported"));
      }
    });
  }, [mapRef]);

  return {
    zoomIn,
    zoomOut,
    resetView,
    goToLocation,
    getCurrentLocation,
  };
};
