// Mock geological analysis service
export const analysisService = {
  // Get basic location data
  async getLocationData(coordinates) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      return {
        coordinates,
        elevation: Math.floor(Math.random() * 3000) + 100,
        terrain: ["Mountain", "Valley", "Plain", "Hill"][
          Math.floor(Math.random() * 4)
        ],
        climate: ["Temperate", "Cold", "Arid", "Tropical"][
          Math.floor(Math.random() * 4)
        ],
        soilType: ["Clay", "Sand", "Loam", "Silt"][
          Math.floor(Math.random() * 4)
        ],
        vegetation: [
          "Dense Forest",
          "Sparse Vegetation",
          "Grassland",
          "Agricultural",
        ][Math.floor(Math.random() * 4)],
      };
    } catch (error) {
      console.error("Location data error:", error);
      throw error;
    }
  },

  // Comprehensive geological analysis
  async getGeologicalAnalysis(coordinates, locationData) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const analysisId = Math.random().toString(36).substr(2, 9);

      return {
        id: analysisId,
        coordinates,
        address: locationData.address,
        analysis: {
          geological: {
            composition: [
              "Limestone deposits (45%)",
              "Sandstone formation (30%)",
              "Shale layers (15%)",
              "Granite intrusions (10%)",
            ],
            rockFormation: [
              "Sedimentary rock layers",
              "Metamorphic formations",
              "Quaternary sedimentary deposits",
              "Active tectonic zones",
            ],
          },
          environmental: {
            soilPH: (Math.random() * 4 + 5).toFixed(1),
            moisture: `${Math.floor(Math.random() * 40 + 30)}%`,
            drainage: ["Good", "Moderate", "Poor"][
              Math.floor(Math.random() * 3)
            ],
            erosion: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
          },
          riskAssessment: {
            landslide: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
            earthquake: ["Low", "Medium", "High"][
              Math.floor(Math.random() * 3)
            ],
            flooding: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
            erosion: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
          },
          recommendations: [
            "Conduct detailed geological survey before construction",
            "Implement proper drainage systems",
            "Monitor seismic activity regularly",
            "Consider soil stabilization measures",
            "Establish early warning systems",
          ],
          sustainability: {
            carbonFootprint: `${(Math.random() * 10).toFixed(1)} tons CO2/year`,
            biodiversityIndex: `${(Math.random() * 100).toFixed(0)}%`,
            waterQuality: ["Excellent", "Good", "Fair", "Poor"][
              Math.floor(Math.random() * 4)
            ],
          },
        },
        timestamp: new Date().toISOString(),
        terrain: locationData.terrain,
        elevation: locationData.elevation,
        confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
      };
    } catch (error) {
      console.error("Analysis error:", error);
      throw error;
    }
  },

  // Historical analysis retrieval
  async getHistoryEntry(entryId) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock historical data
      return {
        id: entryId,
        analysis: {
          geological: {
            composition: [
              "Quartzite deposits (40%)",
              "Granite formation (35%)",
              "Schist layers (20%)",
              "Mineral veins (5%)",
            ],
            rockFormation: [
              "Precambrian rock formations",
              "Metamorphic complexes",
              "Quaternary sedimentary deposits",
              "Active tectonic zones",
            ],
          },
          environmental: {
            soilPH: "6.8",
            moisture: "42%",
            drainage: "Good",
            erosion: "Low",
          },
          riskAssessment: {
            landslide: "Low",
            earthquake: "Medium",
            flooding: "Low",
            erosion: "Low",
          },
          recommendations: [
            "Conduct detailed geological survey",
            "Monitor groundwater levels",
            "Implement erosion control measures",
          ],
          sustainability: {
            carbonFootprint: "5.2 tons CO2/year",
            biodiversityIndex: "78%",
            waterQuality: "Good",
          },
        },
      };
    } catch (error) {
      console.error("History retrieval error:", error);
      throw error;
    }
  },
};
