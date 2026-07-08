"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Download,
  Wand2,
  History,
  ScanSearch,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants";
import { useState, useEffect } from "react";

const navItems = [
  {
    label: "Extract",
    href: ROUTES.STEGO.EXTRACT,
    icon: Download,
    description: "Reveal hidden messages",
    color: "#7a9eb1",
    gradient: "from-[#7a9eb1]/20 to-[#7a9eb1]/5",
  },
  {
    label: "Embed",
    href: ROUTES.STEGO.EMBED,
    icon: Upload,
    description: "Conceal your data",
    color: "#904e55",
    gradient: "from-[#904e55]/20 to-[#904e55]/5",
  },
  {
    label: "Generate",
    href: ROUTES.STEGO.GENERATE,
    icon: Wand2,
    description: "AI cover images",
    color: "#bfb48f",
    gradient: "from-[#bfb48f]/20 to-[#bfb48f]/5",
  },
  {
    label: "StegExpose",
    href: ROUTES.STEGO.STEGEXPOSE,
    icon: ScanSearch,
    description: "Detect hidden content",
    color: "#a87ca0",
    gradient: "from-[#a87ca0]/20 to-[#a87ca0]/5",
  },
  {
    label: "History",
    href: ROUTES.STEGO.HISTORY,
    icon: History,
    description: "Past operations",
    color: "#6b8f71",
    gradient: "from-[#6b8f71]/20 to-[#6b8f71]/5",
  },
];

export const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    router.push(ROUTES.HOME);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 pt-8 pb-6">
        <Link
          href={ROUTES.STEGO.EXTRACT}
          className="flex items-center gap-3 group"
          onClick={() => setMobileOpen(false)}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-[#904e55]/30 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300" />
            <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
              <Image
                src="/assets/Logo.png"
                alt="RAISE Logo"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-[0.2em]">
              RAISE
            </h1>
            <p className="text-[9px] text-foreground/60 leading-tight">
              Robust AI Steganography Engine
            </p>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />

      {/* Section Label */}
      <div className="px-6 mb-2">
        <span className="text-[10px] font-semibold tracking-[0.15em] text-foreground/30 uppercase">
          Operations
        </span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`relative group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-white/[0.08] shadow-sm"
                    : "hover:bg-white/[0.04]"
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-full"
                    style={{ backgroundColor: item.color }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Icon container */}
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 bg-gradient-to-br ${
                    isActive ? item.gradient : "from-white/[0.04] to-transparent"
                  } ${isActive ? "" : "group-hover:bg-white/[0.06]"}`}
                >
                  <Icon
                    className="h-4 w-4 transition-colors duration-200"
                    style={{ color: isActive ? item.color : "rgba(242,239,233,0.5)" }}
                  />
                </div>

                {/* Label & description */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium transition-colors duration-200 ${
                      isActive ? "text-foreground" : "text-foreground/60 group-hover:text-foreground/80"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="text-[10px] text-foreground/30 truncate">
                    {item.description}
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight
                  className={`h-3.5 w-3.5 flex-shrink-0 transition-all duration-200 ${
                    isActive
                      ? "opacity-60"
                      : "opacity-0 group-hover:opacity-40 -translate-x-1 group-hover:translate-x-0"
                  }`}
                  style={{ color: isActive ? item.color : "rgba(242,239,233,0.5)" }}
                />
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-shrink-0">
        {/* Divider */}
        <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />

        {/* Liquid Glass User Actions Tile - macOS Tahoe inspired */}
        <div className="mx-3 mb-6">
          <div
            className="relative rounded-[22px] overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.08) 100%)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.2)",
            }}
          >
            {/* Shimmer highlight */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.08) 0%, transparent 60%)",
              }}
            />

            <div className="relative flex items-center gap-2 p-2">
              {/* Avatar + Username */}
              <Link
                href={ROUTES.PROFILE}
                className="flex items-center gap-2.5 flex-1 min-w-0 px-1 py-1 rounded-xl hover:bg-white/[0.06] transition-colors group"
              >
                <div
                  className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #904e55 0%, #564e58 100%)",
                    boxShadow: "0 2px 8px rgba(144,78,85,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                  }}
                >
                  <User className="h-4 w-4 text-white" />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)",
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p suppressHydrationWarning className="text-xs font-semibold text-foreground/90 truncate leading-tight">
                    @{user?.username || "user"}
                  </p>
                  <p suppressHydrationWarning className="text-[10px] text-foreground/40 truncate leading-tight">
                    {user?.email || ""}
                  </p>
                </div>
              </Link>

              {/* Vertical separator */}
              <div className="w-px h-8 bg-white/10 flex-shrink-0" />

              {/* Action buttons */}
              <div className="flex items-center gap-1 flex-shrink-0 pr-1">
                <Link href={ROUTES.NOTIFICATIONS}>
                  <button
                    id="sidebar-notifications-btn"
                    className="h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-150 hover:bg-white/[0.08] active:scale-95"
                    title="Notifications"
                  >
                    <Bell className="h-3.5 w-3.5 text-foreground/60" />
                  </button>
                </Link>

                <Link href={ROUTES.SETTINGS}>
                  <button
                    id="sidebar-settings-btn"
                    className="h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-150 hover:bg-white/[0.08] active:scale-95"
                    title="Settings"
                  >
                    <Settings className="h-3.5 w-3.5 text-foreground/60" />
                  </button>
                </Link>

                <button
                  id="sidebar-logout-btn"
                  onClick={handleLogout}
                  className="h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-150 hover:bg-red-500/10 active:scale-95 group/logout"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5 text-foreground/60 group-hover/logout:text-red-400 transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ──────────── DESKTOP SIDEBAR ──────────── */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 h-screen sticky top-0 border-r border-white/[0.06] bg-background/60 backdrop-blur-2xl">
        {/* Subtle gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(160deg, rgba(144,78,85,0.04) 0%, transparent 40%, rgba(122,158,177,0.03) 100%)",
          }}
        />
        <div className="relative flex flex-col h-full z-10">
          <SidebarContent />
        </div>
      </aside>

      {/* ──────────── MOBILE HAMBURGER ──────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-background/80 backdrop-blur-2xl">
        {/* Logo (mobile top bar) */}
        <Link href={ROUTES.STEGO.EXTRACT} className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
            <Image
              src="/assets/Logo.png"
              alt="RAISE Logo"
              width={24}
              height={24}
              className="object-contain"
              priority
            />
          </div>
          <span className="text-sm font-bold tracking-[0.2em] text-foreground">
            RAISE
          </span>
        </Link>

        <button
          id="mobile-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="h-9 w-9 rounded-xl flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.10] transition-colors"
        >
          <AnimatePresence mode="wait" initial={false}>
            {mobileOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="h-4 w-4 text-foreground/80" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Menu className="h-4 w-4 text-foreground/80" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ──────────── MOBILE OVERLAY + DRAWER ──────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 border-r border-white/[0.08]"
              style={{
                background:
                  "linear-gradient(160deg, rgba(20,20,24,0.98) 0%, rgba(15,15,18,0.99) 100%)",
                backdropFilter: "blur(40px)",
              }}
            >
              {/* Close button in drawer */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 h-8 w-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-foreground/60" />
              </button>

              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
