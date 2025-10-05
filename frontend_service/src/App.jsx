import { useState, useEffect } from 'react';
import useAppStore from './store/appStore';
import TransitionManager from './scenes/TransitionManager';
import LoadingScene from './scenes/LoadingScene';
import GlobeScene from './scenes/GlobeScene';
import MapScene from './scenes/MapScene';
import { preloadAllAssets } from './utils/assetLoader';
import './App.css';
import './styles/theme.css';

function App() {
  const currentScene = useAppStore((state) => state.currentScene);
  const setScene = useAppStore((state) => state.setScene);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Load assets with progress tracking
  useEffect(() => {
    preloadAllAssets((progress) => {
      setLoadingProgress(progress);
    });
  }, []);

  const handleLoadingComplete = () => {
    setScene('globe');
  };

  const renderScene = () => {
    switch (currentScene) {
      case 'loading':
        return (
          <LoadingScene 
            progress={loadingProgress} 
            onComplete={handleLoadingComplete}
          />
        );
      case 'globe':
        return <GlobeScene />;
      case 'map':
        return <MapScene />;
      default:
        return <LoadingScene progress={loadingProgress} onComplete={handleLoadingComplete} />;
    }
  };

  return (
    <div className="App">
      <TransitionManager>
        {renderScene()}
      </TransitionManager>
    </div>
  );
}

export default App;
