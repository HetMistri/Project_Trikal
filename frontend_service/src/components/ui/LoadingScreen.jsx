import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import './LoadingScreen.css';

/**
 * LoadingScreen Component
 * Immersive loading screen with particle effects, progress animation, and glitch effects
 */
const LoadingScreen = ({ progress, onComplete }) => {
  const canvasRef = useRef(null);
  const counterRef = useRef(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showGlitch, setShowGlitch] = useState(false);
  const particlesRef = useRef([]);

  // Initialize particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles
    const particleCount = 100;
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    // Animation loop
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 243, 255, ${particle.opacity})`;
        ctx.fill();

        // Draw connections to nearby particles
        particlesRef.current.forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `rgba(0, 243, 255, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Animate progress counter with smooth counting
  useEffect(() => {
    if (counterRef.current) {
      const element = counterRef.current;
      const start = parseInt(element.textContent) || 0;
      const end = progress;
      const duration = 500;
      const startTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const fraction = Math.min(elapsed / duration, 1);
        
        // Easing function (easeOutExpo)
        const eased = fraction === 1 ? 1 : 1 - Math.pow(2, -10 * fraction);
        const current = Math.round(start + (end - start) * eased);
        
        element.textContent = current;
        
        if (fraction < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [progress]);

  // Handle completion
  useEffect(() => {
    if (progress >= 100 && !isComplete) {
      setIsComplete(true);
      
      // Trigger glitch effect
      setShowGlitch(true);
      setTimeout(() => setShowGlitch(false), 600);

      // Fade out after glitch using CSS transition
      setTimeout(() => {
        const element = document.querySelector('.loading-screen');
        if (element) {
          element.style.transition = 'opacity 1s ease-in';
          element.style.opacity = '0';
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 1000);
        }
      }, 800);
    }
  }, [progress, isComplete, onComplete]);

  return (
    <div className="loading-screen">
      <canvas ref={canvasRef} className="particle-canvas" />
      
      <div className="loading-content">
        {/* Brand/Logo */}
        <div className={`brand-container ${showGlitch ? 'glitch' : ''}`}>
          <h1 className="brand-title" data-text="HIMALAYAN SENTINEL">
            HIMALAYAN SENTINEL
          </h1>
          <div className="brand-subtitle">
            Earth Observation System
          </div>
        </div>

        {/* Progress Container */}
        <div className="progress-container">
          {/* Progress Bar */}
          <div className="progress-bar-wrapper">
            <div 
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
            <div className="progress-bar-glow" style={{ width: `${progress}%` }} />
          </div>

          {/* Counter */}
          <div className="counter-container">
            <span ref={counterRef} className="counter-value">0</span>
            <span className="counter-percent">%</span>
          </div>

          {/* Loading Text */}
          <div className="loading-text">
            {progress < 30 && 'Initializing Systems...'}
            {progress >= 30 && progress < 60 && 'Loading Satellite Data...'}
            {progress >= 60 && progress < 90 && 'Preparing 3D Environment...'}
            {progress >= 90 && progress < 100 && 'Almost Ready...'}
            {progress >= 100 && 'Complete!'}
          </div>
        </div>

        {/* Scanlines Effect */}
        <div className="scanlines" />
      </div>
    </div>
  );
};

LoadingScreen.propTypes = {
  progress: PropTypes.number.isRequired,
  onComplete: PropTypes.func,
};

export default LoadingScreen;
