/**
 * InteractiveMap Component
 * Main map container with tile layer and location marker
 * @module components/Map/InteractiveMap
 */

import { memo } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer } from 'react-leaflet';
import LocationMarker from './LocationMarker';
import { MAP_CONFIG, TILE_LAYER, ARIA_LABELS } from '../../constants';
import { setupLeafletIcons } from './leafletConfig';

// Configure Leaflet icons on module load
setupLeafletIcons();

/**
 * InteractiveMap component
 * @param {Object} props - Component props
 */
const InteractiveMap = memo(({
  position,
  onLocationSelect,
  onZoomChange,
  center,
  zoom,
  minZoom,
  maxZoom,
  scrollWheelZoom,
  zoomControl,
  maxBounds,
  maxBoundsViscosity,
}) => {
  return (
    <div className="map-wrapper" role="application" aria-label={ARIA_LABELS.MAP_CONTAINER}>
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        scrollWheelZoom={scrollWheelZoom}
        zoomControl={zoomControl}
        maxBounds={maxBounds}
        maxBoundsViscosity={maxBoundsViscosity}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution={TILE_LAYER.ATTRIBUTION}
          url={TILE_LAYER.URL}
          maxZoom={MAP_CONFIG.TILE_MAX_ZOOM}
          minZoom={MAP_CONFIG.TILE_MIN_ZOOM}
        />
        <LocationMarker
          position={position}
          onLocationSelect={onLocationSelect}
          onZoomChange={onZoomChange}
        />
      </MapContainer>
    </div>
  );
});

InteractiveMap.displayName = 'InteractiveMap';

InteractiveMap.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  onLocationSelect: PropTypes.func.isRequired,
  onZoomChange: PropTypes.func.isRequired,
  center: PropTypes.arrayOf(PropTypes.number),
  zoom: PropTypes.number,
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number,
  scrollWheelZoom: PropTypes.bool,
  zoomControl: PropTypes.bool,
  maxBounds: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  maxBoundsViscosity: PropTypes.number,
};

InteractiveMap.defaultProps = {
  position: null,
  center: MAP_CONFIG.DEFAULT_CENTER,
  zoom: MAP_CONFIG.DEFAULT_ZOOM,
  minZoom: MAP_CONFIG.MIN_ZOOM,
  maxZoom: MAP_CONFIG.MAX_ZOOM,
  scrollWheelZoom: true,
  zoomControl: true,
  maxBounds: MAP_CONFIG.MAX_BOUNDS,
  maxBoundsViscosity: MAP_CONFIG.MAX_BOUNDS_VISCOSITY,
};

export default InteractiveMap;
