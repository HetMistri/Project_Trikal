import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SCENE_SETTINGS } from '../../utils/constants';

/**
 * Stars Component
 * Starfield background with particle system
 */
const Stars = () => {
  const starsRef = useRef();
  const { stars } = SCENE_SETTINGS;

  // Generate random star positions
  const starPositions = useMemo(() => {
    const positions = new Float32Array(stars.count * 3);
    
    for (let i = 0; i < stars.count; i++) {
      // Random position in a sphere
      const radius = stars.spread;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, [stars.count, stars.spread]);

  // Subtle rotation for depth effect
  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={stars.count}
          array={starPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={stars.size}
        color="#ffffff"
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
      />
    </points>
  );
};

export default Stars;

