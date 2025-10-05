import { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import { SCENE_SETTINGS } from '../../utils/constants';
import PropTypes from 'prop-types';

/**
 * CustomEarth Component
 * Flexible Earth component that supports custom 3D models or falls back to textured sphere
 * 
 * SETUP INSTRUCTIONS:
 * 1. Download a 3D Earth model (.glb or .gltf format recommended)
 * 2. Place it in: public/models/earth.glb
 * 3. Use this component in GlobeScene.jsx
 * 
 * RECOMMENDED FREE MODELS:
 * - Sketchfab: https://sketchfab.com/search?q=earth&type=models
 * - NASA 3D: https://nasa3d.arc.nasa.gov/models
 * - Poly Haven: https://polyhaven.com/models
 * 
 * MODEL SETTINGS:
 * - modelPath: Path to your model file (default: '/models/earth.glb')
 * - useCustomModel: Set to true to use custom model, false for textured sphere
 * - modelScale: Adjust if your model is too big/small (default: 1)
 */

const CustomEarth = ({ 
  modelPath = '/models/earth.glb', 
  useCustomModel = false,
  modelScale = 1 
}) => {
  const earthRef = useRef();
  const { earth } = SCENE_SETTINGS;

  // Rotate the Earth
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += earth.rotationSpeed;
    }
  });

  if (useCustomModel) {
    return <CustomModelEarth modelPath={modelPath} modelScale={modelScale} earthRef={earthRef} />;
  }

  // Fallback to textured sphere (current implementation)
  return <TexturedSphereEarth earthRef={earthRef} />;
};

/**
 * Custom 3D Model Earth
 */
const CustomModelEarth = ({ modelPath, modelScale, earthRef }) => {
  const { earth } = SCENE_SETTINGS;
  
  try {
    const { scene } = useGLTF(modelPath);
    
    return (
      <primitive 
        ref={earthRef}
        object={scene.clone()} // Clone to prevent issues with multiple instances
        scale={earth.radius * modelScale}
        rotation={[0, 0, earth.tilt * (Math.PI / 180)]}
      />
    );
  } catch (error) {
    console.warn('Failed to load custom model, falling back to sphere:', error);
    return <TexturedSphereEarth earthRef={earthRef} />;
  }
};

/**
 * Textured Sphere Earth (Original)
 */
const TexturedSphereEarth = ({ earthRef }) => {
  const { earth } = SCENE_SETTINGS;
  const { useLoader } = require('@react-three/fiber');
  const { TextureLoader } = require('three');
  
  const earthTexture = useLoader(
    TextureLoader, 
    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'
  );

  return (
    <mesh ref={earthRef} rotation={[0, 0, earth.tilt * (Math.PI / 180)]}>
      <sphereGeometry args={[earth.radius, earth.segments, earth.segments]} />
      <meshStandardMaterial 
        map={earthTexture}
        metalness={0.1}
        roughness={0.7}
      />
    </mesh>
  );
};

/**
 * Loading Fallback
 */
const LoadingFallback = () => (
  <Html center>
    <div style={{ color: '#00f3ff', fontSize: '20px' }}>
      Loading Earth Model...
    </div>
  </Html>
);

CustomEarth.propTypes = {
  modelPath: PropTypes.string,
  useCustomModel: PropTypes.bool,
  modelScale: PropTypes.number,
};

CustomModelEarth.propTypes = {
  modelPath: PropTypes.string.isRequired,
  modelScale: PropTypes.number.isRequired,
  earthRef: PropTypes.object.isRequired,
};

TexturedSphereEarth.propTypes = {
  earthRef: PropTypes.object.isRequired,
};

// Wrapper with Suspense
const CustomEarthWithSuspense = (props) => (
  <Suspense fallback={<LoadingFallback />}>
    <CustomEarth {...props} />
  </Suspense>
);

export default CustomEarthWithSuspense;
export { CustomEarth };

/**
 * USAGE EXAMPLE IN GlobeScene.jsx:
 * 
 * // Option 1: Use default textured sphere (current)
 * <CustomEarth useCustomModel={false} />
 * 
 * // Option 2: Use custom GLB model
 * <CustomEarth 
 *   useCustomModel={true} 
 *   modelPath="/models/earth.glb"
 *   modelScale={0.5}
 * />
 * 
 * // Option 3: Use custom GLTF model from URL
 * <CustomEarth 
 *   useCustomModel={true} 
 *   modelPath="https://example.com/earth.gltf"
 *   modelScale={1}
 * />
 */
