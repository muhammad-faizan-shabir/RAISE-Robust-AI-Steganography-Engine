"use client";

import React from "react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-[60vh] flex flex-col items-center justify-center overflow-hidden py-20">
      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px] animate-pulse delay-700" />
      </div>
      
      {/* Floating Tech Stack Cloud Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingPill text="React" x="10%" y="20%" delay={0} />
        <FloatingPill text="Python" x="80%" y="15%" delay={1} />
        <FloatingPill text="PyTorch" x="70%" y="60%" delay={2} />
        <FloatingPill text="Docker" x="15%" y="70%" delay={3} />
        <FloatingPill text="Next.js" x="25%" y="30%" delay={1.5} />
        <FloatingPill text="FastAPI" x="85%" y="40%" delay={2.5} />
        <FloatingPill text="Redis" x="60%" y="80%" delay={0.5} />
        <FloatingPill text="PostgreSQL" x="20%" y="85%" delay={3.5} />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-3 py-1 mb-4 text-xs font-mono font-medium tracking-wider text-primary uppercase border border-primary/30 rounded-full bg-primary/5">
            System Architecture
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 font-sans"
        >
          Engineering the <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-primary to-primary/80">Invisible</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed font-sans"
        >
          A scalable, three-tier architecture powered by Next.js, FastAPI, and Generative Adversarial Networks.
        </motion.p>
      </div>
    </section>
  );
};

const FloatingPill = ({
  text,
  x,
  y,
  delay,
}: {
  text: string;
  x: string;
  y: string;
  delay: number;
}) => {
  return (
    <motion.div
      className="absolute px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-foreground/30 text-sm font-mono whitespace-nowrap"
      style={{ left: x, top: y }}
      animate={{
        y: ["-10px", "10px", "-10px"],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 5,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {text}
    </motion.div>
  );
};

export default HeroSection;
