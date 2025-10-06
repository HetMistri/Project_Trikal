// API utility for communicating with the backend services
class APIService {
  constructor() {
    this.baseURL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
  }

  async analyzeLocation(longitude, latitude) {
    try {
      const response = await fetch(`${this.baseURL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: {
            longitude,
            latitude,
          },
          analysis_type: "landslide_risk",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      // Return mock data for development
      return this.getMockAnalysis(longitude, latitude);
    }
  }

  async downloadReport(longitude, latitude, format = "pdf") {
    try {
      const response = await fetch(`${this.baseURL}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: {
            longitude,
            latitude,
          },
          format,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `geohazard_report_${latitude.toFixed(4)}_${longitude.toFixed(
        4
      )}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error("Download Error:", error);
      return { success: false, error: error.message };
    }
  }

  async downloadData(longitude, latitude, format = "json") {
    try {
      const response = await fetch(`${this.baseURL}/data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: {
            longitude,
            latitude,
          },
          format,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `geohazard_data_${latitude.toFixed(4)}_${longitude.toFixed(
        4
      )}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error("Download Error:", error);
      return { success: false, error: error.message };
    }
  }

  async getHeatmapData(longitude, latitude, radius = 5000) {
    try {
      const response = await fetch(`${this.baseURL}/heatmap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          center: {
            longitude,
            latitude,
          },
          radius,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Heatmap Error:", error);
      return this.getMockHeatmapData(longitude, latitude);
    }
  }

  // Mock data for development and fallback
  getMockAnalysis(longitude, latitude) {
    const riskLevels = ["low", "medium", "high"];
    const randomRisk =
      riskLevels[Math.floor(Math.random() * riskLevels.length)];

    const factorsByRisk = {
      low: [
        "Gentle slope angle (< 10°)",
        "Stable soil composition",
        "Good vegetation coverage (80%+)",
        "Low recent precipitation",
        "No historical landslide activity",
      ],
      medium: [
        "Moderate slope angle (15-25°)",
        "Recent precipitation detected",
        "Vegetation coverage: 60%",
        "Soil moisture: Moderate to High",
        "Some erosion patterns visible",
      ],
      high: [
        "Steep slope angle (> 30°)",
        "Heavy precipitation in last 48h",
        "Sparse vegetation (< 40%)",
        "Saturated soil conditions",
        "Previous landslide scars detected",
      ],
    };

    const recommendationsByRisk = {
      low: "Area appears stable. Continue routine monitoring. No immediate action required.",
      medium:
        "Monitor area for potential landslide activity. Consider installing early warning systems. Restrict heavy construction activities.",
      high: "HIGH RISK AREA: Immediate evacuation may be necessary. Deploy emergency monitoring systems. Contact local authorities.",
    };

    return {
      riskLevel: randomRisk,
      riskScore:
        randomRisk === "low"
          ? 0.2 + Math.random() * 0.3
          : randomRisk === "medium"
          ? 0.4 + Math.random() * 0.3
          : 0.7 + Math.random() * 0.3,
      confidence: 0.8 + Math.random() * 0.2,
      factors: factorsByRisk[randomRisk],
      recommendation: recommendationsByRisk[randomRisk],
      lastUpdated: new Date().toISOString(),
      location: {
        latitude,
        longitude,
        elevation: 1200 + Math.random() * 2000,
        slope:
          randomRisk === "low"
            ? 5 + Math.random() * 10
            : randomRisk === "medium"
            ? 15 + Math.random() * 15
            : 25 + Math.random() * 20,
      },
      weather: {
        temperature: 15 + Math.random() * 10,
        humidity: 60 + Math.random() * 30,
        precipitation_24h:
          randomRisk === "high" ? 50 + Math.random() * 100 : Math.random() * 20,
        wind_speed: Math.random() * 15,
      },
    };
  }

  getMockHeatmapData(longitude, latitude) {
    // Generate mock heatmap data points around the center
    const points = [];
    const gridSize = 20;
    const step = 0.01; // Roughly 1km

    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        const pointLng = longitude + i * step;
        const pointLat = latitude + j * step;
        const distance = Math.sqrt(i * i + j * j);

        // Create risk gradient that decreases with distance
        const baseRisk = Math.max(0, 1 - distance / gridSize);
        const noise = (Math.random() - 0.5) * 0.3;
        const risk = Math.max(0, Math.min(1, baseRisk + noise));

        points.push({
          longitude: pointLng,
          latitude: pointLat,
          risk: risk,
          weight: risk,
        });
      }
    }

    return {
      type: "heatmap",
      points,
      center: { longitude, latitude },
      metadata: {
        generated_at: new Date().toISOString(),
        point_count: points.length,
        analysis_radius: gridSize * step * 111000, // Convert to meters
      },
    };
  }
}

// Create and export a singleton instance
const apiService = new APIService();
export default apiService;
