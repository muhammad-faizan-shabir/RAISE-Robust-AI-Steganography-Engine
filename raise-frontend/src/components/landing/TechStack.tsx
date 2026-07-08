"use client";

import { motion } from "framer-motion";
import { SiPython, SiPytorch, SiTensorflow, SiDocker, SiFastapi } from "react-icons/si";

const techStack = [
  { name: "Python", icon: SiPython },
  { name: "PyTorch", icon: SiPytorch },
  { name: "TensorFlow", icon: SiTensorflow },
  { name: "Docker", icon: SiDocker },
  { name: "FastAPI", icon: SiFastapi },
];

export const TechStack = () => {
  return (
    <section className="relative py-20 border-y border-white/5 overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-sm text-foreground/40 uppercase tracking-wider font-medium">
            Powered By
          </p>
        </motion.div>

        {/* Tech Stack Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8 max-w-5xl mx-auto"
        >
          {techStack.map((tech, index) => {
            const Icon = tech.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group flex flex-col items-center gap-3"
              >
                <div className="relative">
                  <Icon className="h-12 w-12 text-foreground/20 group-hover:text-foreground/40 transition-all duration-300 grayscale group-hover:grayscale-0" />
                </div>
                <span className="text-xs text-foreground/30 group-hover:text-foreground/50 transition-colors duration-300">
                  {tech.name}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Fade Edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-32 pointer-events-none"
        style={{
          background: "linear-gradient(to right, hsl(var(--background)), transparent)",
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none"
        style={{
          background: "linear-gradient(to left, hsl(var(--background)), transparent)",
        }}
      />
    </section>
  );
};
