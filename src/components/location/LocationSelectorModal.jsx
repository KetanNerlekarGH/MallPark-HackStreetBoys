import React, { useState, useEffect } from "react";
import { useLocationContext } from "@/context/LocationContext";
import { STATES_LIST, getCitiesByState, getMallsByCity } from "@/data/indianMallsData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Building2, Search, Check, Zap, Layers, Navigation, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LocationSelectorModal() {
  const { isModalOpen, closeLocationModal, selectedState, selectedCity, selectedMall, selectMall } = useLocationContext();

  const [activeState, setActiveState] = useState(selectedState || "Maharashtra");
  const [activeCity, setActiveCity] = useState(selectedCity || "Pune");
  const [activeMallId, setActiveMallId] = useState(selectedMall?.id || "phoenix-pune");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (selectedState) setActiveState(selectedState);
    if (selectedCity) setActiveCity(selectedCity);
    if (selectedMall) setActiveMallId(selectedMall.id);
  }, [selectedState, selectedCity, selectedMall, isModalOpen]);

  const availableCities = getCitiesByState(activeState);

  // Auto select first city if current city is not in state
  useEffect(() => {
    if (availableCities.length && !availableCities.includes(activeCity)) {
      setActiveCity(availableCities[0]);
    }
  }, [activeState]);

  const availableMalls = getMallsByCity(activeCity, activeState).filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.area.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = (mall) => {
    const target = mall || availableMalls.find((m) => m.id === activeMallId) || availableMalls[0];
    if (target) {
      selectMall(target);
      closeLocationModal();
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={closeLocationModal}>
      <DialogContent className="max-w-3xl rounded-3xl border border-border/80 dark:border-purple-900/40 bg-card dark:bg-[#0c071a] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl text-foreground dark:text-white overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.2em] text-purple-600 dark:text-purple-300 mb-1">
            <MapPin className="w-4 h-4 text-purple-500" />
            <span>Select Your Location & Mall Hub</span>
          </div>
          <DialogTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground dark:text-white">
            Where are you shopping today?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground dark:text-purple-200/70 text-sm">
            Choose your state, city, and mall to view real-time parking bay availability and 3D floor maps.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* 1. STATE SELECTOR PILLS */}
          <div>
            <label className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground dark:text-purple-300/80 mb-2.5 block">
              1. Choose State
            </label>
            <div className="flex flex-wrap gap-2">
              {STATES_LIST.map((st) => (
                <button
                  key={st}
                  onClick={() => setActiveState(st)}
                  className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                    activeState === st
                      ? "bg-primary text-primary-foreground border-primary dark:bg-purple-600 dark:text-white dark:border-purple-500 font-semibold shadow-md dark:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                      : "bg-muted/50 border-border text-muted-foreground hover:text-foreground dark:bg-[#130b2c] dark:border-purple-900/40 dark:text-purple-200/70 dark:hover:text-white dark:hover:bg-purple-900/30"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* 2. CITY SELECTOR BADGES */}
          <div>
            <label className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground dark:text-purple-300/80 mb-2.5 block">
              2. Choose City in {activeState}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCities.map((ct) => (
                <button
                  key={ct}
                  onClick={() => setActiveCity(ct)}
                  className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                    activeCity === ct
                      ? "bg-sky-500 text-white border-sky-400 font-semibold shadow-sm"
                      : "bg-muted/50 border-border text-muted-foreground hover:text-foreground dark:bg-[#130b2c] dark:border-purple-900/40 dark:text-purple-200/70 dark:hover:text-white dark:hover:bg-purple-900/30"
                  }`}
                >
                  📍 {ct}
                </button>
              ))}
            </div>
          </div>

          {/* 3. MALL CARDS CATALOG */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono font-semibold uppercase tracking-widest text-muted-foreground dark:text-purple-300/80">
                3. Malls in {activeCity} ({availableMalls.length})
              </label>

              {/* Quick Search inside modal */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter malls..."
                  className="pl-8 pr-3 py-1 text-xs rounded-full border border-border bg-card text-foreground dark:border-purple-900/40 dark:bg-[#130b2c] dark:text-purple-100 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple-500 w-36 sm:w-48"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
              {availableMalls.map((m) => {
                const isSelected = activeMallId === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setActiveMallId(m.id)}
                    className={`rounded-2xl border p-3.5 cursor-pointer transition-all duration-200 flex gap-3 relative overflow-hidden ${
                      isSelected
                        ? "border-purple-500 bg-purple-500/10 dark:bg-purple-900/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                        : "border-border/80 dark:border-purple-900/30 bg-card/60 dark:bg-[#110a26]/60 hover:border-purple-500/40 hover:bg-muted/40 dark:hover:bg-purple-900/20"
                    }`}
                  >
                    <img
                      src={m.image}
                      alt={m.name}
                      className="w-16 h-16 rounded-xl object-cover border border-border/40 dark:border-purple-900/40 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-sm text-foreground dark:text-white truncate">{m.name}</h4>
                        {isSelected && <Check className="w-4 h-4 text-purple-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground dark:text-purple-300/70 font-mono truncate">{m.area}, {m.city}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground dark:text-purple-300/60 font-mono">
                        <span className="flex items-center gap-1"><Layers className="w-3 h-3 text-purple-400" /> {m.totalFloors} levels</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-sky-400" /> {m.evChargingBays} EV</span>
                        <span className="font-semibold text-emerald-500 dark:text-emerald-400">₹{m.hourlyRate}/hr</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="mt-6 pt-4 border-t border-border/80 dark:border-purple-900/40 flex items-center justify-between">
          <div className="text-xs text-muted-foreground dark:text-purple-300/70 font-mono hidden sm:block">
            {activeState} · {activeCity}
          </div>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              onClick={closeLocationModal}
              className="rounded-full text-xs h-10 border-border dark:border-purple-900/40 text-foreground dark:text-purple-200"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleConfirm()}
              className="rounded-full text-xs h-10 px-6 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 text-white font-semibold shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)]"
            >
              Confirm & Load Parking <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
