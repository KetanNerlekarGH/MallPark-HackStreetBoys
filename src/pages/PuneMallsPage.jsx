import React, { useState, useMemo } from "react";
import { PUNE_MALLS_DATA } from "@/data/mallsData";
import MallFloorPlan2D from "@/components/malls/MallFloorPlan2D";
import { Building2, Store, MapPin, Navigation, Info, Layers, Clock, Phone, Tag, Car, ShieldCheck, Sparkles, Globe, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocationContext } from "@/context/LocationContext";
import { useNavigate } from "react-router-dom";

export default function PuneMallsPage() {
  const { selectedState, selectedCity, selectedMall: contextMall } = useLocationContext();
  const [activeFloor, setActiveFloor] = useState("G");
  const [selectedStore, setSelectedStore] = useState(null);
  const navigate = useNavigate();

  // Selected Mall context lookup
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
      };
    }
    return {
      ...PUNE_MALLS_DATA[0],
      name: contextMall.name,
      location: `${contextMall.area || contextMall.city}, ${contextMall.state}`,
      image: contextMall.image || PUNE_MALLS_DATA[0].image,
    };
  }, [contextMall]);

  const floorsList = [
    { id: "G", label: "Ground Floor (G)", title: "Floor G Outlets" },
    { id: "F1", label: "Level 1 (F1)", title: "Floor 1 Outlets" },
    { id: "F2", label: "Level 2 (F2)", title: "Floor 2 Outlets" },
    { id: "F3", label: "Level 3 (F3)", title: "Floor 3 Outlets" },
  ];

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
          Architectural 2D blueprint layout, floorwise outlet directory, and interactive in-mall store wayfinding for <strong className="text-white">{selectedMall.name}</strong> ({selectedMall.location}).
        </p>
      </div>

      {/* Main Interactive Blueprint & Inspector Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 space-y-4">
          {/* Floor Level Switcher Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d071e]/90 p-2 rounded-2xl border border-purple-500/30 backdrop-blur-xl">
            <div className="flex items-center gap-2 font-mono">
              <Layers className="w-4 h-4 text-purple-400 ml-2" />
              <span className="text-xs font-bold text-purple-200 mr-2">SELECT FLOOR:</span>
              {floorsList.map((fl) => (
                <button
                  key={fl.id}
                  onClick={() => {
                    setActiveFloor(fl.id);
                    setSelectedStore(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeFloor === fl.id
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_18px_rgba(168,85,247,0.45)]"
                      : "bg-purple-950/40 text-purple-300 hover:bg-purple-900/40 hover:text-white border border-purple-500/20"
                  }`}
                >
                  {fl.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-purple-300/80 bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-500/30 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-sky-400" />
              <span>Tap any store zone to highlight &amp; trigger AR wayfinding route</span>
            </div>
          </div>

          {/* Interactive 2D Blueprint Canvas Viewer */}
          <MallFloorPlan2D
            selectedFloor={activeFloor}
            selectedStore={selectedStore}
            onSelectStore={setSelectedStore}
          />
        </div>

        {/* Right Sidebar: Selected Store / Outlet Directory Inspector */}
        <div className="space-y-4 font-mono">
          <Card className="border border-purple-500/40 bg-[#0d071e]/95 text-white shadow-[0_0_30px_rgba(168,85,247,0.15)]">
            <CardHeader className="pb-3 border-b border-purple-500/20">
              <CardTitle className="text-sm font-extrabold flex items-center gap-2 text-purple-200">
                <Store className="w-4 h-4 text-purple-400" />
                {selectedStore ? selectedStore.name : "Outlet Inspector"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {selectedStore ? (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: selectedStore.color }}
                      />
                      <span className="text-xs font-extrabold text-white">
                        {selectedStore.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Floor {selectedStore.floor}
                    </span>
                  </div>

                  <p className="text-xs text-purple-200/80 leading-relaxed font-sans">
                    {selectedStore.description}
                  </p>

                  <div className="space-y-2 text-xs text-purple-300/80 border-t border-b border-purple-500/20 py-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-purple-300">
                        <Tag className="w-3.5 h-3.5 text-purple-400" /> Category:
                      </span>
                      <span className="font-bold text-white">{selectedStore.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-purple-300">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" /> Zone:
                      </span>
                      <span className="font-bold text-white">{selectedStore.zone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-purple-300">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Hours:
                      </span>
                      <span className="font-bold text-emerald-400">{selectedStore.hours}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-purple-300">
                        <Phone className="w-3.5 h-3.5 text-purple-400" /> Contact:
                      </span>
                      <span className="font-mono text-white">{selectedStore.phone}</span>
                    </div>
                  </div>

                  {selectedStore.offers && selectedStore.offers.length > 0 && (
                    <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/30 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                        <Sparkles className="w-3.5 h-3.5" /> Special Store Offers
                      </div>
                      <ul className="space-y-1 text-[11px] text-purple-200/90 font-sans pl-1">
                        {selectedStore.offers.map((off, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="text-purple-400">•</span> {off}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-2 pt-1">
                    {selectedStore.website && (
                      <Button
                        onClick={() => window.open(selectedStore.website, "_blank", "noopener,noreferrer")}
                        className="w-full h-10 font-bold text-xs rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                      >
                        <Globe className="w-4 h-4 text-sky-400" /> Visit {selectedStore.name} Website 🌐 <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                      </Button>
                    )}

                    <Button
                      onClick={() => navigate("/")}
                      variant="outline"
                      className="w-full h-9 font-bold text-xs rounded-xl border-purple-500/40 bg-purple-950/40 text-purple-200 hover:bg-purple-900/40 flex items-center justify-center gap-2"
                    >
                      <Car className="w-3.5 h-3.5 text-amber-400" /> Book Parking Near This Store
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-purple-300/60 space-y-3">
                  <Info className="w-10 h-10 mx-auto text-purple-500/40" />
                  <p className="text-xs max-w-xs mx-auto font-sans leading-relaxed">
                    Tap any store zone on the 2D blueprint floor plan canvas to inspect store details &amp; view AR walking path.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
