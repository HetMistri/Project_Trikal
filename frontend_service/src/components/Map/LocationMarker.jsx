/**
 * LocationMarker Component
 * Handles map interactions and displays selected location marker
 * @module components/Map/LocationMarker
 */

import { memo } from 'react';
import PropTypes from 'prop-types';
import { Marker, useMapEvents } from 'react-leaflet';

/**
 * LocationMarker component for handling map clicks and displaying marker
 * @param {Object} props - Component props
 * @param {Object|null} props.position - Selected position {lat, lng}
 * @param {Function} props.onLocationSelect - Callback when location is selected
 * @param {Function} props.onZoomChange - Callback when zoom changes
 */
const LocationMarker = memo(({ position, onLocationSelect, onZoomChange }) => {
  const map = useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
    zoomend() {
      onZoomChange(map.getZoom());
    },
  });

  if (!position) {
    return null;
  }

  return <Marker position={position} />;
});

LocationMarker.displayName = 'LocationMarker';

LocationMarker.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  onLocationSelect: PropTypes.func.isRequired,
  onZoomChange: PropTypes.func.isRequired,
};

LocationMarker.defaultProps = {
  position: null,
};

export default LocationMarker;
