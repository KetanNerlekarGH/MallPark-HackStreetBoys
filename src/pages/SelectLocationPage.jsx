import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLocationContext } from "@/context/LocationContext";
import { STATES_LIST, getCitiesByState, getMallsByCity, INDIAN_MALLS_DATA } from "@/data/indianMallsData";
import { MapPin, Building2, Search, Check, Zap, Layers, Navigation, ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SelectLocationPage() {
  const navigate = useNavigate();
  const { selectedState, selectedCity, selectedMall, selectMall } = useLocationContext();

  const [activeState, setActiveState] = useState(selectedState || "Maharashtra");
  const [activeCity, setActiveCity] = useState(selectedCity || "Pune");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMallId, setActiveMallId] = useState(selectedMall?.id || "phoenix-pune");

  // Get cities available for the selected state
  const availableCities = useMemo(() => getCitiesByState(activeState), [activeState]);

  // When active state changes, auto-select its first city
  useEffect(() => {
    if (availableCities.length && !availableCities.includes(activeCity)) {
      setActiveCity(availableCities[0]);
    }
  }, [activeState, availableCities]);

  // Available malls for selected city/state OR global search term
  const availableMalls = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return INDIAN_MALLS_DATA.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.city.toLowerCase().includes(q) ||
          m.state.toLowerCase().includes(q) ||
          m.area.toLowerCase().includes(q)
      );
    }
    return getMallsByCity(activeCity, activeState);
  }, [activeState, activeCity, searchQuery]);

  // Currently selected mall object
  const currentMallObj = useMemo(() => {
    return INDIAN_MALLS_DATA.find((m) => m.id === activeMallId) || availableMalls[0] || INDIAN_MALLS_DATA[0];
  }, [activeMallId, availableMalls]);

  const handleLaunchDashboard = (targetMall) => {
    const chosen = targetMall || currentMallObj;
    if (chosen) {
      selectMall(chosen);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#05040a] text-white px-4 py-10 overflow-x-hidden select-none">
      {/* 1. Photorealistic Smart Parking Garage Background Wallpaper */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 pointer-events-none scale-105 filter blur-[1px] mix-blend-screen transition-opacity duration-700"
        style={{ backgroundImage: `url('/smart_parking_neon_bg.png')` }}
      />

      {/* 2. Ambient Spotlights & HUD Grid */}
      <div className="absolute -top-20 left-1/4 w-[750px] h-[450px] bg-purple-600/25 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute -bottom-20 right-1/4 w-[750px] h-[450px] bg-indigo-600/25 rounded-full blur-[170px] pointer-events-none" />

      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="select-loc-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-purple-500/40" />
              <rect x="5" y="5" width="20" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-400/30" />
              <rect x="35" y="5" width="20" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-400/30" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#select-loc-grid)" />
        </svg>
      </div>

      {/* Central Selection Card */}
      <div className="w-full max-w-4xl rounded-[2.5rem] border border-purple-500/35 bg-[#0a0614]/95 backdrop-blur-2xl p-6 sm:p-10 shadow-[0_0_70px_rgba(168,85,247,0.35)] relative z-10 space-y-8">
        
        {/* Top Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-mono tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Select Destination Hub
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
            Choose Your Mall Location
          </h1>
          <p className="text-purple-200/80 text-xs sm:text-sm font-sans leading-relaxed">
            Select your state and city in India to load live multi-level parking slot availability, 3D building maps, and EV charging status.
          </p>
        </div>

        {/* 3 DROPDOWNS & SEARCH BAR GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. STATE DROPDOWN */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-purple-300/80 pl-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-400" /> 1. Select State
            </label>
            <div className="relative">
              <select
                value={activeState}
                onChange={(e) => setActiveState(e.target.value)}
                className="w-full appearance-none h-12 px-4 pr-10 rounded-2xl border border-purple-500/40 bg-purple-950/40 text-white font-medium text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all cursor-pointer"
              >
                {STATES_LIST.map((st) => (
                  <option key={st} value={st} className="bg-[#12072e] text-white">
                    {st}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-purple-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
            </div>
          </div>

          {/* 2. CITY DROPDOWN */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-purple-300/80 pl-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-400" /> 2. Select City
            </label>
            <div className="relative">
              <select
                value={activeCity}
                onChange={(e) => setActiveCity(e.target.value)}
                className="w-full appearance-none h-12 px-4 pr-10 rounded-2xl border border-purple-500/40 bg-purple-950/40 text-white font-medium text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all cursor-pointer"
              >
                {availableCities.map((ct) => (
                  <option key={ct} value={ct} className="bg-[#12072e] text-white">
                    📍 {ct}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-purple-300 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-70" />
            </div>
          </div>

          {/* 3. SEARCHABLE MALL INPUT / SELECT */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-purple-300/80 pl-1 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-purple-400" /> 3. Search or Pick Mall
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type mall name (e.g. Phoenix, Orion)..."
                className="w-full h-12 px-4 pl-10 rounded-2xl border border-purple-500/40 bg-purple-950/40 text-white placeholder:text-purple-300/40 font-medium text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
              />
              <Search className="w-4 h-4 text-purple-300/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* MALL CARDS LIST & LIVE PREVIEW GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Mall Selection List */}
          <div className="md:col-span-5 space-y-2.5 max-h-80 overflow-y-auto pr-1">
            <div className="text-xs font-mono uppercase tracking-wider text-purple-300/70 mb-2 flex items-center justify-between">
              <span>Malls ({availableMalls.length})</span>
              {searchQuery && <span className="text-[11px] text-purple-400">Search results</span>}
            </div>

            {availableMalls.length === 0 ? (
              <div className="p-6 rounded-2xl border border-purple-900/40 bg-purple-950/20 text-center text-xs text-purple-300/60 font-mono">
                No malls found matching "{searchQuery}". Try selecting another city or clearing search.
              </div>
            ) : (
              availableMalls.map((m) => {
                const isSelected = currentMallObj?.id === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setActiveMallId(m.id);
                      setActiveState(m.state);
                      setActiveCity(m.city);
                    }}
                    className={`rounded-2xl border p-3 cursor-pointer transition-all duration-200 flex gap-3 relative overflow-hidden ${
                      isSelected
                        ? "border-purple-500 bg-purple-600/25 shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-[1.01]"
                        : "border-purple-900/30 bg-[#0e0722]/60 hover:border-purple-500/40 hover:bg-purple-900/20"
                    }`}
                  >
                    <img
                      src={m.image}
                      alt={m.name}
                      className="w-14 h-14 rounded-xl object-cover border border-purple-900/40 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-sm text-white truncate">{m.name}</h4>
                        {isSelected && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                      </div>
                      <p className="text-xs text-purple-300/70 font-mono truncate">{m.area}, {m.city}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-purple-300/60 font-mono">
                        <span className="flex items-center gap-1"><Layers className="w-3 h-3 text-purple-400" /> {m.totalFloors} floors</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-sky-400" /> {m.evChargingBays} EV</span>
                        <span className="font-semibold text-emerald-400">₹{m.hourlyRate}/hr</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Mall Detailed Preview Card */}
          <div className="md:col-span-7 bg-[#12072b]/90 rounded-3xl border border-purple-500/35 p-5 space-y-4 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            <div className="relative h-44 rounded-2xl overflow-hidden border border-purple-500/30 shadow-md">
              <img
                src={currentMallObj.image}
                alt={currentMallObj.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0614] via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-600/80 text-white border border-purple-400/40 backdrop-blur-md">
                    {currentMallObj.state} · {currentMallObj.city}
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-1 drop-shadow-md">{currentMallObj.name}</h3>
                </div>
                <span className="text-sm font-extrabold text-emerald-400 bg-black/60 px-3 py-1 rounded-full border border-emerald-500/40 backdrop-blur-md">
                  ₹{currentMallObj.hourlyRate}/hr
                </span>
              </div>
            </div>

            <p className="text-xs text-purple-200/80 font-sans leading-relaxed">
              {currentMallObj.description}
            </p>

            {/* Quick Specs Pills */}
            <div className="grid grid-cols-3 gap-2.5 pt-1 font-mono">
              <div className="bg-purple-950/40 rounded-xl border border-purple-500/30 p-2.5 text-center">
                <div className="text-[10px] text-purple-300/70 uppercase">Total Floors</div>
                <div className="text-sm font-bold text-white mt-0.5">{currentMallObj.totalFloors} Levels</div>
              </div>
              <div className="bg-purple-950/40 rounded-xl border border-purple-500/30 p-2.5 text-center">
                <div className="text-[10px] text-purple-300/70 uppercase">Slot Capacity</div>
                <div className="text-sm font-bold text-purple-200 mt-0.5">{currentMallObj.totalSlots} Bays</div>
              </div>
              <div className="bg-purple-950/40 rounded-xl border border-purple-500/30 p-2.5 text-center">
                <div className="text-[10px] text-purple-300/70 uppercase">EV Fast Charger</div>
                <div className="text-sm font-bold text-sky-400 mt-0.5">{currentMallObj.evChargingBays} Ports</div>
              </div>
            </div>

            {/* Launch Dashboard Button */}
            <Button
              onClick={() => handleLaunchDashboard(currentMallObj)}
              className="w-full h-12 font-bold text-sm rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-[0_0_25px_rgba(168,85,247,0.45)] hover:shadow-[0_0_35px_rgba(192,132,252,0.65)] transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
            >
              <span>Launch Dashboard for {currentMallObj.name}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

        </div>

      </div>
    </div>
  );
}
