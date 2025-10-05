/**
 * Custom Shaders for Three.js
 * GLSL shaders for atmosphere glow, particles, and effects
 */

// ============= ATMOSPHERE GLOW SHADER =============

export const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragmentShader = `
  uniform vec3 glowColor;
  uniform float glowIntensity;
  uniform float glowPower;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Calculate intensity based on viewing angle
    float intensity = pow(glowIntensity - dot(vNormal, vec3(0.0, 0.0, 1.0)), glowPower);
    
    // Apply glow color with intensity
    vec3 glow = glowColor * intensity;
    
    gl_FragColor = vec4(glow, intensity);
  }
`;

// ============= PARTICLE SHADER =============

export const particleVertexShader = `
  attribute float size;
  attribute vec3 customColor;
  
  varying vec3 vColor;
  
  void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const particleFragmentShader = `
  uniform sampler2D pointTexture;
  
  varying vec3 vColor;
  
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
    gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
  }
`;

// ============= STAR FIELD SHADER =============

export const starVertexShader = `
  attribute float size;
  attribute float twinkle;
  
  varying float vTwinkle;
  
  void main() {
    vTwinkle = twinkle;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const starFragmentShader = `
  uniform float time;
  
  varying float vTwinkle;
  
  void main() {
    // Create circular points
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    
    if (dist > 0.5) {
      discard;
    }
    
    // Twinkle effect
    float twinkleEffect = 0.5 + 0.5 * sin(time * vTwinkle);
    float alpha = (1.0 - dist * 2.0) * twinkleEffect;
    
    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
  }
`;

// ============= HOLOGRAPHIC SHADER =============

export const holographicVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const holographicFragmentShader = `
  uniform float time;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform float scanlineIntensity;
  uniform float scanlineSpeed;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  
  void main() {
    // Base color interpolation
    vec3 baseColor = mix(color1, color2, vUv.y);
    
    // Scanlines
    float scanline = sin(vUv.y * 100.0 + time * scanlineSpeed) * scanlineIntensity;
    
    // Fresnel effect
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.0);
    
    // Combine effects
    vec3 finalColor = baseColor + vec3(scanline) + vec3(fresnel * 0.3);
    float alpha = 0.6 + fresnel * 0.4;
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

// ============= GRID SHADER (for HUD elements) =============

export const gridVertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const gridFragmentShader = `
  uniform float time;
  uniform vec3 gridColor;
  uniform float gridScale;
  uniform float lineWidth;
  
  varying vec2 vUv;
  
  void main() {
    vec2 grid = abs(fract(vUv * gridScale - 0.5) - 0.5) / fwidth(vUv * gridScale);
    float line = min(grid.x, grid.y);
    
    float alpha = 1.0 - min(line, 1.0);
    
    // Pulse effect
    float pulse = 0.5 + 0.5 * sin(time * 2.0);
    alpha *= (0.3 + pulse * 0.2);
    
    gl_FragColor = vec4(gridColor, alpha * lineWidth);
  }
`;

// ============= ENERGY BEAM SHADER =============

export const energyBeamVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const energyBeamFragmentShader = `
  uniform float time;
  uniform vec3 beamColor;
  uniform float intensity;
  uniform float speed;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    // Moving energy effect
    float energy = sin(vUv.y * 10.0 - time * speed) * 0.5 + 0.5;
    
    // Glow from center
    float glow = 1.0 - abs(vUv.x - 0.5) * 2.0;
    
    // Combine effects
    vec3 color = beamColor * energy * glow * intensity;
    float alpha = glow * intensity;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

// ============= SHADER UNIFORMS PRESETS =============

export const atmosphereUniforms = {
  glowColor: { value: [0, 0.95, 1] }, // Cyan glow
  glowIntensity: { value: 1.0 },
  glowPower: { value: 3.0 },
};

export const holographicUniforms = {
  time: { value: 0 },
  color1: { value: [0, 0.95, 1] }, // Electric blue
  color2: { value: [0.72, 0, 1] }, // Neon purple
  scanlineIntensity: { value: 0.1 },
  scanlineSpeed: { value: 2.0 },
};

export const gridUniforms = {
  time: { value: 0 },
  gridColor: { value: [0, 0.95, 1] },
  gridScale: { value: 10.0 },
  lineWidth: { value: 0.8 },
};

export const energyBeamUniforms = {
  time: { value: 0 },
  beamColor: { value: [0, 0.95, 1] },
  intensity: { value: 1.0 },
  speed: { value: 3.0 },
};

/**
 * Update shader uniforms with time
 * @param {Object} uniforms - Shader uniforms object
 * @param {number} deltaTime - Time elapsed since last frame
 */
export const updateShaderTime = (uniforms, deltaTime) => {
  if (uniforms.time) {
    uniforms.time.value += deltaTime;
  }
};

export default {
  atmosphereVertexShader,
  atmosphereFragmentShader,
  particleVertexShader,
  particleFragmentShader,
  starVertexShader,
  starFragmentShader,
  holographicVertexShader,
  holographicFragmentShader,
  gridVertexShader,
  gridFragmentShader,
  energyBeamVertexShader,
  energyBeamFragmentShader,
  atmosphereUniforms,
  holographicUniforms,
  gridUniforms,
  energyBeamUniforms,
  updateShaderTime,
};
