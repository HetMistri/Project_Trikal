import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Earth from '../components/3d/Earth';
import Stars from '../components/3d/Stars';
import SatelliteSwarm from '../components/3d/SatelliteSwarm';
import SpaceAtmosphere from '../components/3d/SpaceAtmosphere';
import AtmosphereGlow from '../components/3d/AtmosphereGlow';
import CameraController from '../components/3d/CameraController';
import SCENE_SETTINGS from '../utils/constants';
import useAppStore from '../store/appStore';

/**
 * Globe Scene Component
 * Main 3D Earth globe with orbiting satellites
 * Phase 5: Integrated with camera animation system
 */
const GlobeScene = () => {
  const { camera } = SCENE_SETTINGS;
  const { selectSatellite } = useAppStore();
  const controlsRef = useRef();
  const satellitePositionsRef = useRef([]);

  const handleSatelliteClick = (satelliteData) => {
    // Pass the full satellite data including position and instance index
    selectSatellite(satelliteData);
    console.log('🛰️ Satellite selected:', satelliteData.name);
    console.log('📍 Position:', satelliteData.position);
    console.log('🔢 Instance index:', satelliteData.instanceIndex);
    
    if (satelliteData.isPokeball) {
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
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={24}
          maxDistance={160}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />

        {/* Phase 5: Camera Animation Controller */}
        <CameraController 
          controlsRef={controlsRef}
          satellitePositionsRef={satellitePositionsRef}
        />

        {/* Lighting - Day/Night cycle with lighter nights */}
        {/* Higher ambient light to prevent dark nights */}
        <ambientLight intensity={0.6} />
        
        {/* Sun light - creates day/night effect */}
        <directionalLight 
          position={[50, 0, 20]} 
          intensity={2.0}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={200}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
        
        {/* Fill light to soften shadows and lighten night side */}
        <directionalLight 
          position={[-30, 10, -10]} 
          intensity={0.8}
          color="#7799ff"
        />
        
        {/* Hemisphere light for atmospheric scattering effect */}
        <hemisphereLight 
          skyColor="#4488ff"
          groundColor="#1a1f3a"
          intensity={0.5}
        />
        
        {/* Subtle rim light for Earth edge glow */}
        <pointLight position={[0, 0, 30]} intensity={0.3} color="#00f3ff" distance={50} />

        {/* 3D Scene Elements */}
        <Suspense fallback={null}>
          <Stars />
          <Earth />
          
          {/* Real Satellite Swarm - 100+ satellites with actual TLE data */}
          <SatelliteSwarm 
            count={200} 
            onSatelliteClick={handleSatelliteClick}
            positionsRefOut={satellitePositionsRef}
          />
          
          {/* AtmosphereGlow disabled per user request */}
          {/* <AtmosphereGlow /> */}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GlobeScene;

