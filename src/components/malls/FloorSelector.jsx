import React from "react";
import { Layers, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FloorSelector({ floors, selectedFloor, onSelectFloor, mallTheme }) {
  return (
    <div className="bg-card/90 backdrop-blur-md border border-border/80 p-2.5 rounded-xl shadow-lg space-y-2 text-foreground w-full sm:w-auto">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-primary" />
          <span>Floor Isolator</span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {selectedFloor === "all" ? "Viewing Full Mall" : `Isolating Floor ${selectedFloor}`}
        </span>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap gap-1.5">
        <Button
          variant={selectedFloor === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectFloor("all")}
          className="h-8 text-xs font-medium gap-1.5 flex-1 sm:flex-initial"
        >
          <Layers className="w-3.5 h-3.5" />
          All Floors
        </Button>

        {floors.map((fl) => {
          const isActive = selectedFloor === fl.id;
          return (
            <Button
              key={fl.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectFloor(fl.id)}
              className={`h-8 text-xs font-medium gap-1 flex-1 sm:flex-initial transition-all ${
                isActive ? "shadow-sm font-bold" : "hover:bg-muted"
              }`}
            >
              <Eye className={`w-3 h-3 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
              Floor {fl.code}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
