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
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md transition-opacity duration-300"
        />
      )}

      {/* Slide-out Drawer Panel (From Left) - 100% Solid & Opaque via Portal */}
      <div
        style={{ backgroundColor: "#090414", opacity: 1 }}
        className={`fixed top-0 left-0 bottom-0 z-[10000] w-80 max-w-[85vw] bg-[#090414] opacity-100 border-r border-purple-500/50 p-6 shadow-[20px_0_60px_rgba(0,0,0,0.98)] text-white flex flex-col justify-between transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Solid Background Fill */}
        <div className="absolute inset-0 bg-[#090414] z-0 pointer-events-none" style={{ backgroundColor: "#090414" }} />

        <div className="relative z-10 space-y-6">

          {/* Top Brand Header & Close Button */}
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl overflow-hidden bg-purple-500/10 border border-purple-500/30 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.35)]">
                <img
                  src="/logo.png"
                  alt="MallPark Logo"
                  className="w-full h-full object-contain mix-blend-lighten"
                />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">
                MallPark
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-center hover:bg-purple-500/20 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mall Location Status Pill */}
          <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 font-mono text-xs text-purple-200/90 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="truncate">
              <div className="text-[10px] text-purple-300/60 uppercase">Selected Hub</div>
              <div className="font-bold text-white truncate">{selectedMall?.name || "Phoenix Marketcity"}</div>
            </div>
          </div>

          {/* QUICK FEATURES SECTION */}
          <div className="space-y-3 font-mono">
            <div className="text-[11px] text-purple-300/60 uppercase tracking-widest pl-1">
              Quick Smart Features
            </div>

            {/* 1. EMERGENCY SOS CALL FEATURE */}
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveModal("sos");
              }}
              className="w-full p-3.5 rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/50 via-[#1d0710]/80 to-purple-950/40 hover:border-rose-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between group shadow-[0_0_20px_rgba(244,63,94,0.15)] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.4)] group-hover:animate-bounce">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    Emergency Call
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  </div>
                  <div className="text-[10px] text-rose-300/70">SOS Security & Helpline</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* 2. VALET PARKING SERVICE FEATURE */}
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveModal("valet");
              }}
              className="w-full p-3.5 rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-950/50 via-[#170933]/80 to-indigo-950/40 hover:border-purple-400 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between group shadow-[0_0_20px_rgba(168,85,247,0.15)] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                  <CarFront className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white uppercase">Valet Parking</div>
                  <div className="text-[10px] text-purple-300/70">VIP Concierge & Pickup</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-300 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* 3. FIND MY CAR FEATURE */}
            <button
              onClick={() => {
                setIsOpen(false);
                setActiveModal("find-car");
              }}
              className="w-full p-3.5 rounded-2xl border border-sky-500/40 bg-gradient-to-r from-sky-950/40 via-[#07192a]/80 to-purple-950/40 hover:border-sky-400 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-between group shadow-[0_0_20px_rgba(14,165,233,0.15)] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center shadow-[0_0_12px_rgba(14,165,233,0.4)]">
                  <Car className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white uppercase">Find My Car</div>
                  <div className="text-[10px] text-sky-300/70">Active Parking Locator</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Quick Nav Section */}
          <div className="space-y-2 pt-2 border-t border-purple-900/40 font-mono text-xs">
            <Link
              to="/select-location"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 transition-colors"
            >
              <span>📍 Switch State / City / Mall</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

        {/* Drawer Footer */}
        <div className="relative z-10 pt-4 border-t border-purple-900/40 text-center font-mono text-[11px] text-purple-300/50">
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
