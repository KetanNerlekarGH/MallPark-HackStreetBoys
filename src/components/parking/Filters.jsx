import React from "react";
import { Input } from "@/components/ui/input";
import { Search, Zap } from "lucide-react";

const types = [
  { v: "all", l: "All types" },
  { v: "car", l: "Car" },
  { v: "bike", l: "Bike" },
  { v: "suv", l: "SUV" },
];

export default function Filters({ floors, floor, setFloor, type, setType, evOnly, setEvOnly, search, setSearch }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2">
        {floors.map((f) => (
          <button
            key={f}
            onClick={() => setFloor(f)}
            className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
              String(floor) === String(f)
                ? "bg-primary text-primary-foreground border-primary dark:bg-purple-600/30 dark:text-purple-100 dark:border-purple-500/50 font-semibold shadow-sm dark:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent dark:bg-[#0f0a21] dark:border-purple-900/40 dark:text-purple-200/70 dark:hover:text-white dark:hover:border-purple-500/40 dark:hover:bg-purple-900/20"
            }`}
          >
            {f === "all" ? "Full Building" : `Level ${f}`}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground dark:text-purple-400/60" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search slot"
            className="pl-9 w-40 rounded-full border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring dark:border-purple-900/40 dark:bg-[#0f0a21] dark:text-purple-100 dark:placeholder:text-purple-300/40 dark:focus:border-purple-500 dark:focus:ring-purple-500 text-xs h-10"
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="h-10 rounded-full border border-border bg-card text-foreground dark:border-purple-900/40 dark:bg-[#0f0a21] px-4 text-xs dark:text-purple-100 focus:border-ring focus:outline-none cursor-pointer"
        >
          {types.map((t) => (
            <option key={t.v} value={t.v} className="bg-card text-foreground dark:bg-[#0e091b] dark:text-purple-100">{t.l}</option>
          ))}
        </select>
        <button
          onClick={() => setEvOnly(!evOnly)}
          className={`h-10 px-4 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-all ${
            evOnly
              ? "bg-sky-500/20 text-sky-500 border-sky-500/50 shadow-sm dark:text-sky-400 dark:shadow-[0_0_12px_rgba(56,189,248,0.3)]"
              : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent dark:bg-[#0f0a21] dark:border-purple-900/40 dark:text-purple-200/70 dark:hover:text-white dark:hover:border-purple-500/40 dark:hover:bg-purple-900/20"
          }`}
        >
          <Zap className="w-3.5 h-3.5" /> EV
        </button>
      </div>
    </div>
  );
}