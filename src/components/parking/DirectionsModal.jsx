import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Navigation, Layers, Box, X, MapPin, Footprints, CheckCircle2 } from "lucide-react";
import SchematicTopView2D from "@/components/parking/SchematicTopView2D";
import Floor3DView from "@/components/parking/Floor3DView";

export default function DirectionsModal({ slot, slots, selectedMall, onClose }) {
  const [viewMode, setViewMode] = useState("2d"); // "2d" | "3d"

  if (!slot) return null;

  const targetCode = slot.code || "A-103";
  const targetFloor = slot.floor || 1;
  const targetZone = slot.zone || targetCode.charAt(0) || "A";

  return (
    <Dialog open={!!slot} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[96vw] max-h-[92vh] overflow-y-auto flex flex-col rounded-3xl border-2 border-purple-500/50 bg-card dark:bg-[#0b061a] p-3 sm:p-5 backdrop-blur-2xl shadow-[0_0_60px_rgba(168,85,247,0.3)] text-foreground dark:text-white">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-border/80 dark:border-purple-900/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-600/20 text-purple-600 dark:text-purple-300 border border-purple-500/40 flex items-center justify-center font-extrabold text-base shadow-sm shrink-0">
              🎯
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                  Wayfinding
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-foreground dark:text-white mt-0.5">
                Spot <span className="text-purple-600 dark:text-purple-300 font-mono underline font-black">{targetCode}</span> · Level {targetFloor}
              </h2>
            </div>
          </div>

          {/* View Switcher Controls & Exit Button */}
          <div className="flex items-center gap-1.5 font-mono">
            <button
              onClick={() => setViewMode("2d")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "2d"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:text-foreground dark:bg-purple-950/60 dark:text-purple-300"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> <span className="hidden sm:inline">2D Blueprint</span><span className="sm:hidden">2D</span>
            </button>
            <button
              onClick={() => setViewMode("3d")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "3d"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                  : "bg-muted text-muted-foreground hover:text-foreground dark:bg-purple-950/60 dark:text-purple-300"
              }`}
            >
              <Box className="w-3.5 h-3.5" /> <span className="hidden sm:inline">3D WebGL</span><span className="sm:hidden">3D</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 transition-all cursor-pointer"
            >
              ✕ <span className="hidden sm:inline">Exit Route</span>
            </button>
          </div>
        </div>

        {/* Scrollable Map Viewport Container */}
        <div className="w-full min-h-[420px] sm:min-h-[500px] h-[65vh] sm:h-[580px] rounded-2xl overflow-x-auto overflow-y-auto border border-border dark:border-purple-900/40 bg-black/40 relative my-2 shrink-0 shadow-inner">
          {viewMode === "2d" ? (
            <SchematicTopView2D
              slots={slots || []}
              highlightCode={targetCode}
              isARGuide={true}
              selectedFloor={targetFloor}
              selectedMall={selectedMall}
            />
          ) : (
            <Floor3DView
              slots={slots || []}
              highlightCode={targetCode}
              isARGuide={true}
              selectedFloor={targetFloor}
              selectedMall={selectedMall}
            />
          )}
        </div>

        {/* Desktop Navigation Footer */}
        <div className="hidden sm:flex p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 font-mono text-xs text-foreground dark:text-purple-200 items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <Footprints className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">
              Enter via <strong>Entrance Gate (IN)</strong> → Follow corridor route to <strong>Zone {targetZone}</strong> → Park at <strong>{targetCode}</strong>.
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> Wayfinding Active
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}