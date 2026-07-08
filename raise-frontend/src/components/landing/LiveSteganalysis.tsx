"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Activity } from "lucide-react";

type AnalysisState = "running" | "passed" | "idle";

export const LiveSteganalysis = () => {
  const [stegExposeState, setStegExposeState] = useState<AnalysisState>("idle");
  const [aletheiaState, setAletheiaState] = useState<AnalysisState>("idle");
  const [scanPosition, setScanPosition] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Start scanning animation
    setIsScanning(true);
    
    // Animate scan line
    const scanInterval = setInterval(() => {
      setScanPosition((prev) => (prev >= 100 ? 0 : prev + 0.5));
    }, 20);

    // StegExpose simulation
    const stegExposeTimer = setTimeout(() => {
      setStegExposeState("running");
      setTimeout(() => setStegExposeState("passed"), 2000);
    }, 1000);

    // Aletheia simulation
    const aletheiaTimer = setTimeout(() => {
      setAletheiaState("running");
      setTimeout(() => setAletheiaState("passed"), 2000);
    }, 3500);

    return () => {
      clearInterval(scanInterval);
      clearTimeout(stegExposeTimer);
      clearTimeout(aletheiaTimer);
    };
  }, []);

  const StatusIcon = ({ state }: { state: AnalysisState }) => {
    if (state === "running") return <Activity className="h-4 w-4 text-accent animate-spin" />;
    if (state === "passed") return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-foreground/20" />;
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
              Steganalysis Test
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              Battle-Tested.
            </span>
            <br />
            <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
              Detection-Proof.
            </span>
          </h2>
          
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Watch RAISE evade industry-standard steganalysis tools in real-time
          </p>
        </motion.div>

        {/* Scanner Component */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-5xl mx-auto"
        >
          <div className="grid lg:grid-cols-[1fr,300px] gap-8 items-center">
            {/* Image with Scanner */}
            <div className="relative aspect-video rounded-2xl border border-white/10 overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
              {/* Abstract placeholder image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-full h-full opacity-40" viewBox="0 0 800 600">
                  <defs>
                    <linearGradient id="scanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'rgb(139, 92, 246)', stopOpacity: 0.6 }} />
                      <stop offset="100%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.6 }} />
                    </linearGradient>
                  </defs>
                  <circle cx="400" cy="300" r="180" fill="url(#scanGrad)" opacity="0.4" />
                  <circle cx="250" cy="200" r="120" fill="url(#scanGrad)" opacity="0.3" />
                  <circle cx="550" cy="400" r="100" fill="url(#scanGrad)" opacity="0.35" />
                  <rect x="200" y="150" width="400" height="300" fill="url(#scanGrad)" opacity="0.15" rx="10" />
                </svg>
              </div>

              {/* Grid Overlay */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '2rem 2rem',
                }}
              />

              {/* Scanning Line */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div
                    className="absolute left-0 right-0 h-1 shadow-[0_0_20px_rgba(191,180,143,0.8)]"
                    style={{
                      top: `${scanPosition}%`,
                      background: 'linear-gradient(90deg, transparent, hsl(var(--accent)), transparent)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </AnimatePresence>

              {/* Corner Brackets */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-accent/50" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-accent/50" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-accent/50" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-accent/50" />
            </div>

            {/* HUD Panel */}
            <div className="relative">
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4">
                {/* Header */}
                <div className="pb-3 border-b border-white/10">
                  <h3 className="text-sm font-semibold text-foreground mb-1">Analysis Status</h3>
                  <p className="text-xs text-foreground/40 font-mono">Real-time detection</p>
                </div>

                {/* StegExpose Test */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-foreground/60">StegExpose</span>
                    <StatusIcon state={stegExposeState} />
                  </div>
                  <AnimatePresence mode="wait">
                    {stegExposeState === "running" && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="text-xs text-foreground/40 font-mono"
                      >
                        Running analysis...
                      </motion.div>
                    )}
                    {stegExposeState === "passed" && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xs font-mono"
                      >
                        <span className="text-green-500">✓ PASSED</span>
                        <br />
                        <span className="text-foreground/40">Detection Prob: 0.01%</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Aletheia Test */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-foreground/60">Aletheia</span>
                    <StatusIcon state={aletheiaState} />
                  </div>
                  <AnimatePresence mode="wait">
                    {aletheiaState === "running" && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="text-xs text-foreground/40 font-mono"
                      >
                        Running analysis...
                      </motion.div>
                    )}
                    {aletheiaState === "passed" && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xs font-mono"
                      >
                        <span className="text-green-500">✓ PASSED</span>
                        <br />
                        <span className="text-foreground/40">Status: Clean</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Verdict */}
                {stegExposeState === "passed" && aletheiaState === "passed" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="pt-3 border-t border-white/10"
                  >
                    <div className="text-xs font-mono text-foreground/60 mb-2">
                      Analysis Verdict:
                    </div>
                    <div className="text-lg font-bold text-accent">
                      UNDETECTABLE
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-foreground/40">System secure</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Glow effect */}
              {stegExposeState === "passed" && aletheiaState === "passed" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-green-500/10 rounded-xl blur-xl -z-10"
                />
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px] -z-10" />
    </section>
  );
};
