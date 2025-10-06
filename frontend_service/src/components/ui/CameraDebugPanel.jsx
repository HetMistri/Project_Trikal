import { useState } from 'react';
import useAppStore from '../../store/appStore';

/**
 * CameraDebugPanel
 * Simple development tool to test Phase 5 camera animations
 * Remove or disable in production
 * 
 * NOTE: This component triggers animations by selecting satellites.
 * The actual camera animations are handled by CameraController inside Canvas.
 */
const CameraDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { selectSatellite, selectedSatellite } = useAppStore();

  const handleTrigger = () => {
    // Trigger animation by selecting a test satellite with mock position
    const testId = 'test-satellite-' + Date.now();
    const mockSatellite = {
      id: testId,
      name: 'Test Satellite',
      position: {
        x: 20,
        y: 5,
        z: 15,
      },
    };
    selectSatellite(mockSatellite);
    console.log('🎬 Triggering camera sequence for:', testId);
  };

  const handleClear = () => {
    selectSatellite(null);
    console.log('🔄 Cleared satellite selection');
  };

  const styles = {
    container: {
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(10, 14, 39, 0.95)',
      border: '1px solid #00f3ff',
      borderRadius: '8px',
      padding: '15px',
      color: '#e8e8e8',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 10000,
      width: isOpen ? '280px' : '150px',
      transition: 'width 0.3s ease',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: isOpen ? '15px' : '0',
      cursor: 'pointer',
    },
    title: {
      color: '#00f3ff',
      fontWeight: 'bold',
      fontSize: '14px',
    },
    toggleBtn: {
      background: 'transparent',
      border: '1px solid #00f3ff',
      color: '#00f3ff',
      borderRadius: '4px',
      padding: '2px 8px',
      cursor: 'pointer',
      fontSize: '12px',
    },
    content: {
      display: isOpen ? 'block' : 'none',
    },
    status: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px',
      background: 'rgba(0, 243, 255, 0.1)',
      borderRadius: '4px',
      marginBottom: '12px',
      fontSize: '11px',
    },
    button: {
      background: 'linear-gradient(135deg, #00f3ff 0%, #b800ff 100%)',
      border: 'none',
      color: '#0a0e27',
      borderRadius: '4px',
      padding: '10px 12px',
      cursor: 'pointer',
      fontSize: '11px',
      fontWeight: 'bold',
      width: '100%',
      marginBottom: '8px',
      transition: 'transform 0.2s',
    },
    smallButton: {
      background: 'rgba(0, 243, 255, 0.2)',
      border: '1px solid #00f3ff',
      color: '#00f3ff',
      borderRadius: '4px',
      padding: '8px 10px',
      cursor: 'pointer',
      fontSize: '10px',
      width: '100%',
      marginBottom: '4px',
    },
    info: {
      fontSize: '10px',
      color: '#888',
      marginTop: '8px',
      lineHeight: '1.4',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header} onClick={() => setIsOpen(!isOpen)}>
        <div style={styles.title}>🎥 Camera Debug</div>
        <button style={styles.toggleBtn} onClick={(e) => e.stopPropagation()}>
          {isOpen ? '▼' : '▶'}
        </button>
      </div>

      <div style={styles.content}>
        {/* Status */}
        <div style={styles.status}>
          <span>Selected:</span>
          <span style={{ color: selectedSatellite ? '#00f3ff' : '#888' }}>
            {selectedSatellite ? '✓' : 'None'}
          </span>
        </div>

        {/* Trigger Button */}
        <button
          style={styles.button}
          onClick={handleTrigger}
          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
        >
          ▶ Trigger Camera Sequence
        </button>

        {/* Clear Button */}
        <button
          style={styles.smallButton}
          onClick={handleClear}
        >
          Clear Selection
        </button>

        {/* Info */}
        <div style={styles.info}>
          💡 Click any satellite: Zoom in (2s) → Follow orbit (2s) → Fall to Earth (2s) → Map view
        </div>
      </div>
    </div>
  );
};

export default CameraDebugPanel;
