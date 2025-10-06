# Phase 5 Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Start the Development Server
```bash
cd frontend_service
npm run dev
```

### 2. Wait for Loading Screen
The app will show a loading screen → then transition to the 3D globe

### 3. Find the Debug Panel
Look for **"🎥 Camera Debug"** in the top-right corner

### 4. Test the Animation
Click **"▶ Play Full Sequence"** to see the 6.5-second camera animation

---

## ⚡ Quick Test Checklist

### Full Sequence Test
1. ✅ Open debug panel
2. ✅ Click "Play Full Sequence"
3. ✅ Watch 6.5s animation
4. ✅ Check console for step logs
5. ✅ Verify smooth 60fps

### Satellite Selection Test
1. ✅ Click any blue satellite sphere
2. ✅ Camera automatically plays sequence
3. ✅ Console shows selected satellite
4. ✅ Alert appears after completion

### Individual Steps Test
1. ✅ Test Step 1: Selection (0.5s)
2. ✅ Test Step 2: Zoom (1.5s)
3. ✅ Test Step 3: Follow (1.0s)
4. ✅ Test Step 4: Fall (2.0s)
5. ✅ Test Step 5: Shift (1.0s)

### Control Test
1. ✅ Click "Reset Camera"
2. ✅ Click "Stop Animation" during sequence
3. ✅ Verify camera returns to start

---

## 🎮 How to Use in Your Code

### Trigger Full Animation
```javascript
import useCamera from './hooks/useCamera';

function MyComponent() {
  const { playFullSequence } = useCamera();
  
  const handleClick = () => {
    playFullSequence(
      { x: 20, y: 5, z: 15 },   // Satellite position
      { x: 10, y: 0, z: 8 },     // Earth target
      () => {                     // Callback when done
        console.log('Animation complete!');
      }
    );
  };
  
  return <button onClick={handleClick}>Animate</button>;
}
```

### Reset Camera
```javascript
const { resetCamera } = useCamera();

<button onClick={resetCamera}>Reset View</button>
```

### Stop Animation
```javascript
const { stopAnimation } = useCamera();

<button onClick={stopAnimation}>Stop</button>
```

---

## 📝 Key Files to Know

### Core Implementation
```
src/
├── hooks/
│   └── useCamera.js              ← Main hook (use this!)
├── components/
│   ├── 3d/
│   │   └── CameraController.jsx  ← Auto-triggers on satellite click
│   └── ui/
│       └── CameraDebugPanel.jsx  ← Testing interface
└── utils/
    └── animations.js             ← Easing functions & presets
```

### Documentation
```
frontend_service/
├── PHASE5_CAMERA_SYSTEM.md       ← Complete API reference
├── PHASE5_SUMMARY.md             ← Implementation summary
├── PHASE5_ARCHITECTURE.md        ← System diagrams
└── PHASE5_QUICKSTART.md          ← This file!
```

---

## 🎯 Common Tasks

### Change Animation Speed
Edit `src/utils/animations.js`:
```javascript
export const cameraPresets = {
  satelliteZoom: {
    duration: 1.5,  // ← Change this (seconds)
    ease: 'power2.inOut',
    fovChange: { from: 45, to: 35 },
  },
  // ... other presets
};
```

### Change Camera Distance
Edit `src/hooks/useCamera.js`:
```javascript
const zoomToSatellite = useCallback((satellitePosition) => {
  const distance = 8;  // ← Change this (units from satellite)
  // ...
});
```

### Change FOV Range
Edit preset in `src/utils/animations.js`:
```javascript
fovChange: { from: 45, to: 35 }  // ← Adjust these values
```

### Disable Auto-Play
Edit `src/components/3d/CameraController.jsx`:
```javascript
// Comment out this effect to disable auto-trigger
/*
useEffect(() => {
  if (selectedSatelliteId) {
    playFullSequence(...);
  }
}, [selectedSatelliteId]);
*/
```

---

## 🐛 Troubleshooting

### Animation Doesn't Play
**Check:**
1. Is debug panel visible? (Only in globe scene)
2. Open browser console - any errors?
3. Are satellites visible in the scene?

**Fix:**
```javascript
// Verify imports
import useCamera from './hooks/useCamera';
import CameraController from './components/3d/CameraController';
```

### Camera Jumps/Jerky
**Check:**
1. Browser FPS (F12 → Performance tab)
2. Are there too many satellites? (reduce count)
3. GPU acceleration enabled?

**Fix:**
```javascript
// Reduce satellite count temporarily
<SatelliteSwarm count={50} />  // instead of 200
```

### FOV Not Changing
**Check:**
1. Is `camera.updateProjectionMatrix()` called?
2. Are you using the correct camera reference?

