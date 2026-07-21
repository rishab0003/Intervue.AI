import React, { useEffect, useRef } from 'react';

export const ParticleMesh = ({ count = 35, className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2 + 1,
      });
    }

    let mouse = { x: null, y: null };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse attraction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            p.x += dx * 0.003;
            p.y += dy * 0.003;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.18)';
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [count]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      <style>{`
        @keyframes float-slow-1 {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(60px, -80px) scale(1.15); }
          66% { transform: translate(-40px, 40px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float-slow-2 {
          0% { transform: translate(0px, 0px) scale(1.1); }
          50% { transform: translate(-70px, 50px) scale(0.85); }
          100% { transform: translate(0px, 0px) scale(1.1); }
        }
        @keyframes float-slow-3 {
          0% { transform: translate(0px, 0px) scale(0.95); }
          50% { transform: translate(50px, 60px) scale(1.1); }
          100% { transform: translate(0px, 0px) scale(0.95); }
        }
      `}</style>

      {/* 1. iOS Aura Glassmorphic Glow Blobs */}
      <div 
        className="absolute top-1/4 left-1/4 w-[35vw] h-[35vw] rounded-full mix-blend-multiply filter blur-[120px] opacity-[0.14] dark:opacity-[0.09]"
        style={{
          background: 'radial-gradient(circle, #6366F1 0%, rgba(99,102,241,0) 70%)',
          animation: 'float-slow-1 25s infinite ease-in-out',
        }}
      />
      <div 
        className="absolute top-1/2 right-1/4 w-[40vw] h-[40vw] rounded-full mix-blend-multiply filter blur-[140px] opacity-[0.09] dark:opacity-[0.07]"
        style={{
          background: 'radial-gradient(circle, #10B981 0%, rgba(16,185,129,0) 70%)',
          animation: 'float-slow-2 30s infinite ease-in-out',
        }}
      />
      <div 
        className="absolute bottom-1/4 left-1/3 w-[30vw] h-[30vw] rounded-full mix-blend-multiply filter blur-[110px] opacity-[0.11] dark:opacity-[0.08]"
        style={{
          background: 'radial-gradient(circle, #F59E0B 0%, rgba(245,158,11,0) 70%)',
          animation: 'float-slow-3 22s infinite ease-in-out',
        }}
      />

      {/* 2. Technical Telemetry Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '54px 54px',
        }}
      />

      {/* 3. Constellation Face-Mesh Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default ParticleMesh;
