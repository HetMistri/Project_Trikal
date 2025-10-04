import ErrorBoundary from './components/ErrorBoundary';
import MapSelector from './components/MapSelector';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <div className="App">
        <MapSelector />
      </div>
    </ErrorBoundary>
  );
}

export default App;