**Fix:**
```javascript
// In animation, ensure this is called
onUpdate: () => {
  camera.updateProjectionMatrix();  // ← Must have this
}
```

### Debug Panel Not Showing
**Check:**
1. Are you in globe scene? (not loading/map)
2. Is it collapsed? (click to expand)

**Fix:**
```jsx
// In App.jsx, verify this line exists
{currentScene === 'globe' && <CameraDebugPanel />}
```

---

## 💡 Pro Tips

### 1. Console Logging
Watch the console during animation:
```
🎬 Starting full camera sequence...
Step 1: Selection highlight
Step 2: Zooming to satellite
✓ Zoom complete
...
✅ Camera sequence complete!
```

### 2. Test Individual Steps First
Before testing the full sequence, verify each step works:
- Test Step 1 alone
- Test Step 2 alone
- etc.

### 3. Use the Debug Panel
The debug panel is your best friend:
- Test without clicking satellites
- Stop animations mid-flight
- Reset camera position quickly

### 4. Check Performance
Open Performance Monitor:
```
F12 → Performance → Record → Play Animation → Stop
```
Should maintain 60fps throughout.

---

## 🎨 Customization Examples

### Example 1: Faster Animation
```javascript
// In utils/animations.js
export const cameraPresets = {
  satelliteZoom: {
    duration: 0.8,    // was 1.5
    ease: 'power3.out',
    fovChange: { from: 45, to: 30 },
  },
  earthFall: {
    duration: 1.0,    // was 2.0
    ease: 'power4.in',
    fovChange: { from: 30, to: 70 },
  },
  // ... adjust all to taste
};
```

### Example 2: Custom Easing
```javascript
// In utils/animations.js, add your own
export const easings = {
  // ... existing easings
  myCustomEase: (t) => {
    // Your custom easing function
    return t * t * (3 - 2 * t);
  },
};

// Then use it:
gsap.to(camera.position, {
  x: target.x,
  ease: easings.myCustomEase,
});
```

### Example 3: Different Camera Path
```javascript
// Create a new animation function in useCamera.js
const spiralToSatellite = useCallback((satellitePos) => {
  const tl = gsap.timeline();
  
  // Spiral approach instead of direct zoom
  tl.to({}, {
    duration: 2.0,
    ease: 'power2.inOut',
    onUpdate: function() {
      const progress = this.progress();
      const angle = progress * Math.PI * 2;  // Full rotation
      const radius = 50 * (1 - progress);    // Decreasing radius
      
      const spiralPos = {
        x: satellitePos.x + radius * Math.cos(angle),
        y: satellitePos.y,
        z: satellitePos.z + radius * Math.sin(angle),
      };
      
      camera.position.set(spiralPos.x, spiralPos.y, spiralPos.z);
    },
  });
  
  return tl;
}, [camera]);
```

---

## 📚 Next Steps

### Phase 5 Complete ✅
You've successfully implemented the camera animation system!

### What's Next?
1. **Phase 6:** 2D Map Scene integration
2. **Phase 7:** UI Components (satellite info panels)
3. **Phase 8:** Transition effects between scenes

### Production Checklist
Before going live:
- [ ] Remove or disable CameraDebugPanel
- [ ] Connect real satellite TLE positions
- [ ] Add skip animation button
- [ ] Test on mobile devices
- [ ] Verify 60fps on target hardware
- [ ] Add error handling for missing satellites

---

## 🆘 Need Help?

### Documentation
- [PHASE5_CAMERA_SYSTEM.md](./PHASE5_CAMERA_SYSTEM.md) - Full API
- [PHASE5_SUMMARY.md](./PHASE5_SUMMARY.md) - Implementation details
- [PHASE5_ARCHITECTURE.md](./PHASE5_ARCHITECTURE.md) - System diagrams

### External Resources
- [GSAP Docs](https://greensock.com/docs/)
- [Three.js Camera](https://threejs.org/docs/#api/en/cameras/Camera)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)

### Console Debugging
```javascript
// In useCamera.js, add logs:
console.log('Camera position:', camera.position);
console.log('Camera FOV:', camera.fov);
console.log('Timeline progress:', timeline.progress());
```

---

## ✨ Success!

If you can:
- ✅ Click "Play Full Sequence" and see smooth animation
- ✅ Click a satellite and camera animates automatically
- ✅ See console logs for each animation step
- ✅ Reset camera back to starting position

**Then Phase 5 is working perfectly!** 🎉

---

**Happy Coding!** 🚀  
*Phase 5: Camera Transitions & Zoom System*  
*Last Updated: October 5, 2025*
