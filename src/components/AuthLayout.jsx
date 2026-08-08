import React from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { CircleParking, Car, Radio, Layers, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-background text-foreground px-4 py-8 overflow-hidden select-none">

      {/* 1. Theme Backdrop Image Layer with Gradient Masks */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 dark:opacity-35 transition-opacity duration-700 pointer-events-none scale-105 filter blur-[2px]"
        style={{ backgroundImage: `url('/mallpark_auth_bg.png')` }}
      />

      {/* Gradient Vignette & Radial Light Blurs */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90 pointer-events-none" />

      {/* 2. Glowing Radial Mesh Orbs */}
      <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-primary/20 rounded-full filter blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-sky-500/20 rounded-full filter blur-[110px] animate-pulse pointer-events-none" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-emerald-500/15 rounded-full filter blur-[90px] pointer-events-none" />

      {/* 3. Modern SVG Parking HUD Grid & Scanner Line Overlay */}
      <div className="absolute inset-0 opacity-20 dark:opacity-30 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="parking-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-primary/40" />
              <circle cx="30" cy="30" r="1.5" className="fill-primary/60" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#parking-grid)" />
        </svg>
      </div>

      {/* Top Bar Navigation & Brand Badge */}
      <header className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-20">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-sky-500 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-105">
            <CircleParking className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-foreground flex items-center gap-1.5">
              MallPark
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">3D Multi-Level Parking</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/60 dark:bg-card/60 backdrop-blur-md border border-border/80 text-xs text-muted-foreground shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <Radio className="w-3.5 h-3.5 text-emerald-500" />
            <span>Slot Radar Active</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Decorative Floating Theme Status Badges (Desktop) */}


      <div className="hidden lg:flex absolute bottom-12 right-10 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-card/70 dark:bg-card/50 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl text-xs font-medium text-foreground pointer-events-none z-10">
        <div className="p-1.5 rounded-xl bg-primary/10 text-primary">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <div className="font-semibold text-foreground">3D Parking Navigation</div>
          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-500" /> Real-time Mall Slots
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Auth Card Container */}
      <div className="w-full max-w-md z-10 my-auto pt-16 sm:pt-0">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary via-indigo-600 to-sky-500 text-white shadow-xl shadow-primary/30 mb-4 transition-transform duration-300 hover:scale-105">
            {Icon ? <Icon className="w-8 h-8" aria-hidden="true" /> : <CircleParking className="w-8 h-8" />}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>}
        </div>

        <div className="bg-card/85 dark:bg-card/75 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 p-6 sm:p-8 transition-all duration-300 hover:border-primary/30">
          {children}
        </div>

        {footer && (
          <div className="text-center text-sm text-muted-foreground mt-6 bg-background/50 dark:bg-card/40 backdrop-blur-md py-2.5 px-4 rounded-full border border-border/50 max-w-xs mx-auto shadow-sm">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

