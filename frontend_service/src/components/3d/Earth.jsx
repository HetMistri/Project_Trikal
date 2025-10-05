import { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { SCENE_SETTINGS } from '../../utils/constants';

/**
 * Earth Component
 * 3D Earth globe - tries GLB model first, falls back to textured sphere
 */
const Earth = () => {
  const earthRef = useRef();
  const { earth } = SCENE_SETTINGS;

  // Always call hooks (React requirement)
  // GLB Model
  const gltf = useGLTF('/models/earth.glb', true);
  
  // Earth texture to apply if model doesn't have one
  const earthTexture = useLoader(
    TextureLoader, 
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'
  );

  // Rotate Earth
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += earth.rotationSpeed;
    }
  });

  // Debug logging
  useEffect(() => {
    console.log('🌍 Earth Component Debug:');
    console.log('- Earth radius:', earth.radius);
    console.log('- GLTF loaded:', !!gltf);
    console.log('- GLTF scene:', gltf?.scene);
    if (gltf?.scene) {
      console.log('- Model children:', gltf.scene.children);
      
      // Calculate bounding box to see model size
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      console.log('- Model size (before scale):', size);
      console.log('- Model will be scaled to:', earth.radius * 0.01);
      
      // Check materials and textures
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          console.log('🔷 Mesh found:', child.name);
          console.log('  - Material:', child.material);
          console.log('  - Material type:', child.material?.type);
          console.log('  - Has map texture:', !!child.material?.map);
          console.log('  - Has color:', child.material?.color);
          
          if (child.material?.map) {
            console.log('  - Texture size:', child.material.map.image?.width, 'x', child.material.map.image?.height);
          }
        }
      });
    }
  }, [earth.radius, gltf]);

  // Use GLB model if available
  if (gltf?.scene) {
    console.log('✅ Rendering GLB model');
    
    // Clone the scene to avoid issues
    const clonedScene = gltf.scene.clone();
    
    // Apply proper materials and textures with enhanced shading
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        // Check if material has no texture, apply Earth texture
        if (!child.material.map) {
          console.log('⚠️ No texture found on mesh, applying Earth texture');
          child.material = new THREE.MeshStandardMaterial({
            map: earthTexture,
            metalness: 0.0,
            roughness: 1.0,
            // Responds better to lighting for day/night effect
            emissive: '#000000',
            emissiveIntensity: 0,
          });
        } else {
          // Material has texture, enhance it with proper lighting response
          child.material.needsUpdate = true;
          
          // Adjust material properties for better day/night shading
          if (child.material.roughness !== undefined) {
            child.material.roughness = 1.0; // Full diffuse for realistic Earth
          }
          if (child.material.metalness !== undefined) {
            child.material.metalness = 0.0; // Earth is not metallic
          }
          
          // Ensure material responds to lights properly
          if (child.material.type === 'MeshBasicMaterial') {
            // Convert basic material to standard for lighting
            const oldMap = child.material.map;
            child.material = new THREE.MeshStandardMaterial({
              map: oldMap,
              metalness: 0.0,
              roughness: 1.0,
            });
          }
          
          if (child.material.map) {
            child.material.map.needsUpdate = true;
          }
        }
        
        // Enable shadows for depth
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // Calculate scale based on model's actual size
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDimension = Math.max(size.x, size.y, size.z);
    
    // Auto-scale to match earth.radius
    const autoScale = maxDimension > 0 ? (earth.radius * 2) / maxDimension : 1;
    console.log('- Auto-calculated scale:', autoScale);
    
    return (
      <group>
        <primitive 
          ref={earthRef}
          object={clonedScene}
          scale={autoScale}
          rotation={[0, 0, earth.tilt * (Math.PI / 180)]}
          position={[0, 0, 0]}
        />
        
        {/* Add subtle fog/atmosphere effect around Earth */}
        <mesh>
          <sphereGeometry args={[earth.radius * 1.02, 32, 32]} />
          <meshBasicMaterial
            color="#0a0e27"
            transparent={true}
            opacity={0.05}
            side={THREE.BackSide}
          />
        </mesh>
      </group>
    );
  }

  // Fallback to textured sphere
  console.log('⚠️ Rendering fallback sphere');
  return (
    <mesh ref={earthRef} rotation={[0, 0, earth.tilt * (Math.PI / 180)]}>
      <sphereGeometry args={[earth.radius, earth.segments, earth.segments]} />
      <meshStandardMaterial 
        map={earthTexture}
        metalness={0.0}
        roughness={1.0}
      />
    </mesh>
  );
};

// Preload the model
useGLTF.preload('/models/earth.glb');

export default Earth;


