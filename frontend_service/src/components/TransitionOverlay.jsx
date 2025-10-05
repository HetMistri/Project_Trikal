import './TransitionOverlay.css';

const TransitionOverlay = () => {
  return (
    <div className="transition-overlay">
      <div className="transition-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="transition-text">Initializing...</p>
      </div>
    </div>
  );
};

export default TransitionOverlay;