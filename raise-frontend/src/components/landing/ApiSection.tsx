"use client";

import { motion } from "framer-motion";
import { API_URL } from "@/lib/constants";

export const ApiSection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="container mx-auto px-8 md:px-12 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Side - Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm">
              <span className="text-xs font-medium text-foreground/80 tracking-wide">
                Developer API
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                Built for Scale.
              </span>
              <br />
              <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                Powered by FastAPI.
              </span>
            </h2>
            
            <p className="text-lg text-foreground/60 leading-relaxed max-w-lg">
              Integrate steganography into your Python workflows with a few lines of code.
            </p>

            <div className="flex items-center gap-4 pt-4">
              <a
                href={`${API_URL}/redoc`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg bg-primary text-white font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300"
              >
                View Documentation
              </a>
              <a
                href={`${API_URL}/docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm text-foreground font-medium hover:border-white/20 hover:bg-white/10 transition-all duration-300"
              >
                API Reference
              </a>
            </div>
          </motion.div>

          {/* Right Side - Code Window */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Mac Window */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Title Bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-foreground/40 font-mono">raise_example.py</span>
                </div>
              </div>

              {/* Code Content */}
              <div className="p-6 font-mono text-sm">
                <div className="space-y-1">
                  <div className="flex">
                    <span className="text-foreground/40 select-none w-8">1</span>
                    <span className="text-primary">import</span>
                    <span className="text-foreground ml-2">raise_engine</span>
                    <span className="text-primary ml-2">as</span>
                    <span className="text-foreground ml-2">re</span>
                  </div>
                  
                  <div className="flex">
                    <span className="text-foreground/40 select-none w-8">2</span>
                  </div>
                  
                  <div className="flex">
                    <span className="text-foreground/40 select-none w-8">3</span>
                    <span className="text-foreground/40"># Generate a unique cover with Stable Diffusion</span>
                  </div>
                  
                  <div className="flex">
                    <span className="text-foreground/40 select-none w-8">4</span>
                    <span className="text-foreground">cover</span>
                    <span className="text-primary ml-2">=</span>
                    <span className="text-foreground ml-2">re.</span>
                    <span className="text-accent">generate</span>
                    <span className="text-foreground/60">(</span>
                  </div>
                  
                  <div className="flex">
                    <span className="text-foreground/40 select-none w-8">5</span>
                    <span className="text-foreground ml-8">prompt</span>
                    <span className="text-primary">=</span>
                    <span className="text-green-400">"Cyberpunk city"</span>
                    <span className="text-foreground/60">,</span>
                  </div>
                  
                  <div className="flex">
                    <span className="text-foreground/40 select-none w-8">6</span>
                    <span className="text-foreground ml-8">complexity</span>
                    <span className="text-primary">=</span>
                    <span className="text-green-400">"high"</span>
                  </div>
                  
                  <div className="flex">
                    <span className="text-foreground/40 select-none w-8">7</span>
                    <span className="text-foreground/60">)</span>
                  </div>
                  
                  <div className="flex">
                    <span className="text-foreground/40 select-none w-8">8</span>
                  </div>
                  
                  <div className="flex">
                    <span className="text-foreground/40 select-none w-8">9</span>
                    <span className="text-foreground/40"># Embed sensitive payload</span>
                  </div>
                  
                  <div className="flex">
                    <span className="text-foreground/40 select-none w-8">10</span>
                    <span className="text-foreground">stego_img</span>
                    <span className="text-primary ml-2">=</span>
                    <span className="text-foreground ml-2">re.</span>
                    <span className="text-accent">embed</span>
                    <span className="text-foreground/60">(</span>
                  </div>
                  
                  <div className="flex">
                    <span className="text-foreground/40 select-none w-8">11</span>
                    <span className="text-foreground ml-8">cover_image</span>
                    <span className="text-primary">=</span>
                    <span className="text-foreground">cover</span>
                    <span className="text-foreground/60">,</span>
                  </div>
                  
                  <div className="flex">
                    <span className="text-foreground/40 select-none w-8">12</span>
                    <span className="text-foreground ml-8">payload</span>
                    <span className="text-primary">=</span>
                    <span className="text-green-400">"confidential_report.pdf"</span>
                    <span className="text-foreground/60">,</span>
                  </div>
                  
                  <div className="flex">
                    <span className="text-foreground/40 select-none w-8">13</span>
                    <span className="text-foreground ml-8">encryption</span>
                    <span className="text-primary">=</span>
                    <span className="text-green-400">"AES-256"</span>
                  </div>
                  
                  <div className="flex">
                    <span className="text-foreground/40 select-none w-8">14</span>
                    <span className="text-foreground/60">)</span>
                  </div>
                </div>

                {/* Cursor Blink */}
                <div className="flex mt-2">
                  <span className="text-foreground/40 select-none w-8">15</span>
                  <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Accent */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-accent/20 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>

      {/* Background Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
        }}
      />
    </section>
  );
};
