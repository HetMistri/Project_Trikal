/**
 * GUIDE: Using Custom 3D Models for Earth
 * 
 * This guide covers different ways to import custom 3D models
 */

// ============================================
// METHOD 1: GLTF/GLB Models (Recommended)
// ============================================
import { useGLTF } from '@react-three/drei';

function EarthGLTF() {
  const { scene } = useGLTF('/models/earth.glb');
  return <primitive object={scene} scale={5} />;
}

// ============================================
// METHOD 2: OBJ Models
// ============================================
import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { TextureLoader } from 'three';

function EarthOBJ() {
  const obj = useLoader(OBJLoader, '/models/earth.obj');
  const texture = useLoader(TextureLoader, '/textures/earth.jpg');
  
  // Apply texture to the model
  obj.traverse((child) => {
    if (child.isMesh) {
      child.material.map = texture;
    }
  });
  
  return <primitive object={obj} scale={5} />;
}

// ============================================
// METHOD 3: FBX Models
// ============================================
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

function EarthFBX() {
  const fbx = useLoader(FBXLoader, '/models/earth.fbx');
  return <primitive object={fbx} scale={0.05} />;
}

// ============================================
// METHOD 4: Multiple Textures (Current Sphere)
// ============================================
function EarthWithTextures() {
  const [colorMap, normalMap, specularMap, cloudsMap] = useLoader(TextureLoader, [
    '/textures/earth_color.jpg',
    '/textures/earth_normal.jpg',
    '/textures/earth_specular.jpg',
    '/textures/earth_clouds.jpg',
  ]);

  return (
    <mesh>
      <sphereGeometry args={[16, 64, 64]} />
      <meshStandardMaterial
        map={colorMap}
        normalMap={normalMap}
        roughnessMap={specularMap}
      />
    </mesh>
  );
}

// ============================================
// RESOURCES FOR FREE MODELS:
// ============================================
/*
1. Sketchfab (https://sketchfab.com)
   - Search: "earth 3d model free"
   - Download as .glb or .gltf

2. NASA 3D Resources (https://nasa3d.arc.nasa.gov)
   - Official NASA models
   - High quality Earth models

3. Poly Haven (https://polyhaven.com)
   - Free 3D assets
   - Good quality models

4. Turbosquid (https://www.turbosquid.com)
   - Some free models available
   - Filter by "Free"

5. CGTrader (https://www.cgtrader.com)
   - Free 3D models section

RECOMMENDED EARTH MODELS:
- Low poly Earth (for better performance): ~5-10k polygons
- High detail Earth: ~50k polygons
- Ultra realistic: 100k+ polygons (may impact performance)
*/

// ============================================
// FOLDER STRUCTURE:
// ============================================
/*
frontend_service/
  public/
    models/
      earth.glb          <- Place your model here
      earth.obj          <- Or OBJ files here
      earth.mtl          <- Material file for OBJ
    textures/
      earth_color.jpg    <- Texture maps
      earth_normal.jpg
      earth_clouds.jpg
*/

// ============================================
// USAGE IN GlobeScene.jsx:
// ============================================
/*
Replace:
  import Earth from '../components/3d/Earth';

With:
  import EarthModel from '../components/3d/EarthModel';

Then in the JSX:
  <EarthModel />  // instead of <Earth />
*/

export {};
