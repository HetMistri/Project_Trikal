import { useMemo } from 'react';
import * as THREE from 'three';
import { SCENE_SETTINGS } from '../../utils/constants';
import { atmosphereVertexShader, atmosphereFragmentShader } from '../../utils/shaders';

/**
 * AtmosphereGlow Component
 * Atmospheric glow effect around Earth using custom shaders
 */
const AtmosphereGlow = () => {
  const { earth, atmosphere } = SCENE_SETTINGS;

  // Create shader material for atmosphere
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: {
        glowColor: { value: new THREE.Color('#00fff2') },
        viewVector: { value: new THREE.Vector3() },
        intensity: { value: atmosphere.glowIntensity },
      },
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
  }, [atmosphere.glowIntensity]);

  return (
    <mesh material={atmosphereMaterial}>
      <sphereGeometry 
        args={[
          atmosphere.outerRadius, // Slightly larger than Earth
          64, 
          64
        ]} 
      />
    </mesh>
  );
};

export default AtmosphereGlow;

