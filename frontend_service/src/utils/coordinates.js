/**
 * Utility functions for coordinate manipulation and validation
 * @module utils/coordinates
 */

import { MAP_CONFIG } from '../constants';

/**
 * Validates if coordinates are within valid ranges
 * @param {number} lat - Latitude value
 * @param {number} lng - Longitude value
 * @returns {boolean} True if coordinates are valid
 */
export const isValidCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
};

/**
 * Formats coordinate value to specified precision
 * @param {number} value - Coordinate value
 * @param {number} precision - Number of decimal places
 * @returns {string} Formatted coordinate
 */
export const formatCoordinate = (value, precision = MAP_CONFIG.COORDINATE_PRECISION) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'Invalid';
  }
  return value.toFixed(precision);
};

/**
 * Creates a coordinate payload object
 * @param {Object} position - Position object with lat and lng
 * @returns {Object} Payload object
 */
export const createCoordinatePayload = (position) => {
  if (!position || !position.lat || !position.lng) {
    throw new Error('Invalid position object');
  }

  return {
    latitude: position.lat,
    longitude: position.lng,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Calculates distance between two coordinates (Haversine formula)
 * @param {Object} coord1 - First coordinate {lat, lng}
 * @param {Object} coord2 - Second coordinate {lat, lng}
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
    Math.cos(toRad(coord2.lat)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Converts degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
const toRad = (degrees) => degrees * (Math.PI / 180);

/**
 * Gets human-readable location description based on coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} Location description
 */
export const getLocationDescription = (lat, lng) => {
  const hemisphere = {
    ns: lat >= 0 ? 'Northern' : 'Southern',
    ew: lng >= 0 ? 'Eastern' : 'Western',
  };
  
  return `${hemisphere.ns} Hemisphere, ${hemisphere.ew} Hemisphere`;
};

export default {
  isValidCoordinates,
  formatCoordinate,
  createCoordinatePayload,
  calculateDistance,
  getLocationDescription,
};
