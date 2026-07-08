"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Brain, Activity } from "lucide-react";

const TechnicalDeepDives = () => {
  return (
    <div className="w-full py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Technical Deep Dives</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DeepDiveCard
            title="Security"
            subtitle="Stateless JWT Auth"
            description="Secure authentication flow using Access & Refresh tokens with automatic rotation policies."
            icon={<Shield className="w-6 h-6 text-emerald-400" />}
            color="emerald"
            delay={0}
          />
          <DeepDiveCard
            title="Performance"
            subtitle="Connection Pooling"
            description="Optimized database interactions using SQLAlchemy pooling strategies for high-throughput operations."
            icon={<Zap className="w-6 h-6 text-amber-400" />}
            color="amber"
            delay={0.1}
          />
          <DeepDiveCard
            title="AI Models"
            subtitle="Modular GAN Integration"
            description="Flexible architecture supporting interchangeable Encoder/Decoder/Critic interfaces for model evolution."
            icon={<Brain className="w-6 h-6 text-pink-400" />}
            color="pink"
            delay={0.2}
          />
          <DeepDiveCard
            title="Robustness"
            subtitle="Steganalysis Testing"
            description="Automated quality assurance pipeline using StegExpose to verify imperceptibility of hidden data."
            icon={<Activity className="w-6 h-6 text-cyan-400" />}
            color="cyan"
            delay={0.3}
          />
        </div>
      </div>
    </div>
  );
};

const DeepDiveCard = ({
  title,
  subtitle,
  description,
  icon,
  color,
  delay,
}: {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}) => {
  // Map color names to Tailwind classes safely
  const colorMap: Record<string, string> = {
    emerald: "hover:border-emerald-500/40 hover:bg-emerald-500/5",
    amber: "hover:border-amber-500/40 hover:bg-amber-500/5",
    pink: "hover:border-pink-500/40 hover:bg-pink-500/5",
    cyan: "hover:border-cyan-500/40 hover:bg-cyan-500/5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`group relative p-8 rounded-2xl border border-white/10 bg-[#0B0C10]/50 backdrop-blur-sm transition-all duration-300 ${colorMap[color] || ""}`}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
            <h3 className="text-sm font-mono text-white/50 uppercase tracking-wider mb-2">{title}</h3>
            <h4 className="text-xl font-semibold text-white group-hover:text-white transition-colors">{subtitle}</h4>
        </div>
        <div className="p-3 rounded-lg bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
      </div>
      
      <p className="text-white/60 leading-relaxed text-sm">
        {description}
      </p>
    </motion.div>
  );
};

export default TechnicalDeepDives;
