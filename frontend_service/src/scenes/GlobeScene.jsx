import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Earth from '../components/3d/Earth';
import Stars from '../components/3d/Stars';
import SatelliteSwarm from '../components/3d/SatelliteSwarm';
import AtmosphereGlow from '../components/3d/AtmosphereGlow';
import { SCENE_SETTINGS } from '../utils/constants';
import useAppStore from '../store/appStore';

/**
 * Globe Scene Component
 * Main 3D Earth globe with orbiting satellites
 */
const GlobeScene = () => {
  const { camera } = SCENE_SETTINGS;
  const { selectSatellite } = useAppStore();

  const handleSatelliteClick = (satellite, isPokeball) => {
    selectSatellite(satellite.id);
    console.log('🛰️ Satellite selected:', satellite.name);
    if (isPokeball) {
      console.log('🎉 CONGRATULATIONS! You found the secret Pokéball satellite!');
      console.log('🔴⚪ Gotta catch \'em all!');
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas>
        {/* Camera Setup */}
        <PerspectiveCamera
          makeDefault
          position={camera.initialPosition}
          fov={camera.fov}
          near={camera.near}
          far={camera.far}
        />

        {/* Orbit Controls for user interaction */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={24}
          maxDistance={160}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />

        {/* Lighting - Enhanced for better model visibility */}
        <ambientLight intensity={0.8} />
        <directionalLight 
          position={[10, 5, 5]} 
          intensity={2.0}
        />
        <directionalLight 
          position={[-10, -5, -5]} 
          intensity={1.0}
        />
        <pointLight position={[0, 10, 10]} intensity={1.0} />
        <hemisphereLight 
          skyColor="#ffffff"
          groundColor="#444444"
          intensity={0.6}
        />

        {/* 3D Scene Elements */}
        <Suspense fallback={null}>
          <Stars />
          <Earth />
          
          {/* Real Satellite Swarm - 100+ satellites with actual TLE data */}
          <SatelliteSwarm 
            count={2000} 
            onSatelliteClick={handleSatelliteClick}
          />
          
          {/* AtmosphereGlow disabled per user request */}
          {/* <AtmosphereGlow /> */}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GlobeScene;

