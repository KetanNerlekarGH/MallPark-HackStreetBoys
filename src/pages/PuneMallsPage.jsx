import React, { useState } from "react";
import { PUNE_MALLS_DATA, getMallById } from "@/data/mallsData";
import MallSelector from "@/components/malls/MallSelector";
import FloorSelector from "@/components/malls/FloorSelector";
import Mall3DViewer from "@/components/malls/Mall3DViewer";
import { Building2, Store, MapPin, Navigation, Tag, ExternalLink, Info, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PuneMallsPage() {
  const [selectedMall, setSelectedMall] = useState(PUNE_MALLS_DATA[0]);
  const [activeFloor, setActiveFloor] = useState("all");
  const [selectedStore, setSelectedStore] = useState(null);

  const handleMallChange = (mall) => {
    setSelectedMall(mall);
    setActiveFloor("all");
    setSelectedStore(null);
  };

  const filteredStores = activeFloor === "all"
    ? selectedMall.stores
    : selectedMall.stores.filter((s) => s.floor === activeFloor);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              Pune City Architecture
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Pune 3D Malls Explorer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Interactive 3D parametric layouts and floor isolation for Phoenix Marketcity, Pavilion, & Amanora Mall.
          </p>
        </div>
      </div>

      {/* Top Selector Component */}
      <MallSelector selectedMall={selectedMall} onSelectMall={handleMallChange} />

      {/* Main 3D Interactive Viewport Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 space-y-4">
          {/* Floating Floor Selector Controls Above Canvas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <FloorSelector
              floors={selectedMall.floors}
              selectedFloor={activeFloor}
              onSelectFloor={setActiveFloor}
              mallTheme={selectedMall.theme}
            />

            <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border/60 flex items-center gap-2 shrink-0">
              <Info className="w-3.5 h-3.5 text-primary" />
              <span>Rotate, pan, & click 3D pins to inspect stores</span>
            </div>
          </div>

          {/* 3D R3F Canvas Viewer */}
          <Mall3DViewer
            selectedMall={selectedMall}
            activeFloor={activeFloor}
            onSelectStore={setSelectedStore}
            selectedStore={selectedStore}
          />
        </div>

        {/* Right Sidebar: Selected Store / Zone Inspection */}
        <div className="space-y-4">
          <Card className="border border-border shadow-md">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Store className="w-4 h-4 text-primary" />
                {selectedStore ? selectedStore.name : "Store Inspector"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {selectedStore ? (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: selectedStore.color }}
                    />
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                      {selectedStore.category}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground border-t border-b py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> Floor Level:
                      </span>
                      <span className="font-semibold text-foreground">Floor {selectedStore.floor}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Zone:
                      </span>
                      <span className="font-semibold text-foreground">{selectedStore.zone}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Prime outlet located on Level {selectedStore.floor} of {selectedMall.name}. Click directly in the 3D canvas or list to focus.
                  </p>

                  <Button size="sm" className="w-full h-8 text-xs font-medium gap-1">
                    <Navigation className="w-3.5 h-3.5" /> Get In-Mall Navigation
                  </Button>
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground space-y-2">
                  <Info className="w-8 h-8 mx-auto text-muted-foreground/50" />
                  <p className="text-xs">Click any floating 3D store pin on the layout canvas to view outlet details.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Stores List for Isolated Floor */}
          <Card className="border border-border shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>
                  {activeFloor === "all" ? "All Floor Stores" : `Floor ${activeFloor} Outlets`}
                </span>
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {filteredStores.length} Stores
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
              {filteredStores.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStore(st)}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    selectedStore?.id === st.id
                      ? "bg-primary/10 border border-primary/30 text-primary font-semibold"
                      : "hover:bg-muted/70 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: st.color }} />
                    <span className="truncate">{st.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 font-mono">F{st.floor}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
