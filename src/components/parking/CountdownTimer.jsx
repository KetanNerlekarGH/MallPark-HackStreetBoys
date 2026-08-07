import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Timer } from "lucide-react";

function fmt(ms) {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function CountdownTimer() {
  const [ends, setEnds] = useState(null);
  const [slot, setSlot] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const load = async () => {
      try {
        const items = await base44.entities.Reservation.filter({ status: "active" });
        const next = items
          .map((r) => ({ r, end: new Date(r.created_date).getTime() + r.hours * 3600 * 1000 }))
          .sort((a, b) => a.end - b.end)[0];
        if (next) {
          setEnds(next.end);
          setSlot(next.r.slot_code);
        } else {
          setEnds(null);
          setSlot("");
        }
      } catch {
        setEnds(null);
      }
    };
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!ends) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [ends]);

  const remaining = ends ? ends - now : 0;
  const overdue = ends && remaining <= 0;

  return (
    <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full border bg-card/70 backdrop-blur">
      <Timer className={`w-4 h-4 ${overdue ? "text-rose-500" : ends ? "text-sky-500" : "text-muted-foreground"}`} />
      {ends ? (
        <div className="flex items-baseline gap-2">
          <span className={`font-mono text-sm font-semibold tabular-nums tracking-tight ${overdue ? "text-rose-500" : ""}`}>
            {overdue ? "OVERDUE" : fmt(remaining)}
          </span>
          <span className="text-xs text-muted-foreground">{overdue ? `pay to exit · ${slot}` : `left · ${slot}`}</span>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">No active parking</span>
      )}
    </div>
  );
}