import React, { useState, useMemo } from "react";
import { PUNE_MALLS_DATA } from "@/data/mallsData";
import FloorSelector from "@/components/malls/FloorSelector";
import Mall3DViewer from "@/components/malls/Mall3DViewer";
import { Building2, Store, MapPin, Navigation, Info, Layers, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocationContext } from "@/context/LocationContext";

export default function PuneMallsPage() {
  const { selectedState, selectedCity, selectedMall: contextMall } = useLocationContext();
  const [activeFloor, setActiveFloor] = useState("all");
  const [selectedStore, setSelectedStore] = useState(null);

  // Match the user's chosen mall to a 3D parametric dataset
  const selectedMall = useMemo(() => {
    if (!contextMall) return PUNE_MALLS_DATA[0];
    const nameLower = contextMall.name.toLowerCase();
    const found = PUNE_MALLS_DATA.find(
      (m) =>
        m.id.toLowerCase() === contextMall.id.toLowerCase() ||
        m.name.toLowerCase().includes(nameLower) ||
        nameLower.includes(m.name.toLowerCase())
    );
    if (found) {
      return {
        ...found,
        name: contextMall.name,
        location: `${contextMall.area || contextMall.city}, ${contextMall.state}`,
        image: contextMall.image || found.image,
        description: contextMall.description || found.description,
      };
    }
    return {
      ...PUNE_MALLS_DATA[0],
      name: contextMall.name,
      location: `${contextMall.area || contextMall.city}, ${contextMall.state}`,
      image: contextMall.image || PUNE_MALLS_DATA[0].image,
      description: contextMall.description || PUNE_MALLS_DATA[0].description,
    };
  }, [contextMall]);

  const filteredStores = useMemo(() => {
    if (activeFloor === "all") return selectedMall.stores;
    return selectedMall.stores.filter((s) => s.floor === activeFloor);
  }, [selectedMall, activeFloor]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header Banner */}
      <div className="border-b border-border/80 dark:border-purple-900/40 pb-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-300 text-[11px] font-mono tracking-widest uppercase mb-3 shadow-sm">
          <Building2 className="w-3.5 h-3.5 text-purple-500" />
          <span>{selectedState} &gt; {selectedCity} &gt; {selectedMall.name}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 dark:from-white dark:via-purple-100 dark:to-indigo-200 bg-clip-text text-transparent">
          Explore {selectedMall.name}
        </h1>
        <p className="mt-2 text-muted-foreground dark:text-purple-200/70 text-sm max-w-3xl font-sans leading-relaxed">
          Interactive 3D building layout, floor isolation, and floorwise outlet directory for <strong className="text-white">{selectedMall.name}</strong> ({selectedMall.location}).
        </p>
      </div>

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
