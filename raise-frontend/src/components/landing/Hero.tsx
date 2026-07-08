"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px] animate-pulse delay-700" />
      </div>

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground/80 tracking-wide">
                v1.0 Public Beta
              </span>
              <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-7xl lg:text-8xl font-bold text-center mb-6 tracking-tight"
          >
            <span className="inline-block bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
              Conceal.
            </span>
            <br />
            <span className="inline-block bg-gradient-to-br from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
              Create.
            </span>
            <br />
            <span className="inline-block bg-gradient-to-br from-primary via-accent to-foreground/60 bg-clip-text text-transparent">
              Communicate.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-center text-foreground/60 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            The first AI-powered steganography engine. Securely embed sensitive data into 
            AI-generated cover images using robust GAN architectures.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <Link
              href="/auth/register"
              className="group relative px-8 py-4 rounded-lg bg-primary text-white font-medium shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300 flex items-center gap-2"
            >
              Start Creating
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/about"
              className="group px-8 py-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm text-foreground font-medium hover:border-white/20 hover:bg-white/10 transition-all duration-300"
            >
              Learn More
            </Link>
          </motion.div>

          {/* Hero Visual - Floating Interface */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative mx-auto max-w-4xl"
          >
            <div
              className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl shadow-2xl overflow-hidden"
              style={{
                transform: "perspective(1200px) rotateX(8deg)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5 pointer-events-none" />
              
              {/* Placeholder content - simulated interface */}
              <div className="relative p-8 space-y-6">
                {/* Header Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <div className="relative h-8 w-8">
                        <Image
                          src="/assets/Logo.png"
                          alt="RAISE"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="h-3 w-32 bg-foreground/20 rounded" />
                      <div className="h-2 w-24 bg-foreground/10 rounded mt-1.5" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-md bg-white/5 border border-white/10" />
                    <div className="h-8 w-8 rounded-md bg-white/5 border border-white/10" />
                  </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="h-4 w-3/4 bg-foreground/15 rounded" />
                    <div className="h-32 rounded-lg bg-gradient-to-br from-primary/10 to-accent/5 border border-white/5" />
                    <div className="h-3 w-full bg-foreground/10 rounded" />
                    <div className="h-3 w-2/3 bg-foreground/10 rounded" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 w-3/4 bg-foreground/15 rounded" />
                    <div className="h-32 rounded-lg bg-gradient-to-br from-accent/5 to-primary/10 border border-white/5" />
                    <div className="h-3 w-full bg-foreground/10 rounded" />
                    <div className="h-3 w-2/3 bg-foreground/10 rounded" />
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="flex-1 h-10 rounded-lg bg-white/5 border border-white/10" />
                  <div className="h-10 w-24 rounded-lg bg-primary/20 border border-primary/30" />
                </div>
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Fade mask at bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
              style={{
                maskImage: "linear-gradient(to bottom, transparent, black)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent, black)",
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
        }}
      />
    </section>
  );
};
