// Coordinate utilities
export const coordinateUtils = {
  // Format coordinates for display
  formatCoordinates(lat, lng, precision = 6) {
    return {
      lat: parseFloat(lat.toFixed(precision)),
      lng: parseFloat(lng.toFixed(precision)),
      formatted: `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`,
    };
  },

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  },

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  },

  // Check if coordinates are valid
  isValidCoordinates(lat, lng) {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  },

  // Get coordinate bounds for a given center and radius
  getBounds(centerLat, centerLng, radiusKm) {
    const latRange = radiusKm / 111; // Approximate km per degree of latitude
    const lngRange = radiusKm / (111 * Math.cos(this.toRadians(centerLat)));

    return {
      north: centerLat + latRange,
      south: centerLat - latRange,
      east: centerLng + lngRange,
      west: centerLng - lngRange,
    };
  },
};
