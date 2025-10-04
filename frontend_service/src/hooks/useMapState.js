/**
 * Custom hook for managing map state and interactions
 * @module hooks/useMapState
 */

import { useState, useCallback, useRef } from 'react';
import { MAP_CONFIG } from '../constants';

/**
 * Hook for managing map-related state
 * @returns {Object} Map state and handlers
 */
export const useMapState = () => {
  const [position, setPosition] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(MAP_CONFIG.DEFAULT_ZOOM);
  const mapRef = useRef(null);

  /**
   * Handles map click event
   * @param {Object} latlng - Leaflet LatLng object
   */
  const handleMapClick = useCallback((latlng) => {
    setPosition(latlng);
  }, []);

  /**
   * Handles zoom change event
   * @param {number} zoom - New zoom level
   */
  const handleZoomChange = useCallback((zoom) => {
    setZoomLevel(zoom);
  }, []);

  /**
   * Clears the current position
   */
  const clearPosition = useCallback(() => {
    setPosition(null);
  }, []);

  /**
   * Gets the map instance
   * @returns {Object|null} Leaflet map instance
   */
  const getMapInstance = useCallback(() => {
    return mapRef.current;
  }, []);

  return {
    position,
    zoomLevel,
    mapRef,
    handleMapClick,
    handleZoomChange,
    clearPosition,
    getMapInstance,
  };
};

export default useMapState;
