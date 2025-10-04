/**
 * CoordinatesDisplay Component
 * Displays selected coordinates in a floating panel
 * @module components/UI/CoordinatesDisplay
 */

import { memo } from 'react';
import PropTypes from 'prop-types';
import { formatCoordinate } from '../../utils/coordinates';
import { ARIA_LABELS } from '../../constants';
import './CoordinatesDisplay.css';

/**
 * CoordinatesDisplay component
 * @param {Object} props - Component props
 */
const CoordinatesDisplay = memo(({ position }) => {
  if (!position) {
    return null;
  }

  const { lat, lng } = position;

  return (
    <div 
      className="coordinates-display"
      role="status"
      aria-label={ARIA_LABELS.COORDINATES_DISPLAY}
      aria-live="polite"
    >
      <strong>Selected Coordinates:</strong>
      <br />
      <span aria-label={`Latitude ${lat}`}>
        Latitude: {formatCoordinate(lat)}
      </span>
      <br />
      <span aria-label={`Longitude ${lng}`}>
        Longitude: {formatCoordinate(lng)}
      </span>
    </div>
  );
});

CoordinatesDisplay.displayName = 'CoordinatesDisplay';

CoordinatesDisplay.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
};

CoordinatesDisplay.defaultProps = {
  position: null,
};

export default CoordinatesDisplay;
