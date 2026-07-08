"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";

export const AppHeader = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push(ROUTES.HOME);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-background/80"
    >
      <div className="container mx-auto px-8 md:px-12 lg:px-16 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2 group">
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

          {/* User Actions */}
          <div className="flex items-center gap-3">
            <Link href={ROUTES.NOTIFICATIONS}>
              <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
                <Bell className="h-5 w-5 text-foreground/80" />
              </button>
            </Link>
            <Link href={ROUTES.PROFILE}>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="h-8 w-8 bg-gradient-to-br from-[#904e55] to-[#564e58] rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span suppressHydrationWarning className="text-foreground/80 text-sm font-medium hidden md:block">
                  @{user?.username || 'user'}
                </span>
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
            >
              <LogOut className="h-4 w-4 text-foreground/80" />
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
