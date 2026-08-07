import React from "react";
import { PUNE_MALLS_DATA } from "@/data/mallsData";
import { Building2, Layers, MapPin, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function MallSelector({ selectedMall, onSelectMall }) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Pune Mall Selector</h2>
            <p className="text-xs text-muted-foreground">Select a iconic shopping center to inspect 3D structure & store layout</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PUNE_MALLS_DATA.map((mall) => {
          const isSelected = selectedMall.id === mall.id;
          return (
            <button
              key={mall.id}
              onClick={() => onSelectMall(mall)}
              className={`text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-xl ${
                isSelected
                  ? "ring-2 ring-primary shadow-md scale-[1.01]"
                  : "hover:border-primary/50 hover:bg-card/80 opacity-85 hover:opacity-100"
              }`}
            >
              <Card className={`h-full border transition-colors ${isSelected ? "border-primary bg-primary/5" : ""}`}>
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base line-clamp-1">{mall.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border shrink-0 ${mall.theme.badgeBg}`}>
                      {mall.floors.length} Floors
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
                    <span className="truncate">{mall.location}</span>
                  </div>

                  <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
                    {mall.architecturalStyle}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-xs border-t border-border/60">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      {mall.stores.length} Key Outlets
                    </span>
                    {isSelected && (
                      <span className="text-primary font-semibold flex items-center gap-1 text-[11px]">
                        <Sparkles className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </div>
  );
}
