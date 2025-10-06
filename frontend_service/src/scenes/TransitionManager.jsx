import { useEffect } from 'react';
import PropTypes from 'prop-types';
import useAppStore from '../store/appStore';

/**
 * Transition Manager Component
 * Manages scene transitions and animations
 */
const TransitionManager = ({ children }) => {
  const currentScene = useAppStore((state) => state.currentScene);
  const isTransitioning = useAppStore((state) => state.isTransitioning);

  useEffect(() => {
    console.log(`Scene changed to: ${currentScene}`);
  }, [currentScene]);

  return (
    <div className={`transition-manager ${isTransitioning ? 'transitioning' : ''}`}>
      {children}
    </div>
  );
};

TransitionManager.propTypes = {
  children: PropTypes.node.isRequired,
};

export default TransitionManager;
