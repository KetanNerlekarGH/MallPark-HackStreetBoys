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
          className={`h-8 text-xs font-medium flex-1 sm:flex-initial transition-all ${
            selectedFloor === "all"
              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              : "hover:bg-purple-900/10 dark:hover:bg-purple-900/20 text-muted-foreground hover:text-foreground border-purple-500/20 dark:border-purple-900/40"
          }`}
        >
          {selectedFloor === "all" ? (
            <span className="w-2 h-2 bg-white rotate-45 shrink-0 animate-[spin_4s_linear_infinite] mr-1.5 shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
          ) : (
            <span className="w-1.5 h-1.5 bg-muted-foreground rotate-45 shrink-0 mr-1.5 opacity-60" />
          )}
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
              className={`h-8 text-xs font-medium flex-1 sm:flex-initial transition-all ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  : "hover:bg-purple-900/10 dark:hover:bg-purple-900/20 text-muted-foreground hover:text-foreground border-purple-500/20 dark:border-purple-900/40"
              }`}
            >
              {isActive ? (
                <span className="w-2 h-2 bg-white rotate-45 shrink-0 animate-[spin_4s_linear_infinite] mr-1.5 shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
              ) : (
                <span className="w-1.5 h-1.5 bg-muted-foreground rotate-45 shrink-0 mr-1.5 opacity-60" />
              )}
              Floor {fl.code}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
