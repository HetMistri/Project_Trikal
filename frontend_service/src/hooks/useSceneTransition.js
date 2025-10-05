import { useCallback } from 'react';
import useAppStore from '../store/appStore';
import { animateCamera } from '../utils/animations';

/**
 * Custom hook for managing scene transitions
 */
const useSceneTransition = () => {
  const setScene = useAppStore((state) => state.setScene);
  const currentScene = useAppStore((state) => state.currentScene);
  const isTransitioning = useAppStore((state) => state.isTransitioning);

  const transitionTo = useCallback((targetScene) => {
    if (isTransitioning) {
      console.warn('Transition already in progress');
      return;
    }
    
    console.log(`Transitioning from ${currentScene} to ${targetScene}`);
    setScene(targetScene);
  }, [currentScene, isTransitioning, setScene]);

  return {
    currentScene,
    isTransitioning,
    transitionTo,
  };
};

export default useSceneTransition;
