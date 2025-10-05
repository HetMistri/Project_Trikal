import PropTypes from 'prop-types';
import LoadingScreen from '../components/ui/LoadingScreen';

/**
 * Loading Scene Component
 * Initial scene displayed while assets are loading
 */
const LoadingScene = ({ progress, onComplete }) => {
  return (
    <LoadingScreen progress={progress} onComplete={onComplete} />
  );
};

LoadingScene.propTypes = {
  progress: PropTypes.number.isRequired,
  onComplete: PropTypes.func.isRequired,
};

export default LoadingScene;
