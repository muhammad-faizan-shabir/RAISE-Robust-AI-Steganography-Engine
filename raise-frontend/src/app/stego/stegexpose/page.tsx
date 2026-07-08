// src/app/stego/stegexpose/page.tsx
// Next.js App Router page — StegExpose steganalysis

"use client";

import StegExposeAnalyzer from "@/features/stego/components/StegExposeAnalyzer";
import { SidebarLayout } from "@/components/layout";

export default function StegExposePage() {
  return (
    <SidebarLayout>
      <div className="min-h-[calc(100vh-4rem)] w-full relative flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Subtle primary glow behind the glass */}
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />

          {/* Grid texture */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* The Main Centered Container (Liquid Glass) */}
        <div className="relative w-full max-w-5xl rounded-[2rem] p-8 sm:p-12 shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/10 bg-white/[0.03] backdrop-blur-2xl ring-1 ring-white/5">

          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-3">
              Steganalysis
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base font-light max-w-2xl mx-auto">
              Statistical Steganalysis using four independent detectors - Primary Sets, Chi Square, Sample Pairs, and RS Analysis - fused into a single probability score.
            </p>
          </div>

          <StegExposeAnalyzer />
        </div>
      </div>
    </SidebarLayout>
  );
}
