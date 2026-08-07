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
            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
              floor === f ? "bg-foreground text-background border-foreground" : "hover:bg-muted text-muted-foreground"
            }`}
          >
            Level {f}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search slot"
            className="pl-9 w-40 rounded-full"
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="h-10 rounded-full border bg-background px-4 text-sm"
        >
          {types.map((t) => (
            <option key={t.v} value={t.v}>{t.l}</option>
          ))}
        </select>
        <button
          onClick={() => setEvOnly(!evOnly)}
          className={`h-10 px-4 rounded-full border text-sm flex items-center gap-1.5 transition-colors ${
            evOnly ? "bg-sky-500 text-white border-sky-500" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Zap className="w-3.5 h-3.5" /> EV
        </button>
      </div>
    </div>
  );
}