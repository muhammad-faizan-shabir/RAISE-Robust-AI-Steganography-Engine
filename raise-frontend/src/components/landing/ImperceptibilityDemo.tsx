"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const ImperceptibilityDemo = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [binaryMatrix, setBinaryMatrix] = useState<string[][]>([]);

  useEffect(() => {
    // Generate binary matrix only on client side to avoid hydration issues
    const matrix = Array.from({ length: 50 }).map(() =>
      Array.from({ length: 200 }).map(() => (Math.random() > 0.5 ? '1' : '0'))
    );
    setBinaryMatrix(matrix);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="container mx-auto px-8 md:px-12 lg:px-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-6">
            <span className="text-xs font-medium text-foreground/80 tracking-wide">
              {'>'}99% Imperceptibility
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              Hiding in Plain Sight
            </span>
          </h2>
          
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Our GAN-based steganography is completely imperceptible to the human eye. 
            Drag the slider to compare—the images are identical.
          </p>
        </motion.div>

        {/* Image Comparison Slider */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div
            className="relative aspect-video rounded-2xl border border-white/10 overflow-hidden cursor-ew-resize select-none bg-gradient-to-br from-primary/5 to-accent/5"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={handleTouchMove}
          >
            {/* Base Image (Original) */}
            <div className="absolute inset-0">
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                {/* Abstract geometric pattern */}
                <svg className="w-full h-full opacity-30" viewBox="0 0 800 600">
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'rgb(139, 92, 246)', stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.8 }} />
                    </linearGradient>
                  </defs>
                  <circle cx="200" cy="200" r="150" fill="url(#grad1)" opacity="0.3" />
                  <circle cx="600" cy="400" r="120" fill="url(#grad1)" opacity="0.4" />
                  <rect x="300" y="150" width="200" height="200" fill="url(#grad1)" opacity="0.2" transform="rotate(45 400 250)" />
                </svg>
              </div>
              
              {/* Label */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 backdrop-blur-md">
                <span className="text-xs font-medium text-white">Original</span>
              </div>
            </div>

            {/* Overlay Image (Stego) with Data Layer */}
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              {/* Same Image */}
              <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <svg className="w-full h-full opacity-30" viewBox="0 0 800 600">
                  <defs>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'rgb(139, 92, 246)', stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.8 }} />
                    </linearGradient>
                  </defs>
                  <circle cx="200" cy="200" r="150" fill="url(#grad2)" opacity="0.3" />
                  <circle cx="600" cy="400" r="120" fill="url(#grad2)" opacity="0.4" />
                  <rect x="300" y="150" width="200" height="200" fill="url(#grad2)" opacity="0.2" transform="rotate(45 400 250)" />
                </svg>
              </div>

              {/* Data Layer Overlay */}
              <div 
                className="absolute inset-0 bg-primary/5 backdrop-blur-[1px]"
                style={{ 
                  opacity: Math.min(sliderPosition / 50, 0.6),
                  transition: 'opacity 0.2s ease-out'
                }}
              >
                {/* Matrix-style data visualization */}
                {binaryMatrix.length > 0 && (
                  <div className="absolute inset-0 overflow-hidden opacity-40 font-mono text-[8px] leading-3 text-primary/60 select-none pointer-events-none">
                    {binaryMatrix.map((row, i) => (
                      <div key={i} className="whitespace-nowrap">
                        {row.map((digit, j) => (
                          <span key={j}>{digit}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 backdrop-blur-md">
                <span className="text-xs font-medium text-primary">Stego Image</span>
              </div>
            </div>

            {/* Slider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-accent to-primary"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-primary bg-background shadow-lg shadow-primary/30 flex items-center justify-center">
                <div className="flex gap-0.5">
                  <div className="w-0.5 h-4 bg-primary rounded-full" />
                  <div className="w-0.5 h-4 bg-primary rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="text-2xl font-bold text-primary mb-1">0 LSB</div>
              <div className="text-xs text-foreground/60">Least Significant Bits Modified</div>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="text-2xl font-bold text-accent mb-1">99.8%</div>
              <div className="text-xs text-foreground/60">Structural Similarity (SSIM)</div>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="text-2xl font-bold text-foreground mb-1">45 dB</div>
              <div className="text-xs text-foreground/60">Peak Signal-to-Noise Ratio</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px] -z-10" />
    </section>
  );
};
