import React, { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { Link, useLocation } from "react-router-dom";
import { User, Sparkles, Building2, Ticket } from "lucide-react";

function AuthTypewriterHeading({ phrases }) {
  const list = phrases && phrases.length ? phrases : ["Welcome Back.", "Park Smart. Shop Easy."];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullText = list[phraseIndex];
    let timer;

    if (!isDeleting && currentText === fullText) {
      timer = setTimeout(() => setIsDeleting(true), 2400);
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % list.length);
    } else {
      const speed = isDeleting ? 25 : 55;
      timer = setTimeout(() => {
        setCurrentText((prev) =>
          isDeleting
            ? fullText.substring(0, prev.length - 1)
            : fullText.substring(0, prev.length + 1)
        );
      }, speed);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIndex, list]);

  // Split phrase on sentence / punctuation breaks for 2-line rendering
  const parts = currentText.split(/(?<=\.|\?|\!)\s+/);
  const line1 = parts[0] || "";
  const line2 = parts.slice(1).join(" ") || "";

  return (
    <div className="min-h-[140px] sm:min-h-[170px] flex flex-col justify-center my-auto">
      <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1] drop-shadow-md">
        {line1}
        {!line2 && <span className="inline-block w-[3px] h-[0.85em] bg-purple-400 ml-2 align-middle animate-pulse rounded-full shadow-[0_0_12px_rgba(192,132,252,0.9)]" />}
      </h2>
      {line2 && (
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-100 to-indigo-200 leading-[1.1] drop-shadow-md mt-1">
          {line2}
          <span className="inline-block w-[3px] h-[0.85em] bg-purple-400 ml-2 align-middle animate-pulse rounded-full shadow-[0_0_12px_rgba(192,132,252,0.9)]" />
        </h2>
      )}
    </div>
  );
}

export default function AuthLayout({ title, subtitle, footer, children, phrases }) {
  const location = useLocation();
  const isRegisterPage = location.pathname === "/register";

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#05040a] text-white px-3 sm:px-6 py-8 overflow-x-hidden select-none">
      {/* 1. Photorealistic Smart Parking Garage Background Wallpaper */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none scale-105 filter blur-[1px] mix-blend-screen transition-opacity duration-700"
        style={{ backgroundImage: `url('/smart_parking_neon_bg.png')` }}
      />

      {/* 2. Neon Purple Top & Bottom Ambient Spotlights */}
      <div className="absolute -top-20 left-1/4 w-[700px] h-[400px] bg-purple-600/25 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-20 right-1/4 w-[700px] h-[400px] bg-indigo-600/25 rounded-full blur-[160px] pointer-events-none" />

      {/* 3. Smart Parking Slot Radar HUD & Sensor Nodes Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="auth-neon-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-purple-500/40" />
              <rect x="5" y="5" width="20" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-400/30" />
              <rect x="35" y="5" width="20" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-400/30" />
              <circle cx="15" cy="20" r="1.5" className="fill-purple-400" />
              <circle cx="45" cy="20" r="1.5" className="fill-purple-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-neon-grid)" />
        </svg>
      </div>

      {/* Main Dual-Pane Window Card */}
      <div className="w-full max-w-5xl rounded-[2.5rem] border border-purple-500/35 bg-[#0a0614]/95 backdrop-blur-2xl shadow-[0_0_70px_rgba(168,85,247,0.35)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px] relative z-10">

        {/* LEFT FORM PANE */}
        <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-purple-900/40 relative z-20 bg-[#0d071d]/95">
          <div>
            {/* Top Brand Logo */}
            <div className="flex items-center justify-between mb-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-xl overflow-hidden bg-purple-500/10 border border-purple-500/30 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-transform duration-300 group-hover:scale-105">
                  <img
                    src="/logo.png"
                    alt="MallPark Logo"
                    className="w-full h-full object-contain mix-blend-lighten"
                  />
                </div>
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-purple-200 transition-colors">
                  MallPark
                </span>
              </Link>
            </div>

            {/* User Avatar Circle Badge with Neon Purple Glow */}
            <div className="text-center my-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#170a35] text-purple-300 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] mx-auto mb-4 border-2 border-purple-500/50 transition-transform hover:scale-105">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-purple-200 stroke-[2.2]" />
              </div>
            </div>

            {/* Form Slot */}
            <div className="space-y-4">
              {children}
            </div>
          </div>

          {/* Footer Link */}
          {footer && (
            <div className="mt-6 pt-4 text-center text-xs text-purple-300/70 border-t border-purple-900/30">
              {footer}
            </div>
          )}
        </div>

        {/* RIGHT HERO BANNER PANE WITH NEON PURPLE SMART PARKING BACKGROUND */}
        <div className="lg:col-span-7 hidden sm:flex flex-col justify-between p-8 sm:p-12 relative overflow-hidden bg-gradient-to-br from-[#13072e] via-[#090417] to-[#04020a] z-10">

          {/* Smart Parking Wallpaper & Wave Artwork Overlays */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Smart Parking Garage Image Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-screen transition-opacity duration-700"
              style={{ backgroundImage: `url('/smart_parking_neon_bg.png')` }}
            />

            {/* Glowing Mesh Cones */}
            <div className="absolute -top-10 -right-10 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl animate-pulse" />
            <div className="absolute top-1/2 -right-20 w-[450px] h-[300px] bg-indigo-600/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-10 w-[500px] h-[250px] bg-purple-900/50 rounded-full blur-3xl" />

            {/* Wavy SVG Ribbon Overlay in Neon Purple */}
            <svg className="absolute inset-0 w-full h-full opacity-70" preserveAspectRatio="none" viewBox="0 0 500 500">
              <defs>
                <linearGradient id="neonPurpleGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.85" />
                </linearGradient>
                <linearGradient id="neonPurpleGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.85" />
                </linearGradient>
              </defs>
              <path
                d="M-50,200 C150,100 250,350 550,150 L550,550 L-50,550 Z"
                fill="url(#neonPurpleGrad1)"
                className="filter drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]"
              />
              <path
                d="M-50,300 C200,180 300,420 550,280 L550,550 L-50,550 Z"
                fill="url(#neonPurpleGrad2)"
                className="filter drop-shadow-[0_0_35px_rgba(139,92,246,0.6)]"
              />
            </svg>
          </div>



          {/* Middle Headline Typography with Typewriter Animation */}
          <div className="relative z-20 my-auto py-8">
            {/* Typewriter Heading */}
            <AuthTypewriterHeading phrases={phrases} />

            <p className="mt-4 text-purple-200/80 text-sm max-w-sm font-sans leading-relaxed">
              Find, reserve, and navigate to available mall parking spots in real-time, on the go.
            </p>
          </div>

          {/* Bottom Feature Badges */}
          <div className="flex items-center gap-4 text-xs text-purple-300/70 relative z-20 font-mono">
            <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-purple-400" /> 3D Mall Explorer</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><Ticket className="w-4 h-4 text-purple-400" /> Instant Reservations</span>
          </div>

        </div>

      </div>
    </div>
  );
}

