import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, Navigation, Sparkles } from "lucide-react";

export default function SmartSuggest({ slots, floor, onNavigate, onReserve }) {
  const suggestion = useMemo(() => {
    const free = slots
      .filter((s) => s.status === "available")
      .sort((a, b) => a.code.localeCompare(b.code));
    const ev = free.find((s) => s.is_ev);
    return ev || free[0];
  }, [slots]);

  if (!suggestion) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[2rem] p-6 md:p-8 text-white"
      style={{ background: "linear-gradient(135deg,#0b1f3a 0%,#16386b 45%,#1d5fb0 100%)" }}
    >
      <div className="absolute -top-16 -right-12 w-64 h-64 rounded-full bg-sky-400/30 blur-3xl" />
      <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-sky-200 text-xs uppercase tracking-[0.25em]">
            <Sparkles className="w-3.5 h-3.5" /> Smart suggestion
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tighter">
            Head to slot {suggestion.code}
          </h2>
          <p className="mt-2 text-sky-100/80 text-sm">
            Level {suggestion.floor} · Zone {suggestion.zone} · {suggestion.vehicle_type.toUpperCase()}
            {suggestion.is_ev && " · EV charging bay"} · ₹{suggestion.hourly_rate}/hr
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate(suggestion)}
            className="flex items-center gap-2 px-5 h-11 rounded-full bg-white text-[#0b1f3a] text-sm font-medium hover:bg-sky-50 transition-colors"
          >
            <Navigation className="w-4 h-4" /> Get directions
          </button>
          <button
            onClick={() => onReserve(suggestion)}
            className="flex items-center gap-2 px-5 h-11 rounded-full border border-white/40 text-white text-sm font-medium hover:bg-white/10 transition-colors"
          >
            <Zap className="w-4 h-4" /> Reserve
          </button>
        </div>
      </div>
    </motion.div>
  );
}