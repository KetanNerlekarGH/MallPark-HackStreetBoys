import React, { useEffect, useRef, useState, useMemo } from "react";
import { Layers, ShieldCheck } from "lucide-react";
import VehicleAnimationOverlay from "@/components/parking/VehicleAnimationOverlay";
import { useVehicleSimulation } from "@/hooks/useVehicleSimulation";
import { useToast } from "@/components/ui/use-toast";

export default function SchematicTopView2D({ slots = [], highlightCode, isARGuide = false, onSelect, onSlotStateChange, selectedFloor = 1 }) {
  const canvasRef = useRef(null);
  const { toast } = useToast();
  const [selectedSlotCode, setSelectedSlotCode] = useState(highlightCode || null);

  useEffect(() => {
    if (highlightCode) {
      setSelectedSlotCode(highlightCode);
    }
  }, [highlightCode]);

  // Initialize 2D Vehicle Simulation hook with slots and selectedFloor for multi-floor traffic simulation
  const { vehicles } = useVehicleSimulation({
    onSlotStateChange,
    autoSimulate: true,
    slots,
    selectedFloor,
  });

  // Map slots array to slot map lookup by slot code
  const slotsByCode = useMemo(() => {
    const map = {};
    slots.forEach((s) => {
      map[s.code] = s;
    });
    return map;
  }, [slots]);

  const getFloorTitleText = (floorVal) => {
    if (floorVal === "all") return "ALL FLOORS BLUEPRINT MAP";
    const f = Number(floorVal) || 1;
    const ordinals = {
      1: "FIRST",
      2: "SECOND",
      3: "THIRD",
      4: "FOURTH",
      5: "FIFTH",
    };
    const ordName = ordinals[f] || `FLOOR ${f}`;
    return `${ordName} FLOOR PLAN BLUEPRINT MAP`;
  };

  const getRampUpText = (floorVal, direction = "left") => {
    const arrow = direction === "left" ? "⬅️" : "➡️";
    if (floorVal === "all") return `RAMP UP TO NEXT LEVEL ${arrow}`;
    const f = Number(floorVal) || 1;
    const targetFloors = {
      1: "SECOND",
      2: "THIRD",
      3: "FOURTH",
      4: "FIFTH",
      5: "ROOFTOP",
    };
    const targetName = targetFloors[f] || `FLOOR ${f + 1}`;
    return `RAMP UP TO ${targetName} FLOOR ${arrow}`;
  };

  const getSlotCoordsForFloor = (floorVal, allSlots = []) => {
    const f = floorVal === "all" ? 1 : (Number(floorVal) || 1);

    const basePositions = [
      // Zone A (Left vertical column, 8 slots)
      { zone: "A", num: 1, x: 140, y: 340 },
      { zone: "A", num: 2, x: 140, y: 400 },
      { zone: "A", num: 3, x: 140, y: 460 },
      { zone: "A", num: 6, x: 140, y: 520 },
      { zone: "A", num: 7, x: 140, y: 580 },
      { zone: "A", num: 8, x: 140, y: 640 },
      { zone: "A", num: 9, x: 140, y: 700 },
      { zone: "A", num: 10, x: 140, y: 760 },

      // Zone B (Middle double island, 10 slots)
      { zone: "B", num: 11, x: 440, y: 340 },
      { zone: "B", num: 12, x: 440, y: 400 },
      { zone: "B", num: 13, x: 440, y: 460 },
      { zone: "B", num: 14, x: 440, y: 520 },
      { zone: "B", num: 15, x: 440, y: 580 },
      { zone: "B", num: 16, x: 570, y: 520 },
      { zone: "B", num: 17, x: 570, y: 580 },
      { zone: "B", num: 18, x: 570, y: 640 },
      { zone: "B", num: 19, x: 570, y: 700 },
      { zone: "B", num: 20, x: 570, y: 760 },

      // Zone C (Right vertical column, 9 slots)
      { zone: "C", num: 21, x: 880, y: 280 },
      { zone: "C", num: 22, x: 880, y: 340 },
      { zone: "C", num: 23, x: 880, y: 400 },
      { zone: "C", num: 24, x: 880, y: 460 },
      { zone: "C", num: 26, x: 880, y: 520 },
      { zone: "C", num: 27, x: 880, y: 580 },
      { zone: "C", num: 28, x: 880, y: 640 },
      { zone: "C", num: 29, x: 880, y: 700 },
      { zone: "C", num: 30, x: 880, y: 760 },
    ];

    const coords = {};
    const floorSlots = allSlots.filter((s) => floorVal === "all" || s.floor === f);

    // Default mapping by zone & slot number for the current floor
    basePositions.forEach(({ zone, num, x, y }) => {
      const numStr = num < 10 ? `0${num}` : `${num}`;
      const code = `${zone}-${f}${numStr}`;
      coords[code] = { x, y };
    });

    // Also include any custom slot code present in floorSlots
    if (floorSlots.length > 0) {
      floorSlots.forEach((s) => {
        if (!coords[s.code]) {
          const parts = s.code.split("-");
          if (parts.length === 2) {
            const z = parts[0];
            const n = parseInt(parts[1].slice(1), 10);
            const match = basePositions.find((bp) => bp.zone === z && bp.num === n);
            if (match) {
              coords[s.code] = { x: match.x, y: match.y };
            }
          }
        }
      });
    }

    return coords;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 1000 * dpr;
    canvas.height = 1000 * dpr;
    ctx.scale(dpr, dpr);

    // Clear Canvas Background
    ctx.clearRect(0, 0, 1000, 1000);

    // ==========================================
    // DRAW ARCHITECTURAL BLUEPRINT MAP
    // ==========================================
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#475569";
    ctx.strokeRect(60, 60, 880, 880);

    // Outer Hatch / Walls
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(60, 60, 880, 880);

    // 1. TOP LEFT CURVED RAMP AREA
    ctx.beginPath();
    ctx.arc(280, 240, 160, Math.PI, 1.5 * Math.PI, false);
    ctx.lineWidth = 14;
    ctx.strokeStyle = "#334155";
    ctx.stroke();

    ctx.fillStyle = "#1e293b";
    ctx.fillRect(75, 75, 450, 120);
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.strokeRect(75, 75, 450, 120);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 13px monospace";
    ctx.fillText(getRampUpText(selectedFloor, "left"), 110, 115);
    ctx.fillText(getRampUpText(selectedFloor, "right"), 110, 160);

    // 2. TOP RIGHT ELEVATOR LOBBY & STAIRCASE
    ctx.fillStyle = "#1e1b4b";
    ctx.fillRect(680, 75, 240, 165);
    ctx.strokeStyle = "#818cf8";
    ctx.lineWidth = 3;
    ctx.strokeRect(680, 75, 240, 165);

    // Elevator Shafts with X
    ctx.strokeStyle = "#a5b4fc";
    ctx.lineWidth = 2;
    ctx.strokeRect(700, 90, 65, 65);
    ctx.beginPath();
    ctx.moveTo(700, 90); ctx.lineTo(765, 155);
    ctx.moveTo(765, 90); ctx.lineTo(700, 155);
    ctx.stroke();

    ctx.strokeRect(835, 90, 65, 65);
    ctx.beginPath();
    ctx.moveTo(835, 90); ctx.lineTo(900, 155);
    ctx.moveTo(900, 90); ctx.lineTo(835, 155);
    ctx.stroke();

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("FIRE DOOR", 775, 108);
    ctx.fillText("ELEVATOR LOBBY", 710, 195);
    ctx.fillText("& STAIRCASE", 725, 215);

    // 3. BOTTOM MAIN ENTRANCE & EXIT GATE
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(230, 875, 180, 65);
    ctx.strokeStyle = "#38bdf8";
    ctx.strokeRect(230, 875, 180, 65);

    // Ticket Kiosks
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(225, 860, 20, 30);
    ctx.fillRect(395, 860, 20, 30);

    // Barrier Arm
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(245, 880); ctx.lineTo(395, 880);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("ENTRANCE & EXIT GATE", 235, 920);

    // 4. YELLOW DASHED PEDESTRIAN WALKWAY
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 6;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(380, 845);
    ctx.lineTo(780, 845);
    ctx.lineTo(780, 250);
    ctx.lineTo(720, 250);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#fef08a";
    ctx.font = "bold 11px monospace";
    ctx.fillText("PEDESTRIAN SAFETY WALKWAY", 480, 835);

    // ==========================================
    // DRAW PARKING SLOTS (ZONE A, B, C)
    // ==========================================
    const slotCoords = getSlotCoordsForFloor(selectedFloor, slots);

    // Zone A Header Badge
    ctx.fillStyle = "rgba(15, 10, 35, 0.9)";
    ctx.strokeStyle = "#f472b6";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(90, 260, 100, 30, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#f472b6";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ZONE A", 140, 275);

    // Zone B Header Badge
    ctx.fillStyle = "rgba(15, 10, 35, 0.9)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(460, 260, 100, 30, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#38bdf8";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("ZONE B", 510, 275);

    // Zone C Header Badge
    ctx.fillStyle = "rgba(15, 10, 35, 0.9)";
    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(835, 195, 100, 30, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#c084fc";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("ZONE C", 885, 210);

    // Render individual slots
    Object.entries(slotCoords).forEach(([code, coord]) => {
      const normalizedCode = code.toUpperCase();
      const slotData = slotsByCode[normalizedCode] || slotsByCode[code] || { status: "available" };
      const targetHighlight = highlightCode ? highlightCode.toUpperCase() : null;
      const isTargetSpot = targetHighlight && (normalizedCode === targetHighlight || code.toUpperCase() === targetHighlight);
      const isSelected = isTargetSpot || selectedSlotCode === code;

      // Spot turns RED (occupied) ONLY when a car is physically PARKED inside it
      const isParkedVehicleInSpot = vehicles.some(
        (v) => (v.slotId === code || v.slotId === normalizedCode) && v.phase === "PARKED"
      );

      const isHandicapped = normalizedCode.endsWith("01") || normalizedCode.endsWith("02") || slotData.is_handicapped;
      const isOccupied = isParkedVehicleInSpot || (slotData.status === "occupied" && !vehicles.some((v) => (v.slotId === code || v.slotId === normalizedCode) && v.phase !== "PARKED"));
      const isReserved = slotData.status === "reserved" || isHandicapped;

      const slotW = 90;
      const slotH = 52;
      const x = coord.x - slotW / 2;
      const y = coord.y - slotH / 2;

      // Slot Box Background & Stroke Colors
      if (isTargetSpot) {
        // Multi-layered radial glowing aura around target spot
        const glowRad = 85;
        const radialGlow = ctx.createRadialGradient(coord.x, coord.y, 8, coord.x, coord.y, glowRad);
        radialGlow.addColorStop(0, "rgba(56, 189, 248, 0.85)"); // Intense cyan core
        radialGlow.addColorStop(0.45, "rgba(168, 85, 247, 0.55)"); // Purple mid glow
        radialGlow.addColorStop(1, "rgba(168, 85, 247, 0)"); // Fade out

        ctx.fillStyle = radialGlow;
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, glowRad, 0, Math.PI * 2);
        ctx.fill();

        // Bright Glowing Neon Purple/Cyan for AR Guide target spot
        ctx.fillStyle = "rgba(147, 51, 234, 0.85)";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 4.5;
      } else if (isReserved) {
        // Bright Vibrant YELLOW for Reserved slots
        ctx.fillStyle = "rgba(234, 179, 8, 0.45)";
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = isSelected ? 4 : 2.5;
      } else if (isOccupied) {
        // Bright NEON RED for Occupied slots
        ctx.fillStyle = "rgba(239, 68, 68, 0.45)";
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = isSelected ? 3.5 : 2;
      } else {
        // Bright EMERALD GREEN for Available / Vacant slots
        ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = isSelected ? 3.5 : 2;
      }

      ctx.fillRect(x, y, slotW, slotH);
      ctx.strokeRect(x, y, slotW, slotH);

      // Selected / AR Target ring highlight
      if (isTargetSpot) {
        ctx.strokeStyle = "rgba(56, 189, 248, 0.9)";
        ctx.lineWidth = 3.5;
        ctx.strokeRect(x - 5, y - 5, slotW + 10, slotH + 10);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 2, y - 2, slotW + 4, slotH + 4);
      } else if (isSelected) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - 2, y - 2, slotW + 4, slotH + 4);
      }

      // Slot Code Text & Reservation / Handicapped / AR Depiction
      ctx.fillStyle = isTargetSpot ? "#ffffff" : isReserved ? "#fef08a" : isOccupied ? "#fca5a5" : "#6ee7b7";
      ctx.font = isTargetSpot ? "extrabold 13px monospace" : "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (isTargetSpot) {
        ctx.fillText(`🎯 ${code}`, coord.x, coord.y);
      } else if (isHandicapped) {
        ctx.fillText(`♿ ${code}`, coord.x, coord.y);
      } else if (slotData.status === "reserved") {
        ctx.fillText(`🔒 ${code}`, coord.x, coord.y);
      } else {
        ctx.fillText(code, coord.x, coord.y);
      }
    });

    // AR Guidance Path Overlay: Drawn ONLY when AR Walking Guide is active (isARGuide or highlightCode prop)
    if (isARGuide || (highlightCode && highlightCode.length > 0)) {
      const activeTarget = highlightCode || selectedSlotCode;
      if (activeTarget) {
        const normTarget = activeTarget.toUpperCase();
        const targetCoord = slotCoords[normTarget] || slotCoords[activeTarget];
        if (targetCoord) {
          // 1. Wide Neon Glow Background Stroke
          ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.moveTo(770, 195); // Elevator Lobby Exit
          ctx.lineTo(780, 250); // Pedestrian corridor entrance
          ctx.lineTo(780, targetCoord.y); // Down corridor to target Y elevation
          ctx.lineTo(targetCoord.x, targetCoord.y); // Turn into designated spot
          ctx.stroke();

          // 2. Bright Dashed Main Path Line
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 5;
          ctx.setLineDash([12, 8]);
          ctx.beginPath();
          ctx.moveTo(770, 195);
          ctx.lineTo(780, 250);
          ctx.lineTo(780, targetCoord.y);
          ctx.lineTo(targetCoord.x, targetCoord.y);
          ctx.stroke();
          ctx.setLineDash([]);

          // Elevator Start Pin Indicator
          ctx.fillStyle = "#6366f1";
          ctx.beginPath();
          ctx.arc(770, 195, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.fillStyle = "#a5b4fc";
          ctx.font = "bold 11px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("🛗 ELEVATOR START", 770, 178);

          // Animated AR Destination Pin at target spot
          ctx.fillStyle = "#38bdf8";
          ctx.beginPath();
          ctx.arc(targetCoord.x, targetCoord.y - 38, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.fillStyle = "#38bdf8";
          ctx.font = "bold 12px monospace";
          ctx.textAlign = "center";
          ctx.fillText("📍 AR DESTINATION", targetCoord.x, targetCoord.y - 52);
        }
      }
    }

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }, [selectedSlotCode, slotsByCode, vehicles, selectedFloor, slots, highlightCode, isARGuide]);

  // Handle canvas click to select slot
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1000 / rect.width;
    const scaleY = 1000 / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const slotCoords = getSlotCoordsForFloor(selectedFloor, slots);

    let found = null;
    for (const [code, coord] of Object.entries(slotCoords)) {
      if (Math.abs(clickX - coord.x) < 45 && Math.abs(clickY - coord.y) < 26) {
        found = code;
        break;
      }
    }

    if (found) {
      const normalizedCode = found.toUpperCase();
      const slotData = slotsByCode[normalizedCode] || slotsByCode[found] || { status: "available" };
      const isParkedVehicleInSpot = vehicles.some(
        (v) => (v.slotId === found || v.slotId === normalizedCode) && v.phase === "PARKED"
      );

      const isHandicapped = normalizedCode.endsWith("01") || normalizedCode.endsWith("02") || slotData.is_handicapped;
      const isOccupied = isParkedVehicleInSpot || slotData.status === "occupied";
      const isReserved = slotData.status === "reserved";

      // 1. When user clicks on A-101 or A-102, display a message that says it's reserved only for handicapped people
      if (isHandicapped) {
        toast({
          title: `♿ Slot ${found} Reserved for Handicapped`,
          description: `Slot ${found} is reserved only for handicapped people with accessible permit badges.`,
          variant: "destructive",
        });
        return;
      }

      // 2. DO NOT let the user reserve parking spots marked in YELLOW (Reserved) or RED (Occupied)
      if (isOccupied || isReserved) {
        toast({
          title: `Slot ${found} is ${isReserved ? "Reserved" : "Occupied"}`,
          description: `Spot ${found} is marked in ${isReserved ? "Yellow (Reserved)" : "Red (Occupied)"} and cannot be booked until it turns Green.`,
          variant: "destructive",
        });
        return;
      }

      // 3. User clicks on GREEN spot (Available) -> Open ReserveDialog to reserve that spot!
      setSelectedSlotCode(found);
      const f = selectedFloor === "all" ? 1 : (Number(selectedFloor) || 1);
      const slotObj = slotsByCode[normalizedCode] || slotsByCode[found] || {
        id: found,
        code: found,
        floor: f,
        zone: found.charAt(0),
        hourly_rate: 40,
        vehicle_type: "car",
        status: "available",
      };
      onSelect(slotObj);
    }
  };

  return (
    <div className="space-y-4 font-mono">
      
      {/* Header Info Toolbar */}
      <div className="rounded-2xl border border-purple-500/40 bg-[#0d071e]/95 p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.2)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Layers className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">{getFloorTitleText(selectedFloor)}</h3>
            <p className="text-[11px] text-purple-200/70 font-sans">Architectural 2D Schematic · Non-Blocking Vehicle Overlay Simulation</p>
          </div>
        </div>

      </div>

      {/* Blueprint Map Container with Non-Blocking Overlay */}
      <div className="relative rounded-3xl border-2 border-purple-500/50 bg-[#090514] p-3 shadow-[0_0_50px_rgba(168,85,247,0.25)] overflow-hidden">
        {/* Floating Active AR Guide Route Banner ON THE MAP */}
        {(isARGuide || (highlightCode && highlightCode.length > 0)) && (
          <div className="absolute top-6 left-6 right-6 p-3 rounded-2xl bg-[#0e0a26]/90 border border-sky-400/60 backdrop-blur-xl flex items-center justify-between text-xs shadow-[0_0_25px_rgba(56,189,248,0.4)] z-20">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
              <span className="font-mono font-extrabold text-sky-300">
                🎯 AR WAYFINDING ROUTE: <span className="text-white">🛗 Main Elevator ➔ Spot {highlightCode || selectedSlotCode}</span>
              </span>
            </div>
            <button
              onClick={() => setSelectedSlotCode(null)}
              className="px-3 py-1 text-[11px] font-bold rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/40 transition-colors"
            >
              Clear Path
            </button>
          </div>
        )}

        {/* Underlay Interactive Canvas Map */}
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-auto aspect-square rounded-2xl cursor-pointer touch-none block"
        />

        {/* Non-blocking 2D Vehicle Overlay (pointer-events: none) */}
        <VehicleAnimationOverlay vehicles={vehicles} />

        {/* Floating Instruction Banner */}
        <div className="absolute bottom-6 left-6 right-6 p-3 rounded-2xl bg-black/80 border border-purple-500/40 backdrop-blur-md flex items-center justify-between text-xs text-purple-200">
          <span className="flex items-center gap-2 font-bold text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Tap any slot code to reserve & simulate car parking
          </span>
          <span className="hidden sm:inline text-[11px] text-purple-300/70">
            Active Vehicles: {vehicles.length}
          </span>
        </div>
      </div>
    </div>
  );
}
