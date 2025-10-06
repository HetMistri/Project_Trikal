import MapSelector from "../components/MapSelector";
import SatelliteInfo from "../components/SatelliteInfo";

/**
 * Map Scene Component
 * 2D map interface for location selection
 */
const MapScene = () => {
  return (
    <div className="map-scene">
      <MapSelector />
      <div style={{ position: "absolute", right: 20, top: 20, maxWidth: 420 }}>
        <SatelliteInfo />
      </div>
    </div>
  );
};

export default MapScene;
