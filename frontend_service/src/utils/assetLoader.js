export function preloadAllAssets(onProgress = () => {}) {
  // Minimal stub: immediately report 100% progress
  setTimeout(() => onProgress(100), 20)
}
