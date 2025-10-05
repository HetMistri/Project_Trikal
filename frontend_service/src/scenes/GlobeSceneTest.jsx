import { Canvas } from '@react-three/fiber';

/**
 * Minimal Globe Scene for Testing
 * Tests if React Three Fiber is working correctly
 */
const GlobeSceneTest = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      </Canvas>
    </div>
  );
};

export default GlobeSceneTest;
