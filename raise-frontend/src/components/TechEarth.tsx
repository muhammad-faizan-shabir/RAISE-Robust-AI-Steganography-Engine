'use client';

import { useEffect, useRef } from 'react';

export default function TechEarth() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1400;
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 600;
    let rotation = 0;

    const isabelline = '#f2efe9';

    const drawLatitude = (lat: number) => {
      const y = Math.sin(lat) * radius;
      const r = Math.cos(lat) * radius;
      
      ctx.beginPath();
      for (let lon = 0; lon <= Math.PI * 2; lon += 0.1) {
        const x = Math.cos(lon + rotation) * r;
        const z = Math.sin(lon + rotation) * r;
        const visible = z > 0;
        const screenX = centerX + x;
        const screenY = centerY + y;
        
        if (lon === 0) ctx.moveTo(screenX, screenY);
        else ctx.lineTo(screenX, screenY);
        
        ctx.globalAlpha = visible ? 0.7 : 0.25;
      }
      ctx.strokeStyle = isabelline;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    };

    const drawLongitude = (lon: number) => {
      ctx.beginPath();
      for (let lat = -Math.PI / 2; lat <= Math.PI / 2; lat += 0.05) {
        const y = Math.sin(lat) * radius;
        const r = Math.cos(lat) * radius;
        const x = Math.cos(lon + rotation) * r;
        const z = Math.sin(lon + rotation) * r;
        const screenX = centerX + x;
        const screenY = centerY + y;
        
        if (lat === -Math.PI / 2) ctx.moveTo(screenX, screenY);
        else ctx.lineTo(screenX, screenY);
        
        ctx.globalAlpha = z > 0 ? 0.7 : 0.25;
      }
      ctx.strokeStyle = isabelline;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    };

    const drawParticles = () => {
      const particleCount = 180;
      for (let i = 0; i < particleCount; i++) {
        const theta = (i / particleCount) * Math.PI * 2 + rotation * 0.5;
        const phi = Math.acos(2 * (i / particleCount) - 1);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        const screenX = centerX + x * Math.cos(rotation) - z * Math.sin(rotation);
        const screenY = centerY + y;
        const depth = x * Math.sin(rotation) + z * Math.cos(rotation);
        
        ctx.globalAlpha = depth > 0 ? 0.9 : 0.35;
        ctx.fillStyle = isabelline;
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawGlow = () => {
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 1.4);
      gradient.addColorStop(0, 'rgba(144, 78, 85, 0)');
      gradient.addColorStop(1, 'rgba(144, 78, 85, 0.35)');
      
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, size, size);
      drawGlow();
      for (let i = 0; i < 14; i++) drawLatitude(-Math.PI / 2 + (i / 13) * Math.PI);
      for (let i = 0; i < 24; i++) drawLongitude((i / 24) * Math.PI * 2);
      drawParticles();
      rotation += 0.003;
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full max-w-full h-auto"
      data-testid="canvas-tech-earth"
    />
  );
}

