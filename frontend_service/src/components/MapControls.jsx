import React from "react";
import {
  Plus,
  Minus,
  RotateCcw,
  Maximize,
  Layers,
  Navigation,
  Satellite,
  Map,
} from "lucide-react";

const MapControls = ({ mapRef }) => {
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1);
    }
  };

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.setView([28.238, 83.9956], 8);
    }
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const handleMyLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
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
      {/* Right Side Controls */}
      <div className="absolute top-6 right-6 flex flex-col space-y-3 z-1000">
        {/* Zoom Controls */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl transition-all duration-300 cursor-pointer hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-xl group"
            title="Zoom In"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={handleZoomOut}
            className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl transition-all duration-300 cursor-pointer hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-xl group"
            title="Zoom Out"
          >
            <Minus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Navigation Controls */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleMyLocation}
            className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl transition-all duration-300 cursor-pointer hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-xl group"
            title="My Location"
          >
            <Navigation className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={handleResetView}
            className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl transition-all duration-300 cursor-pointer hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-xl group"
            title="Reset View"
          >
            <RotateCcw className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* View Controls */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleFullscreen}
            className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl transition-all duration-300 cursor-pointer hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-xl group"
            title="Fullscreen"
          >
            <Maximize className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => console.log("Layers clicked")}
            className="w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl transition-all duration-300 cursor-pointer hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-xl group"
            title="Layers"
          >
            <Layers className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Map Type Toggle */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-1000">
        <div className="bg-black/20 backdrop-blur-xl border border-white/20 shadow-2xl rounded-xl p-2 flex space-x-2">
          <button
            className="w-auto px-4 py-2 text-sm bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl transition-all duration-300 cursor-pointer hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-xl flex items-center"
            title="Standard Map"
          >
            <Map className="w-4 h-4 mr-2" />
            Standard
          </button>

          <button
            className="w-auto px-4 py-2 text-sm bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl transition-all duration-300 cursor-pointer hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-xl flex items-center opacity-60"
            title="Satellite View"
          >
            <Satellite className="w-4 h-4 mr-2" />
            Satellite
          </button>
        </div>
      </div>

      {/* Scale and Attribution */}
      <div className="absolute bottom-6 right-6 z-1000">
        <div className="bg-black/20 backdrop-blur-xl border border-white/20 shadow-2xl rounded-lg px-3 py-2">
          <p className="text-white text-xs opacity-75">Scale: 1:50,000</p>
        </div>
      </div>
    </>
  );
};

export default MapControls;
