import * as satellite from 'satellite.js';

/**
 * Satellite Data Management
 * Fetches real TLE data and calculates orbital positions
 */

// Cache for satellite data
let satelliteCache = [];
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

/**
 * Fetch TLE data from public APIs
 * Sources: CelesTrak, N2YO, or Space-Track
 */
export const fetchSatelliteTLEData = async (limit = 100) => {
  // Check cache first
  if (satelliteCache.length > 0 && Date.now() - lastFetchTime < CACHE_DURATION) {
    return satelliteCache.slice(0, limit);
  }

  try {
    // Using CelesTrak's public API for Starlink satellites (or active satellites)
    // You can change this to other groups like:
    // - 'stations.txt' for ISS and space stations
    // - 'active.txt' for all active satellites
    // - 'weather.txt' for weather satellites
    const response = await fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle');
    const data = await response.text();
    
    // Parse TLE data
    const satellites = parseTLEData(data, limit);
    
    satelliteCache = satellites;
    lastFetchTime = Date.now();
    
    return satellites;
  } catch (error) {
    console.error('Failed to fetch satellite TLE data:', error);
    // Return mock data if fetch fails
    return getMockSatelliteData(limit);
  }
};

/**
 * Parse TLE (Two-Line Element) data format
 */
const parseTLEData = (tleText, limit) => {
  const lines = tleText.trim().split('\n');
  const satellites = [];
  
  // TLE format: 3 lines per satellite (name, line1, line2)
  for (let i = 0; i < lines.length - 2 && satellites.length < limit; i += 3) {
    const name = lines[i].trim();
    const tleLine1 = lines[i + 1].trim();
    const tleLine2 = lines[i + 2].trim();
    
    if (tleLine1.startsWith('1 ') && tleLine2.startsWith('2 ')) {
      satellites.push({
        id: `sat-${i / 3}`,
        name,
        tleLine1,
        tleLine2,
        color: '#00f3ff', // Electric blue
      });
    }
  }
  
  return satellites;
};

/**
 * Calculate satellite position at given time using TLE data
 */
export const calculateSatellitePosition = (tleLine1, tleLine2, date = new Date()) => {
  try {
    // Initialize satellite record
    const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
    
    // Propagate satellite position
    const positionAndVelocity = satellite.propagate(satrec, date);
    
    if (positionAndVelocity.position && typeof positionAndVelocity.position !== 'boolean') {
      const positionEci = positionAndVelocity.position;
      
      // Convert from km to scene units (scale down by 100)
      return {
        x: positionEci.x / 100,
        y: positionEci.y / 100,
        z: positionEci.z / 100,
      };
    }
  } catch (error) {
    console.warn('Error calculating satellite position:', error);
  }
  
  return null;
};

/**
 * Mock satellite data for fallback
 */
const getMockSatelliteData = (limit = 100) => {
  const mockSatellites = [];
  
  for (let i = 0; i < limit; i++) {
    // Generate random orbital parameters
    const altitude = 400 + Math.random() * 600; // 400-1000 km
    const inclination = Math.random() * 180; // 0-180 degrees
    
    mockSatellites.push({
      id: `mock-sat-${i}`,
      name: `Satellite ${i + 1}`,
      altitude,
      inclination,
      speed: 7.5 - (altitude / 1000), // Approximate
      color: '#00f3ff',
      isMock: true,
    });
  }
  
  return mockSatellites;
};

/**
 * Get specific satellite groups
 */
export const SATELLITE_GROUPS = {
  STARLINK: 'starlink',
  ISS: 'stations',
  WEATHER: 'weather',
  GPS: 'gps-ops',
  ACTIVE: 'active',
  VISUAL: 'visual', // Brightest satellites
};

export const fetchSatelliteGroup = async (group = SATELLITE_GROUPS.ACTIVE, limit = 100) => {
  try {
    const response = await fetch(`https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=tle`);
    const data = await response.text();
    return parseTLEData(data, limit);
  } catch (error) {
    console.error(`Failed to fetch ${group} satellites:`, error);
    return getMockSatelliteData(limit);
  }
};

export default {
  fetchSatelliteTLEData,
  calculateSatellitePosition,
  fetchSatelliteGroup,
  SATELLITE_GROUPS,
};
