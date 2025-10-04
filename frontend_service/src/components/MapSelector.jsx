/**
 * MapSelector Component
 * Main container component for the interactive map application
 * Orchestrates map interactions, coordinate selection, and submission
 * @module components/MapSelector
 */

import { useCallback } from 'react';
import PropTypes from 'prop-types';
import 'leaflet/dist/leaflet.css';

// Hooks
import { useMapState } from '../hooks/useMapState';
import { useNotification } from '../hooks/useNotification';
import { useCoordinateSubmission } from '../hooks/useCoordinateSubmission';

// Components
import { InteractiveMap } from './Map';
import {
  Header,
  CoordinatesDisplay,
  InfoPanel,
  ActionButtons,
  Notification,
} from './UI';

// Constants and utilities
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';

/**
 * MapSelector component - Professional refactored version
 * @param {Object} props - Component props
 */
const MapSelector = ({ onCoordinateSelect }) => {
  // Custom hooks for state management
  const {
    position,
    zoomLevel,
    handleMapClick,
    handleZoomChange,
    clearPosition,
  } = useMapState();

  const {
    message,
    messageType,
    showSuccess,
    showWarning,
    hideNotification,
  } = useNotification();

  // Handle coordinate submission with callbacks
  const handleSuccess = useCallback((payload, pos) => {
    const successMsg = SUCCESS_MESSAGES.COORDINATES_LOGGED(pos.lat, pos.lng);
    showSuccess(successMsg);
    onCoordinateSelect?.(payload);
  }, [showSuccess, onCoordinateSelect]);

  const handleError = useCallback((error) => {
    showWarning(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
  }, [showWarning]);

  const { isSubmitting, submitCoordinates } = useCoordinateSubmission({
    onSuccess: handleSuccess,
    onError: handleError,
  });

  // Handle confirm button click
  const handleConfirm = useCallback(() => {
    if (!position) {
      showWarning(ERROR_MESSAGES.NO_LOCATION_SELECTED);
      return;
    }
    submitCoordinates(position);
  }, [position, submitCoordinates, showWarning]);

  // Handle clear button click
  const handleClear = useCallback(() => {
    clearPosition();
    hideNotification();
  }, [clearPosition, hideNotification]);

  return (
    <div className="map-selector-container">
      {/* Header with title and instructions */}
      <Header />

      {/* Coordinates display panel */}
      <CoordinatesDisplay position={position} />

      {/* Interactive map */}
      <InteractiveMap
        position={position}
        onLocationSelect={handleMapClick}
        onZoomChange={handleZoomChange}
      />

      {/* Info panel with zoom level */}
      <InfoPanel zoomLevel={zoomLevel} hasSelection={!!position} />

      {/* Action buttons (only shown when location is selected) */}
      {position && (
        <ActionButtons
          onConfirm={handleConfirm}
          onClear={handleClear}
          isLoading={isSubmitting}
          isDisabled={!position}
        />
      )}

      {/* Notification messages */}
      <Notification
        message={message}
        type={messageType}
        onClose={hideNotification}
      />
    </div>
  );
};

MapSelector.displayName = 'MapSelector';

MapSelector.propTypes = {
  onCoordinateSelect: PropTypes.func,
};

MapSelector.defaultProps = {
  onCoordinateSelect: null,
};

export default MapSelector;

