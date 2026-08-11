import React from "react";
import SlotTile from "./SlotTile";

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
      {zones.map((zone) => (
        <div key={zone} className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-mono uppercase tracking-widest text-purple-300/80">Zone {zone}</h3>
            <div className="h-px flex-1 bg-purple-900/40" />
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
            {slots
              .filter((s) => s.zone === zone)
              .sort((a, b) => a.code.localeCompare(b.code))
              .map((s) => (
                <SlotTile key={s.id} slot={s} onSelect={onSelect} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}