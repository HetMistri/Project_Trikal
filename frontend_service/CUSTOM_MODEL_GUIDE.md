# Custom 3D Model Integration Guide

## Quick Start

### 1. **Download a 3D Model**
Get a free Earth model from:
- **Sketchfab**: https://sketchfab.com/search?q=earth&type=models
- **NASA 3D Resources**: https://nasa3d.arc.nasa.gov/models
- **Poly Haven**: https://polyhaven.com/models
- **CGTrader**: https://www.cgtrader.com (filter by "Free")

**Recommended format**: `.glb` or `.gltf` (best compatibility)

---

### 2. **Place Model in Project**
```
frontend_service/
  public/
    models/
      earth.glb    ← Place your model here
```

---

### 3. **Use Custom Model**

#### **Option A: Simple Replacement**
In `GlobeScene.jsx`, replace:
```jsx
import Earth from '../components/3d/Earth';
```
with:
```jsx
import EarthModel from '../components/3d/EarthModel';
```

Then update the component path in the model file:
- Edit `/src/components/3d/EarthModel.jsx`
- Change line: `const { scene } = useGLTF('/models/earth.glb');`
- Update to your model's filename

#### **Option B: Flexible Component (Recommended)**
In `GlobeScene.jsx`, replace:
```jsx
import Earth from '../components/3d/Earth';
```
with:
```jsx
import CustomEarth from '../components/3d/CustomEarth';
```

Then in the JSX, replace `<Earth />` with:
```jsx
<CustomEarth 
  useCustomModel={true} 
  modelPath="/models/earth.glb"
  modelScale={0.5}
/>
```

---

## Model Types Supported

| Format | Loader | Notes |
|--------|--------|-------|
| `.glb` / `.gltf` | `useGLTF` | **Recommended** - Best performance, includes textures |
| `.obj` | `OBJLoader` | Common format, needs separate `.mtl` for materials |
| `.fbx` | `FBXLoader` | Autodesk format, good for animations |
| Sphere (default) | Built-in | Current implementation with texture mapping |

---

## Scaling Your Model

Models come in different sizes. Adjust the `modelScale` prop:

```jsx
<CustomEarth modelScale={0.1} />  // Model too big? Use smaller scale
<CustomEarth modelScale={5.0} />  // Model too small? Use larger scale
<CustomEarth modelScale={1.0} />  // Default scale
```

**Tip**: Start with `modelScale={1}` and adjust until it looks right.

---

## Advanced: Multiple Textures

For ultra-realistic Earth with cloud layers, normal maps, etc.:

1. Download high-quality textures from:
   - **Solar System Scope**: https://www.solarsystemscope.com/textures/
   - **NASA Visible Earth**: https://visibleearth.nasa.gov/

2. Place textures in `public/textures/`:
   ```
   public/
     textures/
       earth_day.jpg
       earth_normal.jpg
       earth_clouds.jpg
       earth_night.jpg
   ```

3. Use the enhanced sphere with multiple textures (see `MODEL_GUIDE.js` for code examples)

---

## Performance Tips

- **Low poly models** (5k-10k polygons): Best for mobile/low-end devices
- **Medium detail** (20k-50k polygons): Good balance for most users
- **High detail** (100k+ polygons): Desktop only, may cause lag

---

## Troubleshooting

### Model not appearing?
1. Check browser console for errors
2. Verify model path is correct: `/models/earth.glb` (relative to `public/` folder)
3. Try opening the model in a 3D viewer (Blender, Windows 3D Viewer) to confirm it's valid

### Model is black/no texture?
1. Make sure model includes embedded textures (GLB format is best for this)
2. Check lighting in `GlobeScene.jsx`
3. Try increasing light intensity

### Model is wrong size?
Adjust the `modelScale` prop:
```jsx
<CustomEarth modelScale={0.5} />  // Half size
<CustomEarth modelScale={2.0} />  // Double size
```

### Model is upside down or rotated wrong?
Add rotation adjustment in `CustomEarth.jsx`:
```jsx
<primitive 
  rotation={[Math.PI / 2, 0, 0]}  // Rotate 90° on X-axis
  // ... other props
/>
```

---

## Files Created for You

1. **`EarthModel.jsx`** - Simple GLTF model loader
2. **`CustomEarth.jsx`** - Flexible component with fallback (recommended)
3. **`MODEL_GUIDE.js`** - Code examples for different model formats
4. **`CUSTOM_MODEL_GUIDE.md`** - This documentation file

---

## Next Steps

After adding your custom model:
1. Test the scene by refreshing the browser
2. Adjust `modelScale` if needed
3. Consider adding cloud layers or atmosphere effects
4. Proceed to Phase 4 (Satellite Orbit System)

---

## Example: Complete Implementation

```jsx
// GlobeScene.jsx
import CustomEarth from '../components/3d/CustomEarth';

// Inside the Canvas component:
<Suspense fallback={null}>
  <Stars />
  <CustomEarth 
    useCustomModel={true}
    modelPath="/models/earth.glb"
    modelScale={1.2}
  />
  {/* <AtmosphereGlow /> */}
</Suspense>
```

That's it! Your custom Earth model should now be rendering in the scene. 🌍✨
