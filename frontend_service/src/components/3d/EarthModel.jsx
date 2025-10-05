import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { SCENE_SETTINGS } from '../../utils/constants';

/**
 * EarthModel Component
 * 3D Earth using custom GLTF/GLB model
 * 
 * To use this component:
 * 1. Place your .gltf or .glb file in the public folder (e.g., public/models/earth.glb)
 * 2. Replace the path in useGLTF below
 * 3. Import this component instead of Earth.jsx in GlobeScene.jsx
 */
const EarthModel = () => {
  const earthRef = useRef();
  const { earth } = SCENE_SETTINGS;

  // Load GLTF/GLB model
  // Replace '/models/earth.glb' with your model path
  const { scene } = useGLTF('/models/earth.glb');

  // Rotate the model
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += earth.rotationSpeed;
    }
  });

  return (
    <primitive 
      ref={earthRef}
      object={scene}
      scale={earth.radius / 5} // Adjust scale based on your model's size
      rotation={[0, 0, earth.tilt * (Math.PI / 180)]}
    />
  );
};

// Preload the model for better performance
useGLTF.preload('/models/earth.glb');

export default EarthModel;
