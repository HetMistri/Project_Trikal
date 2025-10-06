import { create } from "zustand";

// Global app store for scene and satellite selection
const useAppStore = create((set) => ({
  currentScene: "loading",
  setScene: (scene) => set({ currentScene: scene }),

  // Satellite selection
  selectedSatellite: null,
  selectSatellite: (sat) => set({ selectedSatellite: sat }),

  // Backend response (AOI + dates)
  backendResponse: null,
  setBackendResponse: (data) => set({ backendResponse: data }),
}));

export default useAppStore;
