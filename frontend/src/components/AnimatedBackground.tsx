import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    theme
  } = useTheme();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const particles: Particle[] = [];
    const particleCount = 50;
    // Set canvas to full screen
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        opacity: Math.random() * 0.5 + 0.1
      });
    }
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // Update position
        p.x += p.speedX;
        p.y += p.speedY;
        // Wrap around edges
        if (p.x > canvas.width) p.x = 0;
        if (p.x < 0) p.x = canvas.width;
        if (p.y > canvas.height) p.y = 0;
        if (p.y < 0) p.y = canvas.height;
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        // Set color based on theme
        if (theme === 'dark') {
          ctx.fillStyle = `rgba(59, 130, 246, ${p.opacity})`;
        } else {
          ctx.fillStyle = `rgba(37, 99, 235, ${p.opacity})`;
        }
        ctx.fill();
      }
      // Connect particles with lines if they're close enough
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            // Set line color based on theme
            if (theme === 'dark') {
              ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - distance / 100)})`;
            } else {
              ctx.strokeStyle = `rgba(37, 99, 235, ${0.1 * (1 - distance / 100)})`;
            }
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    };
    const animationId = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [theme]);
  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />;
};
interface Particle {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  opacity: number;
}
export default AnimatedBackground;