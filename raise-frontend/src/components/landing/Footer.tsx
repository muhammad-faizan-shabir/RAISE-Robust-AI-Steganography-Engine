"use client";

import Link from "next/link";
import Image from "next/image";
import { Github, Twitter, Linkedin } from "lucide-react";
import { ROUTES, API_URL } from "@/lib/constants";

export const Footer = () => {
  return (
    <footer className="relative border-t border-white/5 bg-background/50 backdrop-blur-xl">
      <div className="container mx-auto px-8 md:px-12 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/assets/Logo.png"
                alt="RAISE Logo"
                width={40}
                height={40}
                className="object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-[0.2em]">
                  RAISE
                </h1>
                <p className="text-[10px] text-foreground/80 mt-0.5">
                  Robust AI Steganography Engine
                </p>
              </div>
            </div>
            <p className="text-sm text-foreground/60 leading-relaxed max-w-sm">
              The first AI-powered platform for secure, 
              imperceptible data concealment using advanced GAN architectures.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-white/10 bg-white/5 text-foreground/60 hover:text-foreground hover:border-white/20 hover:bg-white/10 transition-all"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-white/10 bg-white/5 text-foreground/60 hover:text-foreground hover:border-white/20 hover:bg-white/10 transition-all"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg border border-white/10 bg-white/5 text-foreground/60 hover:text-foreground hover:border-white/20 hover:bg-white/10 transition-all"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-sm font-semibold tracking-tight mb-4 text-foreground">
              Product
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Architecture", href: ROUTES.ARCHITECTURE, external: false },
                { label: "Documentation", href: `${API_URL}/redoc`, external: true },
                { label: "API Reference", href: `${API_URL}/docs`, external: true },
              ].map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground/60 hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/60 hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-sm font-semibold tracking-tight mb-4 text-foreground">
              Company
            </h4>
            <ul className="space-y-3">
              {[
                { label: "About", href: ROUTES.ABOUT },
                { label: "Privacy", href: ROUTES.PRIVACY },
                { label: "Terms", href: ROUTES.TERMS },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/60 hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5">
          <p className="text-xs text-foreground/40 text-center md:text-left">
            © 2025 RAISE. A Final Year Project by FAST-NUCES, Lahore.
          </p>
        </div>
      </div>
    </footer>
  );
};
