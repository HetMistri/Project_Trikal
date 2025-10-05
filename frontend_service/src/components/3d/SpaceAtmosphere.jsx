import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Space Atmosphere Effect
 * Adds subtle atmospheric effects around Earth for better visual blending
 */
const SpaceAtmosphere = ({ earthRadius = 16 }) => {
  const atmosphereRef = useRef();

  // Subtle pulsing effect
  useFrame(({ clock }) => {
    if (atmosphereRef.current) {
      const pulse = Math.sin(clock.elapsedTime * 0.5) * 0.01 + 1;
      atmosphereRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      {/* Soft atmospheric glow - very subtle */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[earthRadius * 1.03, 32, 32]} />
        <meshBasicMaterial
          color="#1a3a4a"
          transparent={true}
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Very subtle inner atmosphere */}
      <mesh>
        <sphereGeometry args={[earthRadius * 1.01, 32, 32]} />
        <meshBasicMaterial
          color="#0a1a2a"
          transparent={true}
          opacity={0.05}
          side={THREE.FrontSide}
          blending={THREE.NormalBlending}
        />
      </mesh>
    </group>
  );
};

export default SpaceAtmosphere;
