# Phase 5: Camera Transitions & Zoom System

## Overview
Phase 5 implements a cinematic 6.5-second camera animation sequence that triggers when a user selects a satellite. The system uses GSAP for smooth, timeline-based animations with custom easing functions.

## Animation Sequence

### Timeline (6.5 seconds total)
```
0.0s - 0.5s: Step 1 - Selection highlight (satellite nudge)
0.5s - 2.0s: Step 2 - Zoom to satellite (smooth approach)
2.0s - 3.0s: Step 3 - Brief follow (orbit around satellite)
3.0s - 5.0s: Step 4 - Fall to Earth (dramatic descent)
5.0s - 6.0s: Step 5 - Perspective shift (3D to 2D)
6.0s - 6.5s: Step 6 - Scene transition trigger
```

## Architecture

### Core Components

#### 1. `utils/animations.js`
**Enhanced easing functions and utilities**

Key additions:
- `easings.cinematicZoom` - Fast approach, smooth deceleration
- `easings.freeFall` - Accelerating descent effect
- `easings.easeInOutBack` - Anticipation/overshoot effect
- `easings.easeInOutExpo` - Exponential smooth transitions
- `lerpVector()` - 3D vector interpolation
- `slerp()` - Spherical interpolation for rotations
- `calculateOrbitPosition()` - Orbital path calculations
- `DeltaTimer` - Frame-rate independent animations
- `cameraPresets` - Pre-configured animation timings

#### 2. `hooks/useCamera.js`
**Main camera animation controller**

Exports:
```javascript
const {
  // Master sequence
  playFullSequence,        // Complete 6.5s animation
  resetCamera,             // Return to globe view
  stopAnimation,           // Cancel ongoing animations
  setControls,             // Register OrbitControls
  
  // Individual steps
  animateSelection,        // Step 1: 0.5s highlight
  zoomToSatellite,        // Step 2: 1.5s zoom
  followSatellite,        // Step 3: 1.0s follow
  fallToEarth,            // Step 4: 2.0s fall
  perspectiveShift,       // Step 5: 1.0s shift
  
  // Legacy
  moveCamera,             // Backward compatible
  
  // State
  isAnimating,
  timeline,
} = useCamera();
```

#### 3. `components/3d/CameraController.jsx`
**Integrates camera system with app state**

Responsibilities:
- Listens to satellite selection events
- Triggers `playFullSequence()` when satellite is selected
- Manages OrbitControls enabling/disabling
- Coordinates scene transitions after animation completes

#### 4. `components/ui/CameraDebugPanel.jsx`
**Development testing tool**

Features:
- Test full 6.5s sequence
- Trigger individual animation steps
- Reset camera position
- Stop ongoing animations
- Monitor selected satellite state

## Usage

### Basic Integration

```jsx
import { useRef } from 'react';
import CameraController from './components/3d/CameraController';
import { OrbitControls } from '@react-three/drei';

function GlobeScene() {
  const controlsRef = useRef();
  
  return (
    <Canvas>
      <OrbitControls ref={controlsRef} />
      <CameraController controlsRef={controlsRef} />
      {/* Your 3D scene */}
    </Canvas>
  );
}
```

### Custom Animation Sequence

```javascript
import useCamera from './hooks/useCamera';

function MyComponent() {
  const {
    zoomToSatellite,
    fallToEarth,
    perspectiveShift
  } = useCamera();
  
  const customSequence = () => {
    zoomToSatellite(satellitePos, () => {
      fallToEarth(earthPos, () => {
        perspectiveShift(mapCenter);
      });
    });
  };
  
  return <button onClick={customSequence}>Play</button>;
}
```

### Manual Camera Control

```javascript
import useCamera from './hooks/useCamera';

function MyComponent() {
  const { moveCamera } = useCamera();
  
  const moveToPosition = () => {
    moveCamera(
      { x: 10, y: 20, z: 30 },  // position
      { x: 0, y: 0, z: 0 },      // lookAt target
      2.0                         // duration (seconds)
    );
  };
  
  return <button onClick={moveToPosition}>Move</button>;
}
```

## Animation Details

### Step 1: Selection Highlight (0.5s)
- **Easing**: `back.out(1.7)` (overshoot effect)
- **Movement**: Small nudge (10% of distance) toward satellite
- **Purpose**: Visual feedback for user selection

### Step 2: Zoom to Satellite (1.5s)
- **Easing**: `power2.inOut` (smooth acceleration/deceleration)
- **FOV Change**: 45° → 35° (zoom in effect)
- **Distance**: Stops 8 units from satellite
- **Look-at**: Focuses on satellite position

### Step 3: Follow Satellite (1.0s)
- **Easing**: `power1.inOut` (gentle motion)
- **Orbit Speed**: 0.5 radians around satellite
- **Height Offset**: +2 units above orbital plane
- **Purpose**: Creates cinematic tracking shot

### Step 4: Fall to Earth (2.0s)
- **Easing**: `power3.in` (accelerating descent)
- **FOV Change**: 35° → 60° (dramatic widening)
- **Target Height**: 25 units above Earth surface
- **Purpose**: Simulates gravity-assisted fall

### Step 5: Perspective Shift (1.0s)
- **Easing**: `power2.out` (smooth landing)
- **FOV Change**: 60° → 45° (return to normal)
- **Final Position**: Top-down at 40 units height
- **Purpose**: Transition to 2D map view

### Step 6: Scene Transition (0.5s)
- Triggers scene change callback
- Fades to map interface
- Re-enables user controls

