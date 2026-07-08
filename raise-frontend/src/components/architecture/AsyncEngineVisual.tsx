"use client";

import React from "react";
import { motion } from "framer-motion";
import { Database, Server, Cpu, FileCheck } from "lucide-react";

const AsyncEngineVisual = () => {
  return (
    <div className="w-full py-16 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 items-center">
          {/* Connection Line Background */}
          <div className="hidden md:block absolute left-0 right-0 top-1/2 h-0.5 bg-white/10 -translate-y-1/2 -z-10" />

          {/* Step 1: User Request */}
          <StepCard
            icon={<Server className="w-6 h-6 text-blue-400" />}
            title="API Request"
            description="User initiates generation"
          />

          {/* Animated Packet 1 -> 2 */}
          <Packet delay={0} />

          {/* Step 2: Redis Broker */}
          <StepCard
            icon={<Database className="w-6 h-6 text-red-400" />}
            title="Redis Broker"
            description="Task Queue Management"
          />

          {/* Animated Packet 2 -> 3 */}
          <Packet delay={1.5} />

          {/* Step 3: Celery Worker */}
          <StepCard
            icon={<Cpu className="w-6 h-6 text-purple-400" />}
            title="Celery Worker"
            description="GPU Processing (GANs)"
          />

          {/* Animated Packet 3 -> 4 */}
          <Packet delay={3} />

          {/* Step 4: Result Storage */}
          <StepCard
            icon={<FileCheck className="w-6 h-6 text-green-400" />}
            title="Result Storage"
            description="Completed Artifacts"
          />
        </div>
      </div>
    </div>
  );
};

const StepCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="relative flex flex-col items-center text-center p-6 rounded-xl bg-[#0B0C10] border border-white/10 z-10">
      <div className="p-3 rounded-full bg-white/5 border border-white/10 mb-4 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
        {icon}
      </div>
      <h4 className="text-lg font-semibold text-white mb-1">{title}</h4>
      <p className="text-sm text-white/50">{description}</p>
    </div>
  );
};

const Packet = ({ delay }: { delay: number }) => {
  return (
    <div className="hidden md:block absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none z-0">
       {/* Note: This is a simplified animation approach. 
           Ideally, we'd position this relative to the steps, 
           but for a grid layout, we can simulate movement across the grid. 
           Since grid columns are equal width, we can animate along the percentage width. 
       */}
       {/* 
         However, the grid structure makes it tricky to place packets *between* grid cells 
         without breaking the flow. A better approach for the packet is to have it 
         absolutely positioned in the container and animate keyframes.
       */}
    </div>
  );
};

// Re-implementing with a cleaner SVG overlay for connections and packets
const AsyncEngineVisualEnhanced = () => {
    return (
        <div className="w-full py-24">
            <h3 className="text-2xl font-mono text-center mb-12 text-white/80">Async Task Processing Strategy</h3>
            <div className="max-w-5xl mx-auto px-4 relative">
                
                {/* Steps Container */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                     <StepCard
                        icon={<Server className="w-6 h-6 text-blue-400" />}
                        title="API Request"
                        description="User Request"
                    />
                    <StepCard
                        icon={<Database className="w-6 h-6 text-red-400" />}
                        title="Redis Broker"
                        description="Message Queue"
                    />
                    <StepCard
                        icon={<Cpu className="w-6 h-6 text-purple-400" />}
                        title="Celery Worker"
                        description="GPU Inference"
                    />
                    <StepCard
                        icon={<FileCheck className="w-6 h-6 text-green-400" />}
                        title="Result Storage"
                        description="S3 / Database"
                    />
                </div>

                {/* Animated Connection Lines (Desktop) */}
                <div className="hidden md:block absolute top-1/2 left-0 w-full -translate-y-[40px] pointer-events-none z-0 px-[10%]"> 
                     {/* The px-[10%] is a rough estimate to align with centers of first and last cards. 
                         A more robust way is to use a specific width line.
                     */}
                     <div className="w-full h-[2px] bg-white/10 relative overflow-hidden">
                        <motion.div 
                            className="absolute top-0 left-0 h-full w-[20%] bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                            animate={{ left: ["-20%", "120%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                     </div>
                </div>

                 {/* Packets - Floating Dots */}
                 <div className="hidden md:block absolute top-1/2 left-0 w-full -translate-y-[40px] pointer-events-none z-20">
                     <motion.div
                        className="w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] absolute top-[-5px]"
                        initial={{ left: "12%" }}
                        animate={{ left: ["12%", "37%", "62%", "87%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear", times: [0, 0.33, 0.66, 1] }}
                     />
                 </div>
            </div>
        </div>
    )
}

export default AsyncEngineVisualEnhanced;
