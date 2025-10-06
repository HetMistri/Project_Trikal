# Real Satellite Tracking System 🛰️

## Overview
The application now displays **100+ real satellites** with actual orbital trajectories calculated from TLE (Two-Line Element) data.

## Features

### 1. Real-Time Satellite Data
- Fetches live TLE data from **CelesTrak** (public satellite tracking database)
- Supports multiple satellite groups:
  - `active`: All active satellites (~2000+)
  - `starlink`: SpaceX Starlink constellation
  - `stations`: ISS and space stations
  - `weather`: Weather satellites
  - `gps-ops`: GPS satellites
  - `visual`: Brightest visible satellites

### 2. Accurate Orbital Mechanics
- Uses `satellite.js` library for precise calculations
- Converts TLE data to ECI (Earth-Centered Inertial) coordinates
- Updates positions in real-time based on current date/time
- Accounts for:
  - Orbital altitude
  - Inclination
  - Eccentricity
  - Mean motion
  - Right ascension

### 3. Performance Optimization
- **Instanced Rendering**: All satellites rendered in a single draw call
- Handles 100+ satellites at 60 FPS
- Efficient position updates using `useFrame`
- Caches satellite data (1-hour refresh)

### 4. Easter Egg 🎮
- One random satellite is rendered as a **Pokéball**
- Appears red instead of blue
- Special console message when clicked
- Changes position each time you reload

## How to Use

### Change Satellite Count
In `GlobeScene.jsx`:
```jsx
<SatelliteSwarm 
  count={150}  // Change this number (10-500 recommended)
  onSatelliteClick={handleSatelliteClick}
/>
```

### Change Satellite Group
In `src/utils/satelliteData.js`, modify line 23:
```javascript
// Current (active satellites)
const response = await fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle');

// Change to Starlink
const response = await fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle');

// Change to ISS + Space Stations
const response = await fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle');
```

### Available Groups
| Group | Description | Count |
|-------|-------------|-------|
| `active` | All active satellites | ~2000+ |
| `starlink` | SpaceX Starlink | ~5000+ |
| `stations` | Space stations (ISS, Tiangong) | ~10 |
| `weather` | Weather satellites | ~100 |
| `gps-ops` | GPS satellites | ~30 |
| `visual` | Brightest satellites | ~100 |

## Technical Details

### TLE Data Format
```
SATELLITE NAME
1 NNNNNC NNNNNAAA NNNNN.NNNNNNNN  .NNNNNNNN  NNNNN-N  NNNNN-N N NNNNN
2 NNNNN NNN.NNNN NNN.NNNN NNNNNNN NNN.NNNN NNN.NNNN NN.NNNNNNNNNNNNNN
```

### Coordinate Conversion
1. TLE → `satrec` (Satellite Record)
2. `satrec` → ECI coordinates (x, y, z in km)
3. ECI → Scene coordinates (scaled by /100)

### Performance Tips
- **10-50 satellites**: Smooth on all devices
- **50-200 satellites**: Good on desktop/gaming laptops
- **200-500 satellites**: Requires powerful GPU
- **500+ satellites**: May cause lag, use with caution

## Troubleshooting

### No satellites appearing?
1. Check browser console for fetch errors
2. CelesTrak might be down - wait and refresh
3. Falls back to mock data automatically

### Satellites not moving?
1. Check if TLE data loaded successfully
2. Verify `useFrame` is running (check console)
3. Date/time calculation might be failing

### Performance issues?
1. Reduce satellite count: `count={50}`
2. Increase sphere LOD: Change `args={[0.15, 8, 8]}` to `args={[0.15, 4, 4]}`
3. Disable emissive glow in `SatelliteSwarm.jsx`

## API Credits
- **CelesTrak**: https://celestrak.org/
- Free public TLE data
- No API key required
- Updates multiple times per day

## Next Steps
- [ ] Add satellite name labels (Phase 7 - UI Components)
- [ ] Filter by satellite type/group
- [ ] Show orbital paths as lines
- [ ] Display satellite info on click
- [ ] Track specific satellite (camera follow)
- [ ] Show ground track on map view (Phase 6)

---

**Current Status**: ✅ Phase 4 Complete - Real satellite tracking with 100+ satellites!