## Configuration

### Camera Presets (`utils/animations.js`)

```javascript
export const cameraPresets = {
  satelliteZoom: {
    duration: 1.5,
    ease: 'power2.inOut',
    fovChange: { from: 45, to: 35 },
  },
  satelliteFollow: {
    duration: 1.0,
    ease: 'power1.inOut',
    orbitSpeed: 0.5,
  },
  earthFall: {
    duration: 2.0,
    ease: 'power3.in',
    fovChange: { from: 35, to: 60 },
  },
  perspectiveShift: {
    duration: 1.0,
    ease: 'power2.out',
    fovChange: { from: 60, to: 45 },
  },
  selectionHighlight: {
    duration: 0.5,
    ease: 'back.out(1.7)',
  },
};
```

Adjust these values to customize timing and easing.

## Performance

### Frame-Rate Independence
The `DeltaTimer` class ensures consistent animation speed:

```javascript
import { DeltaTimer } from './utils/animations';

const timer = new DeltaTimer(60); // Target 60 FPS

function animate() {
  const delta = timer.update();
  // Use delta for time-based calculations
}
```

### Optimization Tips
1. **Disable OrbitControls** during animations to prevent conflicts
2. **Use GSAP's `onUpdate`** sparingly (only when needed)
3. **Batch camera updates** in the same frame
4. **Limit FOV changes** to essential steps only

## Testing

### Using Debug Panel
1. Open the application
2. Wait for loading to complete (globe scene)
3. Look for **"🎥 Camera Debug"** panel in top-right
4. Click to expand panel
5. Test individual steps or full sequence

### Manual Testing Checklist
- [ ] Click a satellite → Full sequence plays automatically
- [ ] Sequence completes in ~6.5 seconds
- [ ] FOV transitions smoothly (no jumps)
- [ ] Camera maintains 60fps throughout
- [ ] OrbitControls disabled during animation
- [ ] OrbitControls re-enabled after completion
- [ ] "Reset Camera" returns to globe view
- [ ] "Stop Animation" cancels mid-sequence
- [ ] Scene transitions to map after completion

## Troubleshooting

### Camera doesn't move
- Check if `controlsRef` is properly passed to `CameraController`
- Verify `setControls()` is called in `useEffect`
- Console should show: "✅ CameraController: Controls registered"

### Animation is choppy
- Check browser FPS (press F12, Performance tab)
- Reduce satellite count if GPU is overloaded
- Disable shadows temporarily for testing

### FOV not changing
- Ensure `camera.updateProjectionMatrix()` is called after FOV changes
- Check GSAP is imported correctly
- Verify camera is from `useThree()` hook

### Sequence doesn't trigger
- Check satellite selection in app store: `selectedSatellite` should be set
- Verify `CameraController` is mounted in scene
- Console should show: "🎬 Starting full camera sequence..."

## Future Enhancements

### Potential Improvements
1. **Dynamic satellite positions** - Use real TLE data for target positions
2. **Blur effects** - Add depth-of-field during zoom
3. **Particle effects** - Add trail effects during fall
4. **Audio integration** - Sync sound effects to animation steps
5. **Skip option** - Allow users to skip animation
6. **Replay button** - Replay last animation sequence
7. **Custom paths** - User-defined camera paths
8. **VR support** - Adapt for VR headset tracking

## Dependencies

```json
{
  "gsap": "^3.12.0",
  "@react-three/fiber": "^8.18.0",
  "@react-three/drei": "^9.122.0",
  "three": "^0.180.0"
}
```

## Related Files

```
src/
├── hooks/
│   └── useCamera.js           # Main camera hook
├── components/
│   ├── 3d/
│   │   └── CameraController.jsx   # State integration
│   └── ui/
│       └── CameraDebugPanel.jsx   # Testing UI
├── utils/
│   └── animations.js          # Easing & utilities
└── scenes/
    └── GlobeScene.jsx         # Scene integration
```

## Console Logging

During animation, you'll see:
```
🎬 Starting full camera sequence...
📍 Satellite position: {x: 20, y: 5, z: 15}
🌍 Earth target: {x: 10, y: 0, z: 8}
Step 1: Selection highlight
Step 2: Zooming to satellite
✓ Zoom complete
Step 3: Following satellite
✓ Follow complete
Step 4: Falling to Earth
✓ Fall complete
Step 5: Perspective shift to 2D
✓ Perspective shift complete
Step 6: Triggering scene change...
✅ Camera sequence complete!
```

## API Reference

### `playFullSequence(satellitePos, earthPos, onComplete)`
Plays the complete 6.5-second animation sequence.

**Parameters:**
- `satellitePos` - `{x, y, z}` - Satellite position in 3D space
- `earthPos` - `{x, y, z}` - Target position on Earth
- `onComplete` - `Function` - Callback after animation completes

**Returns:** GSAP Timeline instance

### `resetCamera()`
Returns camera to initial globe overview position.

**Duration:** 1.5 seconds  
**Returns:** GSAP Timeline instance

### `stopAnimation()`
Cancels any ongoing camera animations immediately.

### `setControls(controlsInstance)`
Registers OrbitControls for automatic enabling/disabling.

**Parameters:**
- `controlsInstance` - Reference to `<OrbitControls>` component

---

**Phase 5 Status:** ✅ Complete  
**Next Phase:** Phase 6 - Transition Effects & Scene Management  
**Last Updated:** October 5, 2025
