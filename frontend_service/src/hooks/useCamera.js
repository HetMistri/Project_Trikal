import { useCallback } from 'react';
import useAppStore from '../store/appStore';

/**
 * Custom hook for camera management
 * To be fully implemented in Phase 5
 */
const useCamera = () => {
  const cameraPosition = useAppStore((state) => state.cameraPosition);
  const cameraTarget = useAppStore((state) => state.cameraTarget);
  const setCameraPosition = useAppStore((state) => state.setCameraPosition);
  const setCameraTarget = useAppStore((state) => state.setCameraTarget);

  const moveCamera = useCallback((position, target, duration = 2) => {
    // This will be fully implemented with GSAP in Phase 5
    console.log(`Moving camera to position:`, position, `target:`, target);
    setCameraPosition(position);
    if (target) setCameraTarget(target);
  }, [setCameraPosition, setCameraTarget]);

  return {
    cameraPosition,
    cameraTarget,
    moveCamera,
  };
};

export default useCamera;
