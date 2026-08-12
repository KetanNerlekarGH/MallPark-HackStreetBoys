import React, { useEffect, useRef, useState, useMemo } from "react";
import { MALL_FLOOR_STORES } from "@/data/mallStoreLayoutData";
import { Layers, Navigation, Store, Clock, Phone, Tag, ShieldCheck, Zap, Info, MapPin, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MallFloorPlan2D({
  selectedFloor = "G",
  selectedStore,
  onSelectStore,
}) {
  const canvasRef = useRef(null);
  const [hoveredStore, setHoveredStore] = useState(null);
  const [activeARRoute, setActiveARRoute] = useState(null);

  const floorStores = useMemo(() => {
    return MALL_FLOOR_STORES[selectedFloor] || MALL_FLOOR_STORES["G"];
  }, [selectedFloor]);

  // Sync selectedStore prop to AR route if provided
  useEffect(() => {
    if (selectedStore) {
      setActiveARRoute(selectedStore.id);
    }
  }, [selectedStore]);

  // Render Blueprint Map Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 1000 * dpr;
    canvas.height = 900 * dpr;
    ctx.scale(dpr, dpr);

    // 1. Blueprint Grid Background (#080516)
    ctx.fillStyle = "#080516";
    ctx.fillRect(0, 0, 1000, 900);

    // Subtle Blueprint Grid Lines
    ctx.strokeStyle = "rgba(168, 85, 247, 0.07)";
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < 1000; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 900);
      ctx.stroke();
    }
    for (let y = 0; y < 900; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1000, y);
      ctx.stroke();
    }

    // 2. Outer Chamfered Architectural Boundary Wall (x: 70, y: 150, w: 860, h: 700)
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 4;
    ctx.fillStyle = "rgba(15, 10, 35, 0.7)";

    ctx.beginPath();
    ctx.moveTo(110, 150);
    ctx.lineTo(890, 150);
    ctx.lineTo(930, 190);
    ctx.lineTo(930, 810);
    ctx.lineTo(890, 850);
    ctx.lineTo(110, 850);
    ctx.lineTo(70, 810);
    ctx.lineTo(70, 190);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Inner Architectural Corridor Wall Lines
    ctx.strokeStyle = "rgba(168, 85, 247, 0.25)";
    ctx.lineWidth = 2;
    ctx.strokeRect(85, 165, 830, 670);

    // 3. Central Octagonal Atrium (x: 350 to 650, y: 350 to 550)
    ctx.fillStyle = "rgba(23, 15, 52, 0.85)";
    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(400, 360);
    ctx.lineTo(600, 360);
    ctx.lineTo(670, 420);
    ctx.lineTo(670, 480);
    ctx.lineTo(600, 540);
    ctx.lineTo(400, 540);
    ctx.lineTo(330, 480);
    ctx.lineTo(330, 420);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Atrium Text Label
    ctx.fillStyle = "rgba(216, 180, 254, 0.6)";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("CENTRAL ATRIUM", 500, 450);

    // Information Desk Box
    ctx.fillStyle = "rgba(168, 85, 247, 0.3)";
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 1.5;
    ctx.fillRect(580, 480, 80, 40);
    ctx.strokeRect(580, 480, 80, 40);
    ctx.fillStyle = "#e9d5ff";
    ctx.font = "bold 9px sans-serif";
    ctx.fillText("INFO DESK", 620, 500);

    // 4. Doors & Entrances
    // Bottom Main Entrance
    ctx.fillStyle = "#080516";
    ctx.fillRect(450, 846, 100, 8);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(450, 850, 20, -Math.PI / 2, 0);
    ctx.arc(550, 850, 20, Math.PI, -Math.PI / 2);
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("MAIN ENTRANCE", 500, 875);

    // Left Main Entrance
    ctx.fillStyle = "#080516";
    ctx.fillRect(66, 450, 8, 100);
    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 10px sans-serif";
    ctx.save();
    ctx.translate(45, 500);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("MAIN ENTRANCE", 0, 0);
    ctx.restore();

    // Top Secondary Exit
    ctx.fillStyle = "#080516";
    ctx.fillRect(450, 146, 100, 8);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("SECONDARY EXIT", 500, 135);

    // Right Secondary Exit
    ctx.fillStyle = "#080516";
    ctx.fillRect(926, 450, 8, 100);
    ctx.fillStyle = "#94a3b8";
    ctx.save();
    ctx.translate(955, 500);
    ctx.rotate(Math.PI / 2);
    ctx.fillText("SECONDARY EXIT", 0, 0);
    ctx.restore();

    // 5. Amenities & Facilities Blocks (Dark rounded boxes, no emoji white patches)
    // Male Restrooms
    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(375, 165, 110, 50, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("MALE RESTROOMS", 430, 190);

    // Female Restrooms
    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(510, 165, 120, 50, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f472b6";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("FEMALE RESTROOMS", 570, 190);

    // Family Room
    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(235, 165, 100, 50, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("FAMILY ROOM", 285, 190);

    // Security Desk Right
    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(845, 520, 75, 45, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SECURITY", 882, 542);

    // Escalators & Elevators Left & Right
    // Left Escalators/Elevators
    ctx.fillStyle = "rgba(23, 15, 52, 0.95)";
    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(160, 460, 135, 40, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e9d5ff";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ELEVATORS / ESCALATORS", 227, 480);

    // Right Escalators/Elevators
    ctx.fillStyle = "rgba(23, 15, 52, 0.95)";
    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(705, 460, 135, 40, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#e9d5ff";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ELEVATORS / ESCALATORS", 772, 480);

    // 6. Render Store Outlets for the active floor
    floorStores.forEach((st) => {
      const { bounds } = st;
      const isSelected = selectedStore?.id === st.id;
      const isHovered = hoveredStore?.id === st.id;
      const isTarget = activeARRoute === st.id || isSelected;

      // Store Room Neon Aura Glow when hovered / selected / AR route target
      if (isTarget || isHovered) {
        const cx = bounds.x + bounds.w / 2;
        const cy = bounds.y + bounds.h / 2;
        const rad = Math.max(bounds.w, bounds.h) * 0.75;

        const radialGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, rad);
        radialGlow.addColorStop(0, "rgba(56, 189, 248, 0.85)");
        radialGlow.addColorStop(0.5, st.bgFill || "rgba(168, 85, 247, 0.5)");
        radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = radialGlow;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Store Room Rectangle Box Fill & Stroke
      ctx.fillStyle = isTarget ? "rgba(15, 23, 42, 0.9)" : st.bgFill;
      ctx.strokeStyle = isTarget ? "#38bdf8" : isHovered ? "#ffffff" : st.strokeColor;
      ctx.lineWidth = isTarget ? 4.5 : isHovered ? 3 : 2;

      ctx.beginPath();
      ctx.roundRect(bounds.x, bounds.y, bounds.w, bounds.h, bounds.r || 12);
      ctx.fill();
      ctx.stroke();

      // Outer Glowing Ring when selected
      if (isTarget) {
        ctx.strokeStyle = "rgba(56, 189, 248, 0.9)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(bounds.x - 5, bounds.y - 5, bounds.w + 10, bounds.h + 10, (bounds.r || 12) + 4);
        ctx.stroke();
      }

      // Store Logo Badge Circle
      const badgeX = bounds.x + 35;
      const badgeY = bounds.y + 35;

      ctx.fillStyle = st.color;
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(st.logo, badgeX, badgeY);

      // Store Name Label
      ctx.fillStyle = "#ffffff";
      ctx.font = isTarget ? "extrabold 14px sans-serif" : "bold 13px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(st.name, bounds.x + 62, bounds.y + 35);

      // Store Category Subtitle
      ctx.fillStyle = isTarget ? "#38bdf8" : "rgba(255, 255, 255, 0.7)";
      ctx.font = "500 10px sans-serif";
      ctx.fillText(st.category, bounds.x + 62, bounds.y + 54);
    });

    // 7. AR Wayfinding Path from Main Entrance to Target Store
    const targetStoreObj = floorStores.find((st) => st.id === activeARRoute || st.id === selectedStore?.id);
    if (targetStoreObj) {
      const { bounds } = targetStoreObj;
      const targetX = bounds.x + bounds.w / 2;
      const targetY = bounds.y + bounds.h / 2;

      // 1. Wide Background Glow Line
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(500, 840);
      ctx.lineTo(500, 500);
      ctx.lineTo(targetX, 500);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      // 2. Bright Dashed Main Route Line
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 5;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      ctx.moveTo(500, 840);
      ctx.lineTo(500, 500);
      ctx.lineTo(targetX, 500);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Entrance Start Pin
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(500, 840, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = "#38bdf8";
      ctx.font = "extrabold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🚪 ENTRANCE START", 500, 822);

      // Target Store Beacon Pin
      ctx.fillStyle = "#a855f7";
      ctx.beginPath();
      ctx.arc(targetX, targetY - 35, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = "#c084fc";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`📍 ${targetStoreObj.name.toUpperCase()}`, targetX, targetY - 50);
    }
  }, [floorStores, selectedStore, hoveredStore, activeARRoute]);

  // Handle Canvas Click to Select Store
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1000 / rect.width;
    const scaleY = 900 / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const clicked = floorStores.find((st) => {
      const { bounds } = st;
      return (
        clickX >= bounds.x &&
        clickX <= bounds.x + bounds.w &&
        clickY >= bounds.y &&
        clickY <= bounds.y + bounds.h
      );
    });

    if (clicked) {
      onSelectStore(clicked);
      setActiveARRoute(clicked.id);

      // Open official website for THAT particular store in a new browser tab
      if (clicked.website) {
        window.open(clicked.website, "_blank", "noopener,noreferrer");
      }
    }
  };

  // Handle Canvas Mouse Move for Hover Highlights
  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1000 / rect.width;
    const scaleY = 900 / rect.height;
    const moveX = (e.clientX - rect.left) * scaleX;
    const moveY = (e.clientY - rect.top) * scaleY;

    const hovered = floorStores.find((st) => {
      const { bounds } = st;
      return (
        moveX >= bounds.x &&
        moveX <= bounds.x + bounds.w &&
        moveY >= bounds.y &&
        moveY <= bounds.y + bounds.h
      );
    });

    setHoveredStore(hovered || null);
    canvas.style.cursor = hovered ? "pointer" : "default";
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Top Header Outlets Summary matching reference image */}
      <div className="rounded-2xl border border-purple-500/40 bg-[#0d071e]/95 p-4 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.2)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-500/20 pb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              FLOOR {selectedFloor} OUTLETS
            </h2>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              {floorStores.length} STORES
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
            {floorStores.map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  onSelectStore(st);
                  setActiveARRoute(st.id);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                  selectedStore?.id === st.id
                    ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.5)]"
                    : "bg-purple-950/40 text-purple-200 border-purple-500/30 hover:bg-purple-900/40"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: st.color }}
                />
                <span className="font-semibold">{st.name}</span>
                <span className="text-[10px] opacity-70">F{st.floor}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Legend Key Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] text-purple-300/80 font-sans">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-400" /> Zara Flagship
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Apple Reseller
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> H&amp;M Premium
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Starbucks Reserve
            </span>
          </div>
        </div>
      </div>

      {/* Blueprint Map Container with Vector Canvas */}
      <div className="relative rounded-3xl border-2 border-purple-500/50 bg-[#080516] p-3 shadow-[0_0_50px_rgba(168,85,247,0.25)] overflow-hidden">
        {/* Floating Active AR Guide Route Banner ON THE MAP */}
        {activeARRoute && targetStoreObj && (
          <div className="absolute top-6 left-6 right-6 p-3 rounded-2xl bg-[#0e0a26]/90 border border-sky-400/60 backdrop-blur-xl flex items-center justify-between text-xs shadow-[0_0_25px_rgba(56,189,248,0.4)] z-20">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
              <span className="font-mono font-extrabold text-sky-300">
                🎯 AR STORE WAYFINDING: <span className="text-white">🚪 Main Entrance ➔ {targetStoreObj.name}</span>
              </span>
            </div>
            <button
              onClick={() => setActiveARRoute(null)}
              className="px-3 py-1 text-[11px] font-bold rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/40 transition-colors"
            >
              Clear Route
            </button>
          </div>
        )}

        {/* Canvas 2D Architectural Floor Plan */}
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          className="w-full h-auto aspect-[10/9] rounded-2xl touch-none block"
        />

        {/* Floating Instruction Banner */}
        <div className="absolute bottom-6 left-6 right-6 p-3 rounded-2xl bg-black/80 border border-purple-500/40 backdrop-blur-md flex items-center justify-between text-xs text-purple-200">
          <span className="flex items-center gap-2 font-bold text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Tap any store outlet zone to inspect details &amp; navigate
          </span>
          <span className="hidden sm:inline text-[11px] text-purple-300/70">
            Floor {selectedFloor} Directory · Interactive 2D Blueprint
          </span>
        </div>
      </div>
    </div>
  );
}
