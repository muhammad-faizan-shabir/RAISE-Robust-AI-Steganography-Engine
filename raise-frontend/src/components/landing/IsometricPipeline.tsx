"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Lock, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Sparkles,
    title: "Generation",
    desc: "SDXL Core",
    status: "Active",
    color: "text-purple-400",
    glow: "shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]",
    borderColor: "border-purple-400/30",
    bgGradient: "from-purple-500/10 to-blue-500/10",
  },
  {
    icon: Lock,
    title: "Embedding",
    desc: "GAN Encoder",
    status: "Processing",
    color: "text-blue-400",
    glow: "shadow-[0_0_30px_-5px_rgba(59,130,246,0.4)]",
    borderColor: "border-blue-400/30",
    bgGradient: "from-blue-500/10 to-cyan-500/10",
  },
  {
    icon: ShieldCheck,
    title: "Validation",
    desc: "Steganalysis",
    status: "Secure",
    color: "text-emerald-400",
    glow: "shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)]",
    borderColor: "border-emerald-400/30",
    bgGradient: "from-emerald-500/10 to-green-500/10",
  },
];

export const IsometricPipeline = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative py-40 overflow-hidden bg-[#0B0C10]">
      <div className="container mx-auto px-8 md:px-12 lg:px-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-400/30 bg-purple-400/5 backdrop-blur-sm mb-6">
            <span className="text-xs font-medium text-white/80 tracking-wide">
              System Architecture
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">RAISE</span> Architecture
          </h2>
          <p className="text-white/40 max-w-lg mx-auto text-lg">
            An isometric view of our secure steganography pipeline
          </p>
        </motion.div>

        {/* The Isometric Container */}
        <div className="relative" style={{ perspective: "1000px" }}>
          <motion.div
            initial={{ opacity: 0, rotateX: 0 }}
            whileInView={{ opacity: 1, rotateX: 60 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative max-w-5xl mx-auto h-[600px] md:h-[500px]"
            style={{
              transformStyle: "preserve-3d",
              transform: "rotateX(60deg) rotateZ(-45deg) scale(0.85)",
            }}
          >
            {/* Grid Floor */}
            <div
              className="absolute inset-0 border border-white/5 rounded-3xl bg-white/[0.02] backdrop-blur-sm"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
                transform: "translateZ(-20px)",
              }}
            />

            {/* Connecting Cables on Floor */}
            <svg
              className="absolute top-1/2 left-0 w-full h-2 -translate-y-1/2"
              style={{ transform: "translateZ(-15px)" }}
            >
              {/* Cable 1 to 2 */}
              <motion.line
                x1="25%"
                y1="50%"
                x2="50%"
                y2="50%"
                stroke="url(#cableGradient1)"
                strokeWidth="3"
                strokeDasharray="8,8"
              />
              
              {/* Cable 2 to 3 */}
              <motion.line
                x1="50%"
                y1="50%"
                x2="75%"
                y2="50%"
                stroke="url(#cableGradient2)"
                strokeWidth="3"
                strokeDasharray="8,8"
              />

              {/* Traveling Pulse 1 */}
              <motion.circle
                r="6"
                fill="#8B5CF6"
                filter="url(#pulseGlow)"
                initial={{ cx: "25%", cy: "50%" }}
                animate={{ cx: ["25%", "50%", "50%"] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* Traveling Pulse 2 */}
              <motion.circle
                r="6"
                fill="#3B82F6"
                filter="url(#pulseGlow)"
                initial={{ cx: "50%", cy: "50%" }}
                animate={{ cx: ["50%", "75%", "75%"] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 1.5,
                }}
              />

              <defs>
                <linearGradient id="cableGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="cableGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.6" />
                </linearGradient>
                <filter id="pulseGlow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>

            {/* Step Cards */}
            <div className="absolute inset-0 flex items-center justify-around px-12">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isHovered = hoveredIndex === index;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 100, z: -100 }}
                    whileInView={{ opacity: 1, y: 0, z: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.8, 
                      delay: index * 0.3,
                      ease: "easeOut"
                    }}
                    onHoverStart={() => setHoveredIndex(index)}
                    onHoverEnd={() => setHoveredIndex(null)}
                    className="relative group cursor-pointer"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isHovered ? "translateZ(50px)" : "translateZ(0px)",
                      transition: "transform 0.3s ease-out",
                    }}
                  >
                    {/* Card Container */}
                    <div
                      className={`
                        relative w-48 h-56 rounded-2xl 
                        border ${step.borderColor} 
                        bg-gradient-to-br ${step.bgGradient}
                        backdrop-blur-xl ${step.glow}
                        transition-all duration-500
                        ${isHovered ? 'border-opacity-100' : 'border-opacity-50'}
                      `}
                      style={{
                        transformStyle: "preserve-3d",
                      }}
                    >
                      {/* Card Front Face */}
                      <div className="p-6 h-full flex flex-col items-center justify-between">
                        {/* Icon */}
                        <div className={`p-4 rounded-xl bg-white/5 border border-white/10 ${isHovered ? 'scale-110' : ''} transition-transform duration-300`}>
                          <Icon className={`h-10 w-10 ${step.color}`} />
                        </div>

                        {/* Content */}
                        <div className="text-center space-y-2">
                          <h3 className="text-xl font-bold text-white tracking-tight">
                            {step.title}
                          </h3>
                          <p className="text-sm text-white/60">
                            {step.desc}
                          </p>
                          <div className="flex items-center justify-center gap-2 mt-3">
                            <div className={`w-2 h-2 rounded-full ${step.color.replace('text-', 'bg-')} animate-pulse`} />
                            <span className="text-xs text-white/40 font-mono">
                              {step.status}
                            </span>
                          </div>
                        </div>

                        {/* Step Number */}
                        <div className="absolute top-4 right-4">
                          <div className="w-8 h-8 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-xs font-mono text-white/40">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Hover Glow Lines */}
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 rounded-2xl"
                        >
                          <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-${step.color.split('-')[1]}-400 to-transparent`} />
                          <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-${step.color.split('-')[1]}-400 to-transparent`} />
                        </motion.div>
                      )}
                    </div>

                    {/* Shadow */}
                    <div
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/40 rounded-full blur-xl"
                      style={{
                        transform: `translateZ(-30px) translateX(-50%)`,
                      }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Info Pills Below */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-32"
        >
          {[
            { label: "Processing Speed", value: "<2s" },
            { label: "Success Rate", value: "99.8%" },
            { label: "Encryption", value: "AES-256" },
          ].map((stat, index) => (
            <div
              key={index}
              className="px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
            >
              <span className="text-sm text-white/60 mr-2">{stat.label}:</span>
              <span className="text-sm font-bold text-white">{stat.value}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Background Ambient Lights */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
};
