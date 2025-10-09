import React from "react";
import IconButton from "../Buttons/IconButton";

const MapControls = ({ mapRef, className = "" }) => {
  const handleZoomIn = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      if (currentZoom < 19) {
        mapRef.current.setZoom(currentZoom + 1);
      }
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      if (currentZoom > 3) {
        mapRef.current.setZoom(currentZoom - 1);
      }
    }
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.setView([28.238, 83.9956], 8);
    }
  };

  const handleMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 13);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  return (
    <>
      {/* Top Controls - Location and Reset */}
      <div
        className={`absolute top-4 right-4 flex flex-col gap-1 z-[1000] ${className}`}
      >
        <div className="flex flex-col bg-white/10 backdrop-blur-3xl border border-white/20 rounded-lg overflow-hidden shadow-2xl">
          <IconButton
            icon={
              <svg
                className="w-4 h-4"
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
            }
            onClick={handleMyLocation}
            tooltip="My Location"
            size="sm"
            className="rounded-none border-none"
          />
          <div className="h-px bg-white/10" />
          <IconButton
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            }
            onClick={handleResetView}
            tooltip="Reset View"
            size="sm"
            className="rounded-none border-none"
          />
        </div>
      </div>

      {/* Bottom Controls - Zoom Only */}
      <div
        className={`absolute bottom-4 right-4 flex flex-col gap-1 z-[1000] ${className}`}
      >
        <div className="flex flex-col bg-white/10 backdrop-blur-3xl border border-white/20 rounded-lg overflow-hidden shadow-2xl">
          <IconButton
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            }
            onClick={handleZoomIn}
            tooltip="Zoom In"
            size="sm"
            className="rounded-none border-none"
          />
          <div className="h-px bg-white/10" />
          <IconButton
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            }
            onClick={handleZoomOut}
            tooltip="Zoom Out"
            size="sm"
            className="rounded-none border-none"
          />
        </div>
      </div>
    </>
  );
};

export default MapControls;
