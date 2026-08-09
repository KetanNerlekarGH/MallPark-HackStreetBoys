import React from "react";
import SlotTile from "./SlotTile";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Building2, Footprints, LogIn, LogOut, Navigation, ShieldCheck, Zap } from "lucide-react";

export default function FloorLayout({ slots, onSelect }) {
  const zones = [...new Set(slots.map((s) => s.zone))].sort();

  if (!slots.length) {
    return (
      <div className="rounded-2xl border border-dashed border-purple-900/40 p-16 text-center text-purple-300/60 font-mono text-sm bg-[#0d081c]/50">
        No slots match your filters.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* MAP ARCHITECTURAL HEADER & LEGEND BAR */}
      <div className="rounded-2xl border border-purple-500/30 bg-[#0d071e]/90 p-4 backdrop-blur-xl shadow-[0_0_25px_rgba(168,85,247,0.15)] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 text-purple-200">
          <Navigation className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-white">Interactive Floor Map Layout</span>
        </div>
        
        {/* Map Legend Items */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-purple-200/80">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <LogIn className="w-3 h-3" /> Entry Gate
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 font-semibold shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            <Building2 className="w-3 h-3 text-purple-400" /> Elevator & Lift Lobby
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <Footprints className="w-3 h-3" /> Pedestrian Path
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <LogOut className="w-3 h-3" /> Exit Gate
          </span>
        </div>
      </div>

      {/* 1. VEHICLE ENTRY GATEWAY (NORTH) */}
      <div className="relative rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-[#0a1f18]/80 to-emerald-950/40 p-3.5 flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.15)] overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-emerald-500 animate-pulse" />
        <div className="flex items-center gap-3 pl-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
            <LogIn className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white tracking-wide uppercase">VEHICLE ENTRY GATE A</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">ANPR Barrier Open</span>
            </div>
            <p className="text-[11px] text-emerald-200/70 font-mono">Main Ramp · High-Speed License Plate Sensor Active</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase">
          <span>Drive In</span>
          <ArrowRight className="w-4 h-4 animate-bounce" />
        </div>
      </div>

      {/* 2. ELEVATOR & LIFT LOBBY NODE */}
      <div className="relative rounded-2xl border-2 border-purple-500/60 bg-gradient-to-r from-[#170a36] via-[#1f0d4a] to-[#170a36] p-5 shadow-[0_0_35px_rgba(168,85,247,0.3)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.5)] shrink-0">
              <Building2 className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white tracking-tight">ELEVATORS & STAIRCASE LOBBY</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/30 text-purple-200 border border-purple-400/50 shadow-sm">
                  Direct Mall Access 🛍️
                </span>
              </div>
              <p className="text-xs text-purple-200/80 font-sans mt-0.5">
                High-speed glass elevators to Retail Stores, Food Court, & Multiplex Cinema.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-300/80 bg-purple-950/60 px-3 py-2 rounded-xl border border-purple-500/30 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Accessible Lifts & EV Chargers Priority Zone</span>
          </div>
        </div>
      </div>

      {/* 3. PARKING ZONES WITH STRIPED PEDESTRIAN CROSSWALKS */}
      <div className="space-y-8">
        {zones.map((zone, idx) => (
          <div key={zone} className="space-y-3">
            
            {/* Zone Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold flex items-center justify-center">
                  {zone}
                </div>
                <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-purple-200">
                  PARKING ZONE {zone}
                </h3>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-purple-500/40 via-purple-900/30 to-transparent" />
              <span className="text-[11px] font-mono text-purple-300/60">
                {slots.filter((s) => s.zone === zone && s.status === "available").length} bays available
              </span>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
              {slots
                .filter((s) => s.zone === zone)
                .sort((a, b) => a.code.localeCompare(b.code))
                .map((s) => (
                  <SlotTile key={s.id} slot={s} onSelect={onSelect} />
                ))}
            </div>

            {/* PEDESTRIAN WALKWAY STRIPE BETWEEN ZONES */}
            {idx < zones.length - 1 && (
              <div className="my-4 py-2 px-4 rounded-xl border border-amber-500/30 bg-amber-950/20 flex items-center justify-between text-xs font-mono text-amber-300/90 shadow-sm relative overflow-hidden">
                {/* Zebra Walkway Stripes */}
                <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(45deg,#f59e0b,#f59e0b_10px,transparent_10px,transparent_20px)]" />
                <div className="flex items-center gap-2 relative z-10">
                  <Footprints className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span className="font-semibold uppercase tracking-wider text-[11px]">PEDESTRIAN SAFETY WALKWAY</span>
                </div>
                <span className="text-[10px] text-amber-200/70 relative z-10 hidden sm:inline">
                  Walk straight to Elevator Lobby & Mall Entrance ➔
                </span>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* 4. VEHICLE EXIT GATEWAY (SOUTH) */}
      <div className="relative rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-[#1f0a10]/80 to-rose-950/40 p-3.5 flex items-center justify-between shadow-[0_0_20px_rgba(244,63,94,0.15)] overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-rose-500 animate-pulse" />
        <div className="flex items-center gap-3 pl-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)]">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white tracking-wide uppercase">EXPRESS EXIT GATE B</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">Auto FastTag Payment</span>
            </div>
            <p className="text-[11px] text-rose-200/70 font-mono">South Outflow Ramp · Automatic Toll & Ticket Settlement</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-rose-400 text-xs font-mono font-bold tracking-widest uppercase">
          <span>Exit Ramp</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}