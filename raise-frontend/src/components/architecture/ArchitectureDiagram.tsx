"use client";

import React from "react";
import { motion } from "framer-motion";
import { Layers, Server, Cpu, Code, Database, Zap } from "lucide-react";

const ArchitectureDiagram = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-20 px-4">
      <div className="relative flex flex-col items-center gap-8">
        {/* Connecting Line */}
        <div className="absolute left-1/2 top-10 bottom-10 w-0.5 bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-pink-500/20 -translate-x-1/2 -z-10" />

        {/* Top Layer: Frontend */}
        <LayerCard
          title="Presentation Tier"
          subtitle="Next.js Presentation Layer"
          color="blue"
          icon={<Layers className="w-6 h-6 text-blue-400" />}
          techs={["React", "Tailwind", "Lucide"]}
        />

        {/* Middle Layer: Backend */}
        <LayerCard
          title="Application Tier"
          subtitle="FastAPI Orchestration"
          color="purple"
          icon={<Server className="w-6 h-6 text-purple-400" />}
          techs={["Python", "JWT", "Pydantic"]}
        />

        {/* Bottom Layer: Compute */}
        <LayerCard
          title="Data & Model Tier"
          subtitle="GPU Inference Engine"
          color="pink"
          icon={<Cpu className="w-6 h-6 text-pink-400" />}
          techs={["PyTorch", "Stable Diffusion", "Celery"]}
        />
      </div>
    </div>
  );
};

const LayerCard = ({
  title,
  subtitle,
  color,
  icon,
  techs,
}: {
  title: string;
  subtitle: string;
  color: "blue" | "purple" | "pink";
  icon: React.ReactNode;
  techs: string[];
}) => {
  const colorStyles = {
    blue: "border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40",
    purple:
      "border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/40",
    pink: "border-pink-500/20 bg-pink-500/5 hover:bg-pink-500/10 hover:border-pink-500/40",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`relative w-full max-w-2xl p-8 rounded-2xl border backdrop-blur-md transition-colors duration-300 ${colorStyles[color]}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white/90">{title}</h3>
            <p className="text-white/60 font-mono text-sm mt-1">{subtitle}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
            {techs.map((tech) => (
                <span key={tech} className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/70">
                    {tech}
                </span>
            ))}
        </div>
      </div>
      
      {/* Animated Glow on Hover */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-${color}-500/0 via-${color}-500/5 to-${color}-500/0 pointer-events-none`} />
    </motion.div>
  );
};

export default ArchitectureDiagram;
