import React from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import ArchitectureDiagram from "@/components/architecture/ArchitectureDiagram";
import AsyncEngineVisual from "@/components/architecture/AsyncEngineVisual";
import HeroSection from "@/components/architecture/HeroSection";
import TechnicalDeepDives from "@/components/architecture/TechnicalDeepDives";

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen bg-[#0B0C10] text-white overflow-x-hidden selection:bg-blue-500/30">
      <Navbar />
      
      <div className="pt-20">
        <HeroSection />
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent pointer-events-none" />
          <ArchitectureDiagram />
        </div>

        <div className="relative border-y border-white/5 bg-white/[0.02]">
           <AsyncEngineVisual />
        </div>

        <TechnicalDeepDives />
      </div>
      
      <Footer />
    </main>
  );
}
