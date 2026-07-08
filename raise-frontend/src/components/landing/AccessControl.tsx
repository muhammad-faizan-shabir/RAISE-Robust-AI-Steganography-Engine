"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, ShieldAlert, ShieldCheck, User, Bot } from "lucide-react";

type LogEntry = {
  id: string;
  user: string;
  role: string;
  status: "GRANTED" | "DENIED" | "BLOCKED";
  timestamp: string;
};

const LOG_TEMPLATE: Omit<LogEntry, "id" | "timestamp">[] = [
  { user: "Unknown_User_88", role: "Anonymous", status: "DENIED" },
  { user: "Interceptor_Bot_V2", role: "Crawler", status: "BLOCKED" },
  { user: "Project_Lead_Alice", role: "Admin", status: "GRANTED" },
  { user: "External_IP_192.168", role: "Unknown", status: "DENIED" },
  { user: "Stego_Analyzer_Tool", role: "Bot", status: "BLOCKED" },
];

export const AccessControl = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    let logCounter = 0;
    
    const interval = setInterval(() => {
      const template = LOG_TEMPLATE[logCounter % LOG_TEMPLATE.length];
      const newLog: LogEntry = {
        ...template,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 2 })
      };

      setLogs(prev => [newLog, ...prev].slice(0, 6)); // Keep last 6 logs

      if (newLog.status === "GRANTED") {
        setIsUnlocked(true);
        setTimeout(() => setIsUnlocked(false), 800);
      }

      logCounter++;
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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
                Access Control
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                Zero-Trust
              </span>
              <br />
              <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                Architecture.
              </span>
            </h2>
            
            <p className="text-lg text-foreground/60 leading-relaxed max-w-lg">
              Granular access controls ensure only authorized personnel can retrieve hidden data. 
              Our system actively filters every retrieval attempt in real-time.
            </p>

            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-foreground/60">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span>Role-Based Access</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground/60">
                <ShieldAlert className="w-4 h-4 text-primary" />
                <span>Active Threat Blocking</span>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Security Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl h-[400px]"
          >
            <div className="grid md:grid-cols-2 h-full">
              {/* Left Side (of terminal) - The Asset */}
              <div className="relative p-6 flex items-center justify-center border-r border-white/10 bg-black/20">
                <div className="relative w-full aspect-square max-w-[240px] rounded-lg overflow-hidden border border-white/10">
                  {/* Background Image */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-purple-900"
                    animate={{ filter: isUnlocked ? "blur(0px)" : "blur(12px)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 opacity-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                    {/* Fake abstract content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border-4 border-white/20" />
                      <div className="absolute w-12 h-12 rounded-full bg-white/10" />
                    </div>
                  </motion.div>

                  {/* Lock Overlay */}
                  <AnimatePresence mode="wait">
                    {!isUnlocked && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm"
                      >
                        <div className="p-4 rounded-full bg-black/40 border border-white/10 shadow-lg shadow-primary/20">
                          <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <span className="mt-3 text-xs font-mono text-primary animate-pulse">
                          LOCKED
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Unlock Overlay */}
                  <AnimatePresence>
                    {isUnlocked && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <motion.div 
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1.5, opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0 bg-green-500/20"
                        />
                        <div className="p-4 rounded-full bg-green-500/20 border border-green-500/30">
                          <Unlock className="w-8 h-8 text-green-400" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Side (of terminal) - Sentinel Log */}
              <div className="flex flex-col bg-black/60 h-full">
                {/* Terminal Header */}
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                    <span className="text-[10px] font-mono text-foreground/60">SENTINEL_LOG</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded bg-green-500/10 border border-green-500/20">
                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-green-400">ACTIVE</span>
                  </div>
                </div>

                {/* Log List */}
                <div className="flex-1 p-4 font-mono text-[10px] space-y-3 overflow-hidden flex flex-col justify-end">
                  <AnimatePresence initial={false}>
                    {logs.slice(0, 5).map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: 20, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 pb-2 border-b border-white/5 last:border-0 shrink-0"
                      >
                        <span className="text-foreground/30 w-[50px]">{log.timestamp}</span>
                        
                        <div className="flex-1 flex items-center gap-1.5 overflow-hidden">
                          {log.role === "Bot" || log.role === "Crawler" ? (
                            <Bot className="w-3 h-3 text-foreground/40 shrink-0" />
                          ) : (
                            <User className="w-3 h-3 text-foreground/40 shrink-0" />
                          )}
                          <span className="truncate text-foreground/80">{log.user}</span>
                        </div>

                        <div className={`
                          px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0
                          ${log.status === "GRANTED" 
                            ? "bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]" 
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                          }
                        `}>
                          {log.status}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px] -z-10" />
    </section>
  );
};

