/**
 * Application Constants
 * Contains satellite data, theme colors, and configuration values
 */

// ============= THEME COLORS =============
export const COLORS = {
  primary: '#0a0e27',      // Deep Space Black
  accent: '#00f3ff',       // Electric Blue
  highlight: '#b800ff',    // Neon Purple
  glow: '#00fff2',         // Cyan
  text: '#e8e8e8',         // Off-white
  warning: '#ff6b35',      // Orange
  success: '#4ade80',      // Green
  danger: '#ef4444',       // Red
};

// ============= SATELLITE DATA =============
export const SATELLITES = [
  {
    id: 'sentinel-1a',
    name: 'Sentinel-1A',
    type: 'SAR',
    altitude: 693, // km
    inclination: 98.18, // degrees
    orbitalPeriod: 98.6, // minutes
    speed: 7.5, // km/s
    color: COLORS.accent,
    description: 'C-band Synthetic Aperture Radar for Earth observation',
    launchDate: '2014-04-03',
    mission: 'Land and ocean monitoring, emergency response',
    position: { x: 0, y: 0, z: 0 }, // Will be calculated
  },
  {
    id: 'sentinel-1b',
    name: 'Sentinel-1B',
    type: 'SAR',
    altitude: 693,
    inclination: 98.18,
    orbitalPeriod: 98.6,
    speed: 7.5,
    color: COLORS.accent,
    description: 'C-band Synthetic Aperture Radar for Earth observation',
    launchDate: '2016-04-25',
    mission: 'Land and ocean monitoring, emergency response',
    position: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'sentinel-2a',
    name: 'Sentinel-2A',
    type: 'Optical',
    altitude: 786,
    inclination: 98.62,
    orbitalPeriod: 100.6,
    speed: 7.45,
    color: COLORS.highlight,
    description: 'High-resolution optical imaging satellite',
    launchDate: '2015-06-23',
    mission: 'Land monitoring, vegetation analysis',
    position: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'sentinel-2b',
    name: 'Sentinel-2B',
    type: 'Optical',
    altitude: 786,
    inclination: 98.62,
    orbitalPeriod: 100.6,
    speed: 7.45,
    color: COLORS.highlight,
    description: 'High-resolution optical imaging satellite',
    launchDate: '2017-03-07',
    mission: 'Land monitoring, vegetation analysis',
    position: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'sentinel-3a',
    name: 'Sentinel-3A',
    type: 'Multi-sensor',
    altitude: 814,
    inclination: 98.65,
    orbitalPeriod: 101.4,
    speed: 7.43,
    color: COLORS.glow,
    description: 'Ocean and land monitoring satellite',
    launchDate: '2016-02-16',
    mission: 'Ocean topography, sea/land temperature',
    position: { x: 0, y: 0, z: 0 },
  },
  {
    id: 'landsat-8',
    name: 'Landsat 8',
    type: 'Optical/Thermal',
    altitude: 705,
    inclination: 98.2,
    orbitalPeriod: 99,
    speed: 7.48,
    color: '#ff6b35',
    description: 'Land imaging satellite',
    launchDate: '2013-02-11',
    mission: 'Land use, agriculture, forestry monitoring',
    position: { x: 0, y: 0, z: 0 },
  },
];

// ============= SCENE SETTINGS =============
export const SCENE_SETTINGS = {
  earth: {
    radius: 16,
    segments: 64,
    rotationSpeed: 0.001,
    tilt: 23.5, // Earth's axial tilt
  },
  
  atmosphere: {
    innerRadius: 16,
    outerRadius: 16.3,
    glowIntensity: 0, // Disabled - set to 0 to remove blue glow
  },
  
  stars: {
    count: 5000,
    size: 0.05,
    spread: 200,
  },
  
  camera: {
    initialPosition: [0, 0, 50],
    fov: 45,
    near: 0.1,
    far: 1000,
  },
  
  lighting: {
    ambient: 0.3,
    directional: 0.8,
    directionalPosition: [10, 10, 10],
  },
};

// ============= ANIMATION SETTINGS =============
export const ANIMATION = {
  loadingDuration: 2000, // ms
  transitionDuration: 3000, // ms
  zoomDuration: 2000, // ms
  
  easing: {
    default: 'easeInOutCubic',
    smooth: 'easeInOutQuad',
    bounce: 'easeOutBounce',
    elastic: 'easeOutElastic',
  },
};

// ============= QUALITY PRESETS =============
export const QUALITY_PRESETS = {
  low: {
    particleCount: 1000,
    textureSize: 1024,
    shadowQuality: 'low',
    antialiasing: false,
  },
  medium: {
    particleCount: 3000,
    textureSize: 2048,
    shadowQuality: 'medium',
    antialiasing: true,
  },
  high: {
    particleCount: 5000,
    textureSize: 4096,
    shadowQuality: 'high',
    antialiasing: true,
  },
};

// ============= API ENDPOINTS =============
export const API = {
  backend: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
  endpoints: {
    predict: '/api/predict/',
    analyze: '/api/analyze/',
  },
};

// ============= ORBITAL CALCULATIONS =============
/**
 * Calculate orbital radius in scene units
 * @param {number} altitude - Satellite altitude in km
 * @returns {number} Orbital radius in scene units
 */
export const calculateOrbitRadius = (altitude) => {
  const earthRadius = 6371; // km
  const sceneEarthRadius = SCENE_SETTINGS.earth.radius;
  const scale = sceneEarthRadius / earthRadius;
  return (earthRadius + altitude) * scale;
};

/**
 * Calculate orbital speed in scene units per frame
 * @param {number} orbitalPeriod - Period in minutes
 * @returns {number} Angular velocity in radians per frame (60fps)
 */
export const calculateOrbitalSpeed = (orbitalPeriod) => {
  // Convert to angular velocity (rad/s) and scale for 60fps
  return (2 * Math.PI) / (orbitalPeriod * 60 * 60);
};

export default {
  COLORS,
  SATELLITES,
  SCENE_SETTINGS,
  ANIMATION,
  QUALITY_PRESETS,
  API,
  calculateOrbitRadius,
  calculateOrbitalSpeed,
};
