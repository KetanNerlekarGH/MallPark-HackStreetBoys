import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Zap, RotateCw } from "lucide-react";

const styles = {
  available: "bg-gradient-to-br from-emerald-400/90 to-emerald-600/90 border-emerald-300",
  occupied: "bg-gradient-to-br from-rose-500/80 to-rose-700/80 border-rose-400",
  reserved: "bg-gradient-to-br from-amber-400/80 to-amber-600/80 border-amber-300",
};

export default function Floor3DView({ slots, highlightCode, onSelect }) {
  const [tilt, setTilt] = useState(42);
  const zones = useMemo(() => [...new Set(slots.map((s) => s.zone))].sort(), [slots]);
  const grid = useMemo(
    () =>
      zones.map((z) => ({
        zone: z,
        items: slots
          .filter((s) => s.zone === z)
          .sort((a, b) => a.code.localeCompare(b.code)),
      })),
    [slots, zones]
  );

  return (
    <div className="relative rounded-[2rem] p-6 md:p-8 overflow-hidden" style={{ background: "linear-gradient(135deg,#0b1f3a,#16386b 60%,#1d5fb0)" }}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 10%, rgba(125,211,252,.5), transparent 40%), radial-gradient(circle at 80% 90%, rgba(99,102,241,.5), transparent 40%)" }} />
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sky-200 text-xs uppercase tracking-[0.25em]">Interactive 3D view</p>
            <h3 className="text-white text-xl font-semibold tracking-tight mt-1">Floor Model — tap a free bay</h3>
          </div>
          <button
            onClick={() => setTilt((t) => (t >= 50 ? 20 : t + 6))}
            className="flex items-center gap-2 px-3 h-9 rounded-full bg-white/10 text-white text-xs hover:bg-white/20 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" /> Tilt
          </button>
        </div>

        <div className="relative" style={{ perspective: "1400px" }}>
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 transition-transform duration-500"
            style={{ transform: `rotateX(${tilt}deg) rotateZ(-2deg)`, transformStyle: "preserve-3d" }}
          >
            {grid.map(({ zone, items }) => (
              <div key={zone} className="rounded-2xl p-3 bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-sky-200 text-[11px] uppercase tracking-widest mb-2">Zone {zone}</p>
                <div className="grid grid-cols-5 gap-1.5" style={{ transform: "translateZ(8px)" }}>
                  {items.map((s) => {
                    const active = highlightCode && s.code === highlightCode;
                    const clickable = s.status === "available";
                    return (
                      <motion.button
                        key={s.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, y: active ? -6 : 0, scale: active ? 1.15 : 1 }}
                        whileHover={clickable ? { y: -4, scale: 1.1 } : {}}
                        transition={{ duration: 0.3 }}
                        disabled={!clickable}
                        onClick={() => clickable && onSelect && onSelect(s)}
                        title={`${s.code} · ${s.status}`}
                        className={`relative aspect-square rounded-md border ${styles[s.status]} ${active ? "ring-2 ring-white" : ""} ${clickable ? "cursor-pointer" : "cursor-not-allowed"}`}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {s.is_ev && <Zap className="absolute inset-0 m-auto w-2.5 h-2.5 text-sky-200" />}
                        {clickable && <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-white/70 whitespace-nowrap">{s.code}</span>}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}