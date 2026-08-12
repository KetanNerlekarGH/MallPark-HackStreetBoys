import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, Navigation, Sparkles } from "lucide-react";

export default function SmartSuggest({ slots, floor, onNavigate, onReserve, activeDirections }) {
  const suggestion = useMemo(() => {
    const free = slots
      .filter((s) => s.status === "available")
      .sort((a, b) => a.code.localeCompare(b.code));
    const ev = free.find((s) => s.is_ev);
    return ev || free[0];
  }, [slots]);

  if (!suggestion) return null;

  const isNavigatingThis = activeDirections && activeDirections.code === suggestion.code;

  return (
    <div className="animated-purple-border-wrapper shadow-[0_0_40px_rgba(168,85,247,0.25)] rounded-3xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[calc(1.5rem-2px)] p-6 md:p-8 text-foreground dark:text-white border-0 bg-gradient-to-r from-card via-slate-50 to-purple-50/50 dark:from-[#130b2c] dark:via-[#0d071e] dark:to-[#070312]"
      >
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-purple-600/10 dark:bg-purple-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-indigo-600/10 dark:bg-indigo-600/20 blur-3xl pointer-events-none" />
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6 z-10">
        <div>
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300 text-xs font-mono uppercase tracking-[0.25em]">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Smart Suggestion
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-foreground dark:text-white">
            Head to slot {suggestion.code}
          </h2>
          <p className="mt-2 text-muted-foreground dark:text-purple-200/70 text-sm">
            Level {suggestion.floor} · Zone {suggestion.zone} · {suggestion.vehicle_type.toUpperCase()}
            {suggestion.is_ev && " · EV charging bay"} · ₹{suggestion.hourly_rate}/hr
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate(suggestion)}
            className={`btn-shimmer-effect flex items-center gap-2 px-6 h-11 rounded-full text-sm font-semibold transition-all duration-300 ${
              isNavigatingThis
                ? "bg-rose-600 text-white shadow-[0_0_25px_rgba(244,63,94,0.55)] hover:bg-rose-700 hover:scale-[1.03]"
                : "bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.35)] dark:shadow-[0_0_25px_rgba(124,58,237,0.45)] hover:shadow-[0_0_35px_rgba(147,51,234,0.75)] hover:scale-[1.03] active:scale-[0.97]"
            }`}
          >
            {isNavigatingThis ? (
              <>✕ Quit Directions</>
            ) : (
              <><Navigation className="w-4 h-4 transition-transform group-hover:rotate-45" /> Get directions</>
            )}
          </button>
          <button
            onClick={() => onReserve(suggestion)}
            className="btn-shimmer-effect flex items-center gap-2 px-6 h-11 rounded-full border border-border dark:border-purple-500/40 bg-card dark:bg-purple-950/40 text-foreground dark:text-purple-200 text-sm font-medium hover:bg-accent dark:hover:bg-purple-900/60 hover:border-purple-400 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
          >
            <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Reserve
          </button>
        </div>
      </div>
    </motion.div>
    </div>
  );
}