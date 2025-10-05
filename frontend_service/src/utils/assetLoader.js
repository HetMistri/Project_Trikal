/**
 * Asset Preloader Utility
 * Handles loading of textures, models, and other assets with progress tracking
 */

/**
 * Load an image and return a promise
 * @param {string} src - Image source URL
 * @returns {Promise<HTMLImageElement>}
 */
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Load a JSON file
 * @param {string} url - JSON file URL
 * @returns {Promise<Object>}
 */
const loadJSON = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load JSON: ${url}`);
  }
  return response.json();
};

/**
 * Load multiple assets with progress tracking
 * @param {Array<{type: string, url: string}>} assets - Array of asset definitions
 * @param {Function} onProgress - Progress callback (receives percentage 0-100)
 * @returns {Promise<Object>} - Object with loaded assets
 */
export const loadAssets = async (assets, onProgress) => {
  const loadedAssets = {};
  const total = assets.length;
  let loaded = 0;

  const updateProgress = () => {
    loaded++;
    const progress = Math.round((loaded / total) * 100);
    if (onProgress) onProgress(progress);
  };

  const promises = assets.map(async (asset) => {
    try {
      let result;
      
      switch (asset.type) {
        case 'image':
        case 'texture':
          result = await loadImage(asset.url);
          break;
        case 'json':
        case 'model':
          result = await loadJSON(asset.url);
          break;
        default:
          // Generic fetch for other types
          const response = await fetch(asset.url);
          result = await response.blob();
      }

      loadedAssets[asset.name] = result;
      updateProgress();
      
      return result;
    } catch (error) {
      console.error(`Failed to load asset: ${asset.name}`, error);
      updateProgress(); // Still update progress even on error
      return null;
    }
  });

  await Promise.all(promises);
  return loadedAssets;
};

/**
 * Simulate asset loading (for development/testing)
 * @param {number} duration - Total duration in milliseconds
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<void>}
 */
export const simulateLoading = (duration = 3000, onProgress) => {
  return new Promise((resolve) => {
    const steps = 100;
    const interval = duration / steps;
    let progress = 0;

    const timer = setInterval(() => {
      progress += 1;
      
      if (onProgress) {
        onProgress(progress);
      }

      if (progress >= 100) {
        clearInterval(timer);
        resolve();
      }
    }, interval);
  });
};

/**
 * Preload specific assets for the globe scene
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>}
 */
export const preloadGlobeAssets = async (onProgress) => {
  // Define assets to load for globe scene
  const assets = [
    // Earth textures (you'll need to add these to assets/textures/)
    // { type: 'texture', name: 'earthDay', url: '/assets/textures/earth_day.jpg' },
    // { type: 'texture', name: 'earthNight', url: '/assets/textures/earth_night.jpg' },
    // { type: 'texture', name: 'earthClouds', url: '/assets/textures/earth_clouds.jpg' },
    // { type: 'texture', name: 'earthBump', url: '/assets/textures/earth_bump.jpg' },
    
    // For now, simulate loading
  ];

  // If no real assets, simulate loading
  if (assets.length === 0) {
    await simulateLoading(3000, onProgress);
    return {};
  }

  return loadAssets(assets, onProgress);
};

/**
 * Preload fonts
 * @returns {Promise<void>}
 */
export const preloadFonts = async () => {
  if ('fonts' in document) {
    try {
      await Promise.all([
        document.fonts.load('700 1rem "Fira Code"'),
        document.fonts.load('400 1rem "Inter"'),
      ]);
    } catch (error) {
      console.warn('Font preloading failed:', error);
    }
  }
};

/**
 * Complete preload sequence
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>}
 */
export const preloadAllAssets = async (onProgress) => {
  // Preload fonts first (quick)
  await preloadFonts();
  
  // Then preload scene assets with progress
  const assets = await preloadGlobeAssets(onProgress);
  
  return assets;
};

export default {
  loadAssets,
  simulateLoading,
  preloadGlobeAssets,
  preloadFonts,
  preloadAllAssets,
};
