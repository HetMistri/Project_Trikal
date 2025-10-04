/**
 * InfoPanel Component
 * Displays map information like zoom level and selection status
 * @module components/UI/InfoPanel
 */

import { memo } from 'react';
import PropTypes from 'prop-types';
import { MAP_CONFIG, ARIA_LABELS } from '../../constants';
import './InfoPanel.css';

/**
 * InfoPanel component
 * @param {Object} props - Component props
 */
const InfoPanel = memo(({ zoomLevel, hasSelection }) => {
  return (
    <div 
      className="info-panel"
      role="status"
      aria-label={ARIA_LABELS.INFO_PANEL}
      aria-live="polite"
    >
      <div className="info-item" aria-label={`Zoom level ${zoomLevel} of ${MAP_CONFIG.MAX_ZOOM}`}>
        🔍 Zoom: {zoomLevel}/{MAP_CONFIG.MAX_ZOOM}
      </div>
      {hasSelection && (
        <div className="info-item" aria-label="Location has been selected">
          📍 Location selected
        </div>
      )}
    </div>
  );
});

InfoPanel.displayName = 'InfoPanel';

InfoPanel.propTypes = {
  zoomLevel: PropTypes.number.isRequired,
  hasSelection: PropTypes.bool,
};

InfoPanel.defaultProps = {
  hasSelection: false,
};

export default InfoPanel;
