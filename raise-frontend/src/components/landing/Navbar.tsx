"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { API_URL, ROUTES } from "@/lib/constants";

export const Navbar = () => {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-background/80"
    >
      <div className="container mx-auto px-8 md:px-12 lg:px-16 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/assets/Logo.png"
              alt="RAISE Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-[0.2em]">
                RAISE
              </h1>
              <p className="text-[9px] text-foreground/80 mt-0.5">
                Robust AI Steganography Engine
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/about"
              className="text-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              About
            </Link>
            <a
              href={`${API_URL}/redoc`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              Documentation
            </a>
            <Link
              href={ROUTES.ARCHITECTURE}
              className="text-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              Architecture
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="group relative px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
