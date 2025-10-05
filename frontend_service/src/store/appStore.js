import { create } from 'zustand';

/**
 * Application State Store
 * Manages the global state of the Himalayan Sentinel frontend
 */
const useAppStore = create((set, get) => ({
  // Scene Management
  currentScene: 'loading', // 'loading' | 'globe' | 'transition' | 'map'
  previousScene: null,
  isTransitioning: false,

  // Loading State
  loadingProgress: 0,
  assetsLoaded: false,

  // Selected Satellite
  selectedSatellite: null,
  hoveredSatellite: null,

  // Camera State
  cameraPosition: [0, 0, 50],
  cameraTarget: [0, 0, 0],

  // Map Data
  mapLocation: null,
  mapZoom: 2,

  // UI State
  showHUD: false,
  showSatelliteInfo: false,
  audioEnabled: true,
  audioVolume: 0.5,

  // Quality Settings
  qualityPreset: 'high', // 'low' | 'medium' | 'high'
  particleCount: 5000,

  // Actions
  setScene: (scene) => {
    const current = get().currentScene;
    set({ 
      previousScene: current,
      currentScene: scene,
      isTransitioning: true 
    });
    // Reset transitioning flag after a delay
    setTimeout(() => set({ isTransitioning: false }), 1000);
  },

  setLoadingProgress: (progress) => set({ loadingProgress: progress }),
  
  setAssetsLoaded: (loaded) => set({ assetsLoaded: loaded }),

  selectSatellite: (satellite) => set({ 
    selectedSatellite: satellite,
    showSatelliteInfo: true 
  }),

  hoverSatellite: (satellite) => set({ hoveredSatellite: satellite }),

  setCameraPosition: (position) => set({ cameraPosition: position }),

  setCameraTarget: (target) => set({ cameraTarget: target }),

  setMapLocation: (location) => set({ mapLocation: location }),

  setMapZoom: (zoom) => set({ mapZoom: zoom }),

  toggleHUD: () => set((state) => ({ showHUD: !state.showHUD })),

  toggleSatelliteInfo: () => set((state) => ({ 
    showSatelliteInfo: !state.showSatelliteInfo 
  })),

  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),

  setAudioVolume: (volume) => set({ audioVolume: volume }),

  setQualityPreset: (preset) => {
    const particleCounts = {
      low: 1000,
      medium: 3000,
      high: 5000
    };
    set({ 
      qualityPreset: preset,
      particleCount: particleCounts[preset]
    });
  },

  // Reset to initial state
  reset: () => set({
    currentScene: 'loading',
    previousScene: null,
    isTransitioning: false,
    loadingProgress: 0,
    selectedSatellite: null,
    hoveredSatellite: null,
    showSatelliteInfo: false,
  }),
}));

export default useAppStore;
