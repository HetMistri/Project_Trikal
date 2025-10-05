import { animate as anime } from 'animejs';
import gsap from 'gsap';

/**
 * Animation Utilities
 * Helper functions for creating smooth animations using Anime.js and GSAP
 */

// ============= ANIME.JS HELPERS =============

/**
 * Animate a counter from 0 to target value
 * @param {Object} target - Object with value property to animate
 * @param {number} endValue - Target value
 * @param {number} duration - Duration in ms
 * @param {Function} onUpdate - Callback on each frame
 */
export const animateCounter = (target, endValue, duration = 2000, onUpdate) => {
  return anime({
    targets: target,
    value: endValue,
    duration: duration,
    easing: 'easeOutExpo',
    update: onUpdate,
  });
};

/**
 * Create a stagger animation for multiple elements
 * @param {string} selector - CSS selector
 * @param {Object} properties - Properties to animate
 * @param {number} delay - Stagger delay
 */
export const staggerAnimation = (selector, properties, delay = 100) => {
  return anime({
    targets: selector,
    ...properties,
    delay: anime.stagger(delay),
    easing: 'easeOutCubic',
  });
};

/**
 * Create a glitch effect animation
 * @param {string} selector - CSS selector
 * @param {number} duration - Duration in ms
 */
export const glitchEffect = (selector, duration = 300) => {
  const timeline = anime.timeline({
    duration: duration,
  });

  timeline
    .add({
      targets: selector,
      translateX: [
        { value: -5, duration: 50 },
        { value: 5, duration: 50 },
        { value: -5, duration: 50 },
        { value: 0, duration: 50 },
      ],
      easing: 'easeInOutQuad',
    })
    .add({
      targets: selector,
      opacity: [
        { value: 0.5, duration: 50 },
        { value: 1, duration: 50 },
      ],
      easing: 'linear',
    }, 0);

  return timeline;
};

/**
 * Fade in animation
 * @param {string} selector - CSS selector
 * @param {number} duration - Duration in ms
 */
export const fadeIn = (selector, duration = 1000) => {
  return anime({
    targets: selector,
    opacity: [0, 1],
    duration: duration,
    easing: 'easeOutQuad',
  });
};

/**
 * Fade out animation
 * @param {string} selector - CSS selector
 * @param {number} duration - Duration in ms
 */
export const fadeOut = (selector, duration = 1000) => {
  return anime({
    targets: selector,
    opacity: [1, 0],
    duration: duration,
    easing: 'easeInQuad',
  });
};

/**
 * Particle burst animation
 * @param {Array} particles - Array of particle objects
 * @param {Object} origin - Origin point {x, y, z}
 */
export const particleBurst = (particles, origin = { x: 0, y: 0, z: 0 }) => {
  return anime({
    targets: particles,
    translateX: (el, i) => {
      return anime.random(-100, 100);
    },
    translateY: (el, i) => {
      return anime.random(-100, 100);
    },
    translateZ: (el, i) => {
      return anime.random(-100, 100);
    },
    opacity: [1, 0],
    scale: [1, 0],
    duration: 2000,
    easing: 'easeOutExpo',
  });
};

// ============= GSAP HELPERS =============

/**
 * Camera animation using GSAP
 * @param {Object} camera - Three.js camera
 * @param {Object} target - Target position {x, y, z}
 * @param {number} duration - Duration in seconds
 * @param {Function} onComplete - Callback on completion
 */
export const animateCamera = (camera, target, duration = 2, onComplete) => {
  return gsap.to(camera.position, {
    x: target.x,
    y: target.y,
    z: target.z,
    duration: duration,
    ease: 'power2.inOut',
    onComplete: onComplete,
  });
};

/**
 * Camera look-at animation
 * @param {Object} controls - Camera controls
 * @param {Object} target - Target to look at {x, y, z}
 * @param {number} duration - Duration in seconds
 */
export const animateCameraLookAt = (controls, target, duration = 2) => {
  return gsap.to(controls.target, {
    x: target.x,
    y: target.y,
    z: target.z,
    duration: duration,
    ease: 'power2.inOut',
  });
};

/**
 * Create a GSAP timeline for complex sequences
 * @returns {gsap.timeline} GSAP timeline instance
 */
export const createTimeline = () => {
  return gsap.timeline();
};

/**
 * Smooth scroll animation
 * @param {number} targetY - Target scroll position
 * @param {number} duration - Duration in seconds
 */
export const smoothScroll = (targetY, duration = 1) => {
  return gsap.to(window, {
    scrollTo: targetY,
    duration: duration,
    ease: 'power2.inOut',
  });
};

// ============= EASING FUNCTIONS =============

/**
 * Custom easing functions
 */
export const easings = {
  // Smooth ease in-out
  smooth: (t) => t * t * (3 - 2 * t),
  
  // Cinematic ease
  cinematic: (t) => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },
  
  // Elastic ease out
  elasticOut: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  
  // Bounce ease out
  bounceOut: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
};

/**
 * Lerp (Linear Interpolation)
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 */
export const lerp = (start, end, t) => {
  return start * (1 - t) + end * t;
};

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 */
export const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Map a value from one range to another
 * @param {number} value - Input value
 * @param {number} inMin - Input range minimum
 * @param {number} inMax - Input range maximum
 * @param {number} outMin - Output range minimum
 * @param {number} outMax - Output range maximum
 */
export const mapRange = (value, inMin, inMax, outMin, outMax) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

export default {
  animateCounter,
  staggerAnimation,
  glitchEffect,
  fadeIn,
  fadeOut,
  particleBurst,
  animateCamera,
  animateCameraLookAt,
  createTimeline,
  smoothScroll,
  easings,
  lerp,
  clamp,
  mapRange,
};
