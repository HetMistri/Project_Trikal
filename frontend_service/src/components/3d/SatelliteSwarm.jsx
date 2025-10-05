import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { fetchSatelliteTLEData, calculateSatellitePosition } from '../../utils/satelliteData';

/**
 * SatelliteSwarm Component
 * Efficiently renders hundreds of satellites using instanced rendering
 * Calculates real orbital positions from TLE data
 */
const SatelliteSwarm = ({ count = 100, onSatelliteClick }) => {
  const meshRef = useRef();
  const [satellites, setSatellites] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pokéball easter egg index (random satellite will be the Pokéball)
  const pokeballIndex = useMemo(() => Math.floor(Math.random() * count), [count]);
  
  // Fetch real satellite data
  useEffect(() => {
    const loadSatellites = async () => {
      setLoading(true);
      const data = await fetchSatelliteTLEData(count);
      setSatellites(data);
      setLoading(false);
      console.log(`🛰️ Loaded ${data.length} satellites`);
    };
    
    loadSatellites();
  }, [count]);
  
  // Create instance matrix
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  
  // Update satellite positions
  useFrame(() => {
    if (!meshRef.current || satellites.length === 0) return;
    
    const time = Date.now();
    const date = new Date(time);
    
    satellites.forEach((sat, i) => {
      let position;
      
      if (sat.tleLine1 && sat.tleLine2) {
        // Calculate real position from TLE
        const realPos = calculateSatellitePosition(sat.tleLine1, sat.tleLine2, date);
        
        if (realPos) {
          // Scale down the orbit radius to cluster satellites closer to Earth
          // Real satellites are ~400-2000km from Earth, we want them at ~18-22 scene units
          const distance = Math.sqrt(realPos.x ** 2 + realPos.y ** 2 + realPos.z ** 2);
          const scaleFactor = 20 / distance; // Target distance of ~20 units from Earth center
          
          position = {
            x: realPos.x * scaleFactor,
            y: realPos.y * scaleFactor,
            z: realPos.z * scaleFactor,
          };
        }
      } else if (sat.isMock) {
        // Use mock orbital mechanics - cluster close to Earth
        const orbitRadius = 18 + Math.random() * 4; // 18-22 units (closer to Earth radius of 16)
        const orbitalSpeed = 0.0005 + (Math.random() * 0.0003);
        const angle = (time / 1000) * orbitalSpeed + (i * 0.1);
        const inclinationRad = sat.inclination * (Math.PI / 180);
        
        position = {
          x: orbitRadius * Math.cos(angle),
          y: orbitRadius * Math.sin(angle) * Math.sin(inclinationRad),
          z: orbitRadius * Math.sin(angle) * Math.cos(inclinationRad),
        };
      }
      
      if (position) {
        tempObject.position.set(position.x, position.y, position.z);
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(i, tempObject.matrix);
        
        // Set color (Pokéball is different)
        if (i === pokeballIndex) {
          tempColor.setHex(0xff0000); // Red for Pokéball
        } else {
          tempColor.setHex(0x00f3ff); // Blue for regular satellites
        }
        meshRef.current.setColorAt(i, tempColor);
      }
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });
  
  if (loading || satellites.length === 0) {
    return null;
  }
  
  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, satellites.length]}
      onClick={(e) => {
        e.stopPropagation();
        const instanceId = e.instanceId;
        if (instanceId !== undefined) {
          onSatelliteClick?.(satellites[instanceId], instanceId === pokeballIndex);
          if (instanceId === pokeballIndex) {
            console.log('🎉 EASTER EGG! You found the Pokéball satellite!');
          }
        }
      }}
    >
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshStandardMaterial
        transparent
        opacity={0.8}
        emissive="#00f3ff"
        emissiveIntensity={0.6}
      />
    </instancedMesh>
  );
};

export default SatelliteSwarm;
