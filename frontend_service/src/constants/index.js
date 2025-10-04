/**
 * Application-wide constants
 * @module constants/app
 */

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: [20, 0],
  DEFAULT_ZOOM: 2,
  MIN_ZOOM: 2,
  MAX_ZOOM: 18,
  TILE_MAX_ZOOM: 19,
  TILE_MIN_ZOOM: 1,
  MAX_BOUNDS: [[-90, -180], [90, 180]],
  MAX_BOUNDS_VISCOSITY: 1.0,
  COORDINATE_PRECISION: 6, // decimal places for lat/lng display
};

// Tile Layer Configuration
export const TILE_LAYER = {
  URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

// UI Configuration
export const UI_CONFIG = {
  MESSAGE_AUTO_HIDE_DELAY: 5000, // ms
  WARNING_AUTO_HIDE_DELAY: 3000, // ms
  LOADING_SIMULATION_DELAY: 500, // ms (for console logging)
};

// Message Types
export const MESSAGE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Keyboard Keys
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  TAB: 'Tab',
};

// ARIA Labels
export const ARIA_LABELS = {
  MAP_CONTAINER: 'Interactive world map for location selection',
  CONFIRM_BUTTON: 'Confirm selected location and log coordinates',
  CLEAR_BUTTON: 'Clear current selection and reset map',
  COORDINATES_DISPLAY: 'Selected coordinates information',
  INFO_PANEL: 'Map information panel showing zoom level',
  HEADER_PANEL: 'Application header with instructions',
  MESSAGE_PANEL: 'Status message notification',
};

// API Configuration (for future backend integration)
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
  ENDPOINTS: {
    COORDINATES: '/api/coordinates',
  },
  TIMEOUT: 10000, // ms
};

// Feature Flags (for gradual rollouts)
export const FEATURE_FLAGS = {
  ENABLE_GEOLOCATION: true,
  ENABLE_BACKEND_API: false, // Currently logging to console
  ENABLE_ANALYTICS: false,
  ENABLE_OFFLINE_MODE: false,
};

// Error Messages
export const ERROR_MESSAGES = {
  NO_LOCATION_SELECTED: '⚠️ Please select a location on the map first!',
  NETWORK_ERROR: '❌ Network error. Please check your connection.',
  SERVER_ERROR: '❌ Server error. Please try again later.',
  INVALID_COORDINATES: '❌ Invalid coordinates selected.',
  UNKNOWN_ERROR: '❌ An unexpected error occurred.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  COORDINATES_LOGGED: (lat, lng) => 
    `✅ Coordinates logged to console!\nLat: ${lat.toFixed(MAP_CONFIG.COORDINATE_PRECISION)}, Lng: ${lng.toFixed(MAP_CONFIG.COORDINATE_PRECISION)}`,
  LOCATION_SELECTED: '✅ Location selected successfully!',
};

// Console Log Configuration
export const CONSOLE_CONFIG = {
  ENABLE_LOGS: import.meta.env.MODE !== 'production',
  LOG_STYLE: {
    HEADER: 'color: #4CAF50; font-weight: bold; font-size: 14px;',
    SEPARATOR: 'color: #999;',
    LABEL: 'color: #2196F3; font-weight: bold;',
    VALUE: 'color: #333;',
  },
};

export default {
  MAP_CONFIG,
  TILE_LAYER,
  UI_CONFIG,
  MESSAGE_TYPES,
  KEYBOARD_KEYS,
  ARIA_LABELS,
  API_CONFIG,
  FEATURE_FLAGS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  CONSOLE_CONFIG,
};
