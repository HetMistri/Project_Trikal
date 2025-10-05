import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useAppStore from '../store/appStore';
import './LandingPage.css';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const setScene = useAppStore((state) => state.setScene);
  const setTransitioning = useAppStore((state) => state.setTransitioning);
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const hero = heroRef.current;
    const features = featuresRef.current;
    const cta = ctaRef.current;

    // Hero section animation
    gsap.fromTo(
      hero.querySelectorAll('.hero-text > *'),
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out',
      }
    );

    // Features scroll animation
    gsap.fromTo(
      features.querySelectorAll('.feature-card'),
      { y: 80, opacity: 0, scale: 0.9 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: features,
          start: 'top 80%',
          end: 'bottom 20%',
        },
      }
    );

    // CTA section animation
    gsap.fromTo(
      cta.querySelectorAll('.cta-content > *'),
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cta,
          start: 'top 70%',
        },
      }
    );

    // Parallax background
    gsap.to('.hero-bg', {
      yPercent: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleLaunch = () => {
    setTransitioning(true);
    
    // Launch animation
    gsap.to(containerRef.current, {
      scale: 0.9,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in',
      onComplete: () => {
        setScene('3d-earth');
        setTransitioning(false);
      },
    });
  };

  return (
    <div className="landing-page" ref={containerRef}>
      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Project Trikla</h1>
            <p className="hero-subtitle">Advanced Area Analysis Through Space</p>
            <p className="hero-description">
              Harness the power of SAR satellites to analyze any location on Earth. 
              Get comprehensive reports on terrain, infrastructure, and environmental data.
            </p>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="scroll-line"></div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" ref={featuresRef}>
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Select Satellite</h3>
              <p>Choose from live SAR satellites orbiting Earth in real-time</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Pick Location</h3>
              <p>Select any area on our Apple Maps-style interface</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Get Analysis</h3>
              <p>Receive comprehensive reports with detailed insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" ref={ctaRef}>
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Explore?</h2>
            <p>Launch into the future of satellite-powered area analysis</p>
            <button className="launch-button" onClick={handleLaunch}>
              <span>Launch Mission</span>
              <div className="button-glow"></div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;