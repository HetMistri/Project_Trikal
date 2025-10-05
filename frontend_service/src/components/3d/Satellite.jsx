import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import PropTypes from 'prop-types';
import * as THREE from 'three';

/**
 * Satellite Component
 * Renders orbiting satellites as translucent blue spheres
 * One satellite is secretly a Pokéball easter egg!
 */
const Satellite = ({ satellite, earthRadius, onClick, isSelected }) => {
  const satelliteRef = useRef();
  const orbitRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Check if this is the easter egg satellite
  const isPokeball = satellite.id === 'sentinel-2a'; // Sentinel-2A is the Pokéball!
  
  // Calculate orbital radius (Earth radius + altitude in scene units)
  // Convert km altitude to scene units (1 scene unit ≈ 100 km for scaling)
  const orbitRadius = earthRadius + (satellite.altitude / 100);
  
  // Calculate orbital speed (higher altitude = slower speed)
  const orbitalSpeed = satellite.speed / 10000;
  
  // Animate satellite orbit
  useFrame(({ clock }) => {
    if (orbitRef.current) {
      const time = clock.getElapsedTime();
      
      // Calculate position based on orbital mechanics
      const angle = time * orbitalSpeed;
      const inclinationRad = satellite.inclination * (Math.PI / 180);
      
      const x = orbitRadius * Math.cos(angle);
      const y = orbitRadius * Math.sin(angle) * Math.sin(inclinationRad);
      const z = orbitRadius * Math.sin(angle) * Math.cos(inclinationRad);
      
      orbitRef.current.position.set(x, y, z);
      
      // Rotate satellite for visual interest
      if (satelliteRef.current) {
        satelliteRef.current.rotation.y += 0.01;
      }
    }
  });

  // Pokéball colors and structure
  if (isPokeball) {
    return (
      <group ref={orbitRef}>
        <group 
          ref={satelliteRef}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          {/* Top half - Red */}
          <mesh position={[0, 0.15, 0]}>
            <sphereGeometry args={[0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial 
              color="#ff0000" 
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>
          
          {/* Bottom half - White */}
          <mesh position={[0, -0.15, 0]} rotation={[Math.PI, 0, 0]}>
            <sphereGeometry args={[0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial 
              color="#ffffff" 
              metalness={0.3}
              roughness={0.2}
            />
          </mesh>
          
          {/* Middle band - Black */}
          <mesh>
            <cylinderGeometry args={[0.305, 0.305, 0.1, 32]} />
            <meshStandardMaterial 
              color="#000000"
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
          
          {/* Center button - White */}
          <mesh position={[0.3, 0, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial 
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.5}
            />
          </mesh>
          
          {/* Center button border - Black */}
          <mesh position={[0.31, 0, 0]}>
            <torusGeometry args={[0.08, 0.02, 8, 16]} />
            <meshStandardMaterial 
              color="#000000"
              metalness={0.7}
            />
          </mesh>
          
          {/* Glow effect when hovered/selected */}
          {(hovered || isSelected) && (
            <pointLight 
              position={[0, 0, 0]} 
              intensity={2} 
              distance={3} 
              color="#ffff00" 
            />
          )}
        </group>
      </group>
    );
  }

  // Regular satellite - Translucent blue sphere
  return (
    <group ref={orbitRef}>
      <mesh
        ref={satelliteRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={satellite.color}
          transparent={true}
          opacity={hovered || isSelected ? 0.9 : 0.6}
          emissive={satellite.color}
          emissiveIntensity={hovered || isSelected ? 0.8 : 0.3}
          metalness={0.2}
          roughness={0.3}
        />
        
        {/* Glow effect when hovered or selected */}
        {(hovered || isSelected) && (
          <pointLight 
            position={[0, 0, 0]} 
            intensity={1.5} 
            distance={2} 
            color={satellite.color} 
          />
        )}
      </mesh>
      
      {/* Pulse effect for selected satellite */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[0.25, 16, 16]} />
          <meshBasicMaterial
            color={satellite.color}
            transparent={true}
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  );
};

Satellite.propTypes = {
  satellite: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    altitude: PropTypes.number.isRequired,
    inclination: PropTypes.number.isRequired,
    speed: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
  }).isRequired,
  earthRadius: PropTypes.number.isRequired,
  onClick: PropTypes.func,
  isSelected: PropTypes.bool,
};

export default Satellite;

