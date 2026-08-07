import React from "react";
import SlotTile from "./SlotTile";

export default function FloorLayout({ slots, onSelect }) {
  const zones = [...new Set(slots.map((s) => s.zone))].sort();

  if (!slots.length) {
    return (
      <div className="rounded-3xl border border-dashed p-16 text-center text-muted-foreground">
        No slots match your filters.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {zones.map((zone) => (
        <div key={zone}>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">Zone {zone}</h3>
            <div className="h-px flex-1 bg-border" />
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