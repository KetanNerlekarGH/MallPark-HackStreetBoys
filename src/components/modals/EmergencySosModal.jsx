import React from "react";
import { PhoneCall, ShieldAlert, AlertTriangle, Ambulance, Flame, X, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmergencySosModal({ isOpen, onClose, currentMall, selectedState, selectedCity }) {
  if (!isOpen) return null;

  const handleCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in-scale">
      <div className="w-full max-w-md rounded-3xl border border-rose-500/40 bg-[#120713]/95 p-6 shadow-[0_0_50px_rgba(244,63,94,0.35)] relative overflow-hidden text-white space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-center hover:bg-rose-500/20 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.4)] shrink-0 animate-pulse">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
              Emergency Assistance
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1">SOS Control Center</h2>
          </div>
        </div>

        {/* Location Alert Badge */}
        <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-200/90 font-mono">
          <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Active Location: <strong>{currentMall?.name || "Mall Park"}</strong> ({selectedCity || "Pune"}, {selectedState || "MH"})</span>
        </div>

        {/* Emergency Hotline Buttons */}
        <div className="space-y-3 font-mono">
          
          {/* Mall Security Hotline */}
          <button
            onClick={() => handleCall("+911800555999")}
            className="w-full p-3.5 rounded-2xl border border-rose-500/50 bg-gradient-to-r from-rose-900/60 to-purple-900/60 hover:from-rose-800/80 hover:to-purple-800/80 text-white flex items-center justify-between shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all group"
          >
            <div className="flex items-center gap-3">
              <PhoneCall className="w-5 h-5 text-rose-400 group-hover:animate-bounce" />
              <div className="text-left">
                <div className="text-xs font-bold uppercase text-white">Mall Security Desk</div>
                <div className="text-[11px] text-rose-200/70">+91 1800-MALL-SOS</div>
              </div>
            </div>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-rose-500 text-white shadow-md">CALL NOW</span>
          </button>

          {/* Medical Response Team */}
          <button
            onClick={() => handleCall("102")}
            className="w-full p-3.5 rounded-2xl border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-white flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <Ambulance className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <div className="text-xs font-bold uppercase text-white">Medical Emergency / First Aid</div>
                <div className="text-[11px] text-purple-300/70">Paramedic Dispatch (102)</div>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-600 text-white">CALL 102</span>
          </button>

          {/* Fire & Safety Alarm */}
          <button
            onClick={() => handleCall("101")}
            className="w-full p-3.5 rounded-2xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-white flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <div className="text-xs font-bold uppercase text-white">Fire & Disaster Control</div>
                <div className="text-[11px] text-amber-300/70">Fire Rescue (101)</div>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-600 text-white">CALL 101</span>
          </button>

        </div>

        {/* Footer info */}
        <p className="text-[11px] text-rose-300/60 text-center font-mono">
          Pressing any helpline button automatically broadcasts your GPS and floor coordinates to control room guards.
        </p>
      </div>
    </div>
  );
}
