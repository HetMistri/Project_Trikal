import { useCallback } from 'react';
import useAppStore from '../store/appStore';

/**
 * Custom hook for audio management
 * To be fully implemented in Phase 9
 */
const useAudio = () => {
  const audioEnabled = useAppStore((state) => state.audioEnabled);
  const audioVolume = useAppStore((state) => state.audioVolume);
  const toggleAudio = useAppStore((state) => state.toggleAudio);
  const setAudioVolume = useAppStore((state) => state.setAudioVolume);

  const playSound = useCallback((soundName) => {
    if (!audioEnabled) return;
    console.log(`Playing sound: ${soundName}`);
    // Howler.js implementation will be added in Phase 9
  }, [audioEnabled]);

  const playMusic = useCallback((musicName) => {
    if (!audioEnabled) return;
    console.log(`Playing music: ${musicName}`);
    // Howler.js implementation will be added in Phase 9
  }, [audioEnabled]);

  return {
    audioEnabled,
    audioVolume,
    toggleAudio,
    setAudioVolume,
    playSound,
    playMusic,
  };
};

export default useAudio;
