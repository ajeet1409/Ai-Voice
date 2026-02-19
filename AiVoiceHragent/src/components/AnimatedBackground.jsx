/**
 * AnimatedBackground Component
 * 
 * Creates an animated particle background effect using HTML5 Canvas
 * Features:
 * - Floating particles with random movement
 * - Mouse interaction (particles move away from cursor)
 * - Gradient overlay effects
 * - Responsive to window resize
 * 
 * @param {Object} canvasRef - React ref for the canvas element
 * @param {Object} styles - Style object
 */

import React, { useEffect } from 'react';

const AnimatedBackground = ({ canvasRef, styles }) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    /**
     * Set canvas size to match window dimensions
     */
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    /**
     * Particle class for animated background elements
     */
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      /**
       * Update particle position
       */
      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen edges
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      /**
       * Draw particle on canvas
       */
      draw() {
        ctx.fillStyle = `rgba(96, 165, 250, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /**
     * Initialize particles array
     */
    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    /**
     * Animation loop
     */
    const animate = () => {
      // Clear canvas with slight trail effect
      ctx.fillStyle = 'rgba(3, 7, 18, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw all particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections between nearby particles
      particles.forEach((particleA, indexA) => {
        particles.slice(indexA + 1).forEach(particleB => {
          const dx = particleA.x - particleB.x;
          const dy = particleA.y - particleB.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = `rgba(96, 165, 250, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particleA.x, particleA.y);
            ctx.lineTo(particleB.x, particleB.y);
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    /**
     * Handle mouse movement - particles react to cursor
     */
    const handleMouseMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      particles.forEach(particle => {
        const dx = particle.x - mouseX;
        const dy = particle.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          const angle = Math.atan2(dy, dx);
          const force = (100 - distance) / 100;
          particle.x += Math.cos(angle) * force * 2;
          particle.y += Math.sin(angle) * force * 2;
        }
      });
    };

    // Initialize
    resizeCanvas();
    initParticles();
    animate();

    // Event listeners
    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });
    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [canvasRef]);

  return (
    <>
      {/* Canvas for particle animation */}
      <canvas ref={canvasRef} style={styles.canvas} />
      
      {/* Gradient overlays for visual depth */}
      <div style={styles.gradientOverlay} />
      <div style={styles.mouseGradient} />
    </>
  );
};

export default AnimatedBackground;

