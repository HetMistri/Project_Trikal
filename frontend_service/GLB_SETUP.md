# GLB Model Setup Complete ✅

## What I Did:
1. ✅ Created `public/models/` directory
2. ✅ Updated `Earth.jsx` to use GLB model with `useGLTF` loader
3. ✅ Added model preloading for better performance

## Next Steps:

### 1. Copy Your Model File
**Copy your GLB model to:**
```
C:\Users\Omee\Documents\Project_Trikla\frontend_service\public\models\earth.glb
```

### 2. If Your Model Has a Different Name
If your model is named something else (e.g., `planet.glb`, `earth_model.glb`), update line 17 in `Earth.jsx`:

**Current:**
```jsx
const { scene } = useGLTF('/models/earth.glb');
```

**Change to (example):**
```jsx
const { scene } = useGLTF('/models/your-model-name.glb');
```

Also update line 38 (preload):
```jsx
useGLTF.preload('/models/your-model-name.glb');
```

### 3. Adjust Model Size
The model is scaled based on this formula:
```jsx
scale={earth.radius / 5}
```

**If your model is:**
- **Too small**: Increase the divisor → `scale={earth.radius / 3}` or `scale={earth.radius / 2}`
- **Too big**: Decrease the divisor → `scale={earth.radius / 8}` or `scale={earth.radius / 10}`
- **Way too small/big**: Use a fixed scale → `scale={5}` or `scale={0.5}`

### 4. Adjust Model Rotation (if needed)
If your model is upside down or rotated incorrectly, modify the rotation prop:

```jsx
rotation={[Math.PI / 2, 0, 0]}  // Rotate 90° on X-axis
rotation={[0, Math.PI, 0]}      // Rotate 180° on Y-axis
rotation={[0, 0, Math.PI / 2]}  // Rotate 90° on Z-axis
```

### 5. Test It!
1. Make sure your model is in `public/models/earth.glb`
2. Refresh your browser (Ctrl+R or F5)
3. The model should load and rotate automatically

---

## Troubleshooting:

### Model not appearing?
**Check console (F12) for errors:**
- "404 Not Found" → Model path is wrong or file not in correct folder
- "Invalid GLB" → Model file might be corrupted
- No error but blank → Model might be too small/big (adjust scale)

### Model is black/dark?
- GLB models with embedded textures should work automatically
- Check if lighting is sufficient in `GlobeScene.jsx`
- Your model might not have embedded textures

### Model is the wrong size?
Edit `Earth.jsx` line 28:
```jsx
scale={1}     // Try fixed scale first
scale={5}     // Larger
scale={0.1}   // Smaller
```

### Model spins too fast/slow?
Edit `constants.js`:
```jsx
rotationSpeed: 0.001,  // Current (slower)
rotationSpeed: 0.005,  // Faster
rotationSpeed: 0.0005, // Even slower
```

---

## Current Setup:
- ✅ Model path: `/models/earth.glb`
- ✅ Scale: `earth.radius / 5` (= 16 / 5 = 3.2x)
- ✅ Rotation speed: `0.001` rad/frame
- ✅ Tilt: `23.5°` (Earth's natural tilt)

---

## Ready to Go! 🚀
Once your model is in place, refresh the browser and you should see your custom Earth model rotating in 3D!
