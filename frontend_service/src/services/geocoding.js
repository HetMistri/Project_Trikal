// Mock geocoding service - replace with actual API
export const geocodingService = {
  // Reverse geocoding: coordinates to address
  async getAddressFromCoordinates(lat, lng) {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock data based on Nepal regions
      const regions = [
        "Himalayas Region, Nepal",
        "Everest Base Camp Area, Nepal",
        "Annapurna Circuit, Nepal",
        "Langtang Valley, Nepal",
        "Mustang District, Nepal",
        "Dolpo Region, Nepal",
        "Khumbu Valley, Nepal",
        "Sagarmatha National Park, Nepal",
      ];

      return regions[Math.floor(Math.random() * regions.length)];
    } catch (error) {
      console.error("Geocoding error:", error);
      return "Unknown Location";
    }
  },

  // Forward geocoding: address to coordinates
  async getCoordinatesFromAddress(address) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock coordinates for Nepal region
      const mockCoords = {
        lat: 28.238 + (Math.random() - 0.5) * 2,
        lng: 83.9956 + (Math.random() - 0.5) * 2,
      };

      return mockCoords;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  },

  // Get nearby places
  async getNearbyPlaces(lat, lng, radius = 5000) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const places = [
        { name: "Mountain Peak", type: "peak", distance: Math.random() * 2000 },
        {
          name: "River Valley",
          type: "valley",
          distance: Math.random() * 3000,
        },
        { name: "Forest Area", type: "forest", distance: Math.random() * 1500 },
        {
          name: "Village Settlement",
          type: "village",
          distance: Math.random() * 4000,
        },
      ];

      return places;
    } catch (error) {
      console.error("Places error:", error);
      return [];
    }
  },
};
