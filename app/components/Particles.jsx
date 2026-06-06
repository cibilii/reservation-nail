"use client";
import { useCallback, useEffect, useRef } from "react";

// app/components/Particles.jsx


export default function Particles() {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null, radius: 150 });

  const initParticles = useCallback((canvas) => {
    const particles = [];
    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 8000));

    // رنگ‌های بنفش و صورتی
    const purplePinkColors = [
      '236, 72, 153',   // pink-500
      '219, 39, 119',   // pink-600
      '139, 92, 246',   // purple-500
      '124, 58, 237',   // purple-600
      '168, 85, 247',   // purple-400
      '244, 114, 182',  // pink-400
    ];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.4 + 0.3,
        color: purplePinkColors[Math.floor(Math.random() * purplePinkColors.length)],
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let isActive = true;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesRef.current = initParticles(canvas);
    };
    resizeCanvas();

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const animate = () => {
      if (!isActive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < -10 || particle.x > canvas.width + 10) particle.speedX *= -1;
        if (particle.y < -10 || particle.y > canvas.height + 10) particle.speedY *= -1;

        // اثر دور شدن از موس
        if (mouseRef.current.x && mouseRef.current.y) {
          const dx = particle.x - mouseRef.current.x;
          const dy = particle.y - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouseRef.current.radius) {
            const force = (mouseRef.current.radius - distance) / mouseRef.current.radius;
            const angle = Math.atan2(dy, dx);
            particle.x += Math.cos(angle) * force * 1.5;
            particle.y += Math.sin(angle) * force * 1.5;
          }
        }

        // پالس اندازه
        particle.pulse += particle.pulseSpeed;
        const currentSize = particle.size + Math.sin(particle.pulse) * 0.5;

        // رسم گرادیانت دور ذره
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, currentSize * 3
        );
        gradient.addColorStop(0, `rgba(${particle.color}, ${particle.opacity})`);
        gradient.addColorStop(0.5, `rgba(${particle.color}, ${particle.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${particle.color}, 0)`);

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentSize * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // هسته ذره
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity + 0.2})`;
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      isActive = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: 'transparent' }}
      aria-hidden="true"
    />
  );
}