import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X, PhoneCall, CarFront, Car, ShieldAlert, Sparkles, Building2, ChevronRight, LogOut } from "lucide-react";
import { useLocationContext } from "@/context/LocationContext";
import EmergencySosModal from "@/components/modals/EmergencySosModal";
import ValetParkingModal from "@/components/modals/ValetParkingModal";
import FindMyCarModal from "@/components/modals/FindMyCarModal";
import { Link } from "react-router-dom";

export default function HamburgerMenuDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'sos' | 'valet' | 'find-car' | null
  const { selectedState, selectedCity, selectedMall } = useLocationContext();

  const drawerContent = (
    <>
      {/* Slide-out Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[9999] bg-black/60 dark:bg-black/90 backdrop-blur-md transition-opacity duration-300"
        />
      )}

      {/* Slide-out Drawer Panel (From Left) - Adapts to Light and Dark Themes */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-[10000] w-80 max-w-[85vw] bg-card text-foreground dark:bg-[#090414] dark:text-white border-r border-border dark:border-purple-500/50 p-6 shadow-2xl transition-transform duration-300 ease-out flex flex-col justify-between ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="relative z-10 space-y-6">

          {/* Top Brand Header & Close Button */}
          <div className="flex items-center justify-between border-b border-border dark:border-purple-900/40 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-purple-900/20 dark:bg-[#170a35] border border-purple-500/50 p-1 flex items-center justify-center shadow-[0_0_18px_rgba(168,85,247,0.4)]">
                <img
                  src="/logo.png"
                  alt="MallPark Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(168,85,247,0.6)]"
                />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-foreground dark:text-white">
                MallPark
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 flex items-center justify-center hover:bg-purple-500/20 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mall Location Status Pill */}
          <div className="p-3 rounded-2xl bg-purple-500/10 dark:bg-purple-950/40 border border-purple-500/30 font-mono text-xs text-foreground dark:text-purple-200/90 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <div className="truncate">
              <div className="text-[10px] text-muted-foreground dark:text-purple-300/60 uppercase font-semibold">You are at</div>
              <div className="font-bold text-foreground dark:text-white truncate">{selectedMall?.name || "Phoenix Marketcity"}</div>
            </div>
          </div>

          {/* QUICK FEATURES SECTION */}
          <div className="space-y-3 font-mono">
            <div className="text-[11px] text-muted-foreground dark:text-purple-300/60 uppercase tracking-widest pl-1 font-bold">
              Quick Smart Features
            </div>

            {/* 1. EMERGENCY SOS CALL FEATURE */}
            {/* 1. EMERGENCY SOS CALL FEATURE */}
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveModal("sos");
              }}
              className="w-full p-4 rounded-2xl border border-rose-200 dark:border-rose-500/40 bg-rose-50/90 dark:bg-gradient-to-r dark:from-[#2d0e19] dark:via-[#1c0812] dark:to-[#17050e] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between group shadow-sm hover:shadow-lg dark:shadow-[0_0_20px_rgba(244,63,94,0.15)] dark:hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-400/50 text-rose-600 dark:text-rose-300 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.25)] group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-5 h-5 text-rose-500 dark:text-rose-300" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    Emergency Call
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  </div>
                  <div className="text-xs text-rose-600 dark:text-rose-300/90 font-medium mt-0.5">SOS Security & Helpline</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-rose-500 dark:text-rose-400 group-hover:translate-x-1.5 transition-transform" />
            </button>

            {/* 2. VALET PARKING SERVICE FEATURE */}
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveModal("valet");
              }}
              className="w-full p-4 rounded-2xl border border-purple-200 dark:border-purple-500/40 bg-purple-50/90 dark:bg-gradient-to-r dark:from-[#230d36] dark:via-[#160724] dark:to-[#0f041b] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between group shadow-sm hover:shadow-lg dark:shadow-[0_0_20px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-400/50 text-purple-600 dark:text-purple-300 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.25)] group-hover:scale-105 transition-transform">
                  <CarFront className="w-5 h-5 text-purple-500 dark:text-purple-300" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Valet Parking</div>
                  <div className="text-xs text-purple-600 dark:text-purple-300/90 font-medium mt-0.5">VIP Concierge &amp; Pickup</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-purple-500 dark:text-purple-300 group-hover:translate-x-1.5 transition-transform" />
            </button>

            {/* 3. FIND MY CAR FEATURE */}
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveModal("find-car");
              }}
              className="w-full p-4 rounded-2xl border border-sky-200 dark:border-sky-500/40 bg-sky-50/90 dark:bg-gradient-to-r dark:from-[#0d2238] dark:via-[#081524] dark:to-[#050f1a] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between group shadow-sm hover:shadow-lg dark:shadow-[0_0_20px_rgba(56,189,248,0.15)] dark:hover:shadow-[0_0_30px_rgba(56,189,248,0.3)] cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/50 text-sky-600 dark:text-sky-300 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.25)] group-hover:scale-105 transition-transform">
                  <Car className="w-5 h-5 text-sky-500 dark:text-sky-300" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Find My Car</div>
                  <div className="text-xs text-sky-600 dark:text-sky-300/90 font-medium mt-0.5">Active Parking Locator</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-sky-500 dark:text-sky-400 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>

          {/* Quick Nav Section */}
          <div className="space-y-2 pt-2 border-t border-border dark:border-purple-900/40 font-mono text-xs">
            <Link
              to="/select-location"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-muted dark:bg-purple-500/10 hover:bg-accent dark:hover:bg-purple-500/20 text-foreground dark:text-purple-200 transition-colors font-medium"
            >
              <span>📍 Switch State / City / Mall</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="relative z-10 pt-4 border-t border-border dark:border-purple-900/40 text-center font-mono text-[11px] text-muted-foreground dark:text-purple-300/50">
          Built By the Hackstreet Boys
        </div>
      </div>

      {/* Feature Modals */}
      <EmergencySosModal
        isOpen={activeModal === "sos"}
        onClose={() => setActiveModal(null)}
        currentMall={selectedMall}
        selectedState={selectedState}
        selectedCity={selectedCity}
      />

      <ValetParkingModal
        isOpen={activeModal === "valet"}
        onClose={() => setActiveModal(null)}
        currentMall={selectedMall}
      />

      <FindMyCarModal
        isOpen={activeModal === "find-car"}
        onClose={() => setActiveModal(null)}
        currentMall={selectedMall}
      />
    </>
  );

  return (
    <>
      {/* Top-Left Hamburger Icon Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open Quick Features Menu"
        className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-950/40 border border-purple-500/30 text-purple-600 dark:text-purple-300 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.25)] hover:bg-purple-500/20 dark:hover:bg-purple-900/50 hover:scale-105 transition-all shrink-0 cursor-pointer"
      >
        <Menu className="w-5 h-5 stroke-[2.2]" />
      </button>

      {/* Render Slide-out Drawer Panel via React Portal directly into document.body */}
      {typeof document !== "undefined" && createPortal(drawerContent, document.body)}
    </>
  );
}
