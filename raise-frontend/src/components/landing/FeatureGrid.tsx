"use client";

import { motion } from "framer-motion";
import { Brain, Sparkles, Shield, Eye } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Generative Adversarial Networks",
    description: "Powered by custom-trained GANs for maximum imperceptibility.",
    gradient: "from-primary/20 via-primary/10 to-transparent",
    span: "md:col-span-2",
  },
  {
    icon: Sparkles,
    title: "Stable Diffusion Integration",
    description: "Don't just find cover images—create them. Generate unique, high-complexity images on the fly.",
    gradient: "from-accent/20 via-accent/10 to-transparent",
    span: "md:col-span-1",
  },
  {
    icon: Shield,
    title: "AES-256 Encryption",
    description: "Data is encrypted before embedding, ensuring zero-knowledge privacy.",
    gradient: "from-foreground/20 via-foreground/10 to-transparent",
    span: "md:col-span-1",
  },
  {
    icon: Eye,
    title: "Undetectable",
    description: "Tested against StegExpose and Aletheia with >99% success rate.",
    gradient: "from-primary/15 via-accent/10 to-transparent",
    span: "md:col-span-2",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const FeatureGrid = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
              Built for Security
            </span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Enterprise-grade steganography powered by cutting-edge AI research
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={item}
                className={`group relative ${feature.span} overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 hover:border-white/20 transition-all duration-500`}
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6 inline-flex">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 group-hover:bg-white/10 transition-all duration-300">
                      <Icon className="h-6 w-6 text-foreground/80" />
                    </div>
                  </div>

                  {/* Text */}
                  <h3 className="text-xl font-semibold tracking-tight mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/60 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          {[
            { label: "Imperceptibility", value: ">99%" },
            { label: "Embedding Speed", value: "<2s" },
            { label: "Data Capacity", value: "High" },
            { label: "Encryption", value: "AES-256" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-primary bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-foreground/60">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
    </section>
  );
};
