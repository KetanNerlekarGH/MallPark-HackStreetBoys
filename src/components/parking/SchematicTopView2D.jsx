import React, { useEffect, useRef, useState, useMemo } from "react";
import { Layers, ShieldCheck, Car, Play, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import VehicleAnimationOverlay from "@/components/parking/VehicleAnimationOverlay";
import { useVehicleSimulation } from "@/hooks/useVehicleSimulation";
import { useToast } from "@/components/ui/use-toast";

export default function SchematicTopView2D({ slots = [], highlightCode, onSelect, onSlotStateChange }) {
  const canvasRef = useRef(null);
  const { toast } = useToast();
  const [selectedSlotCode, setSelectedSlotCode] = useState(highlightCode || null);
  const [autoTraffic, setAutoTraffic] = useState(true);

  // Initialize 2D Vehicle Simulation hook
  const { vehicles, simulateCarTrip, clearVehicles } = useVehicleSimulation({
    onSlotStateChange,
    autoSimulate: autoTraffic,
  });

  // Map slots array to slot map lookup by slot code
  const slotsByCode = useMemo(() => {
    const map = {};
    slots.forEach((s) => {
      map[s.code] = s;
    });
    return map;
  }, [slots]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = (canvas.width = 1000);
    const height = (canvas.height = 1000);

    // Clear Canvas Background
    ctx.clearRect(0, 0, width, height);

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
    ctx.fillText("RAMP UP TO SECOND FLOOR ⬅️", 110, 115);
    ctx.fillText("RAMP UP TO SECOND FLOOR ➡️", 110, 160);

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
    ctx.fillText("& STAIRCASE 🛗", 725, 215);

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
    ctx.fillText("ENTRANCE & EXIT GATE ⬆️ ⬇️", 235, 920);

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
    ctx.fillText("PEDESTRIAN SAFETY WALKWAY 🚶‍♂️", 480, 835);

    // ==========================================
    // DRAW PARKING SLOTS (ZONE A, B, C)
    // ==========================================
    const slotCoords = {
      // Zone A (Left vertical column)
      "A-101": { x: 140, y: 340 }, "A-102": { x: 140, y: 400 }, "A-103": { x: 140, y: 460 },
      "A-106": { x: 140, y: 520 }, "A-107": { x: 140, y: 580 }, "A-108": { x: 140, y: 640 },
      "A-109": { x: 140, y: 700 }, "A-110": { x: 140, y: 760 },

      // Zone B (Middle double island)
      "B-111": { x: 440, y: 340 }, "B-112": { x: 440, y: 400 }, "B-113": { x: 440, y: 460 },
      "B-114": { x: 440, y: 520 }, "B-115": { x: 440, y: 580 }, "B-116": { x: 570, y: 520 },
      "B-117": { x: 570, y: 580 }, "B-118": { x: 570, y: 640 }, "B-119": { x: 570, y: 700 },
      "B-120": { x: 570, y: 760 },

      // Zone C (Right vertical column)
      "C-121": { x: 880, y: 280 }, "C-122": { x: 880, y: 340 }, "C-123": { x: 880, y: 400 },
      "C-124": { x: 880, y: 460 }, "C-126": { x: 880, y: 520 }, "C-127": { x: 880, y: 580 },
      "C-128": { x: 880, y: 640 }, "C-129": { x: 880, y: 700 }, "C-130": { x: 880, y: 760 },
    };

    // Zone A Border & Header
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.strokeRect(85, 300, 110, 520);
    ctx.fillStyle = "#ffffff";
    ctx.font = "black 18px monospace";
    ctx.fillText("ZONE A", 240, 550);

    // Zone B Red Perimeter Border & Header
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.strokeRect(385, 300, 250, 520);
    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("PEDESTRIAN WALKWAYS", 440, 290);
    ctx.fillStyle = "#ffffff";
    ctx.font = "black 18px monospace";
    ctx.fillText("ZONE B", 480, 550);

    // Zone C Border & Header
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.strokeRect(835, 240, 100, 580);
    ctx.fillStyle = "#ffffff";
    ctx.font = "black 18px monospace";
    ctx.fillText("ZONE C", 690, 550);

    // Render individual slots
    Object.entries(slotCoords).forEach(([code, coord]) => {
      const normalizedCode = code.toUpperCase();
      const slotData = slotsByCode[normalizedCode] || slotsByCode[code] || { status: "available" };
      const isSelected = selectedSlotCode === code;

      // Spot is OCCUPIED only when a car is physically PARKED inside it or status is set to occupied
      const isParkedVehicleInSpot = vehicles.some(
        (v) => (v.slotId === code || v.slotId === normalizedCode) && v.phase === "PARKED"
      );

      const isHandicapped = normalizedCode === "A-101" || normalizedCode === "A-102" || slotData.is_handicapped;
      const isOccupied = isParkedVehicleInSpot || slotData.status === "occupied";
      const isReserved = slotData.status === "reserved" || isHandicapped;

      const slotW = 90;
      const slotH = 52;
      const x = coord.x - slotW / 2;
      const y = coord.y - slotH / 2;

      // Slot Box Background & Stroke Colors
      if (isReserved) {
        // Bright AMBER / YELLOW for Reserved slots (User finishes reservation)
        ctx.fillStyle = "rgba(245, 158, 11, 0.35)";
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = isSelected ? 3.5 : 2;
      } else if (isOccupied) {
        // Bright NEON RED for Occupied slots (Car inside spot)
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

      // Selected ring highlight without purple background
      if (isSelected) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x - 2, y - 2, slotW + 4, slotH + 4);
      }

      // Slot Code Text & Handicapped Wheelchair Depiction
      ctx.fillStyle = isReserved ? "#fde68a" : isOccupied ? "#fca5a5" : "#6ee7b7";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (isHandicapped) {
        ctx.fillText(`♿ ${code}`, coord.x, coord.y);
      } else {
        ctx.fillText(code, coord.x, coord.y);
      }
    });

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }, [selectedSlotCode, slotsByCode, vehicles]);

  // Handle canvas click to select slot
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 1000 / rect.width;
    const scaleY = 1000 / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const slotCoords = {
      "A-101": { x: 140, y: 340 }, "A-102": { x: 140, y: 400 }, "A-103": { x: 140, y: 460 },
      "A-106": { x: 140, y: 520 }, "A-107": { x: 140, y: 580 }, "A-108": { x: 140, y: 640 },
      "A-109": { x: 140, y: 700 }, "A-110": { x: 140, y: 760 },
      "B-111": { x: 440, y: 340 }, "B-112": { x: 440, y: 400 }, "B-113": { x: 440, y: 460 },
      "B-114": { x: 440, y: 520 }, "B-115": { x: 440, y: 580 }, "B-116": { x: 570, y: 520 },
      "B-117": { x: 570, y: 580 }, "B-118": { x: 570, y: 640 }, "B-119": { x: 570, y: 700 },
      "B-120": { x: 570, y: 760 }, "C-121": { x: 880, y: 280 }, "C-122": { x: 880, y: 340 },
      "C-123": { x: 880, y: 400 }, "C-124": { x: 880, y: 460 }, "C-126": { x: 880, y: 520 },
      "C-127": { x: 880, y: 580 }, "C-128": { x: 880, y: 640 }, "C-129": { x: 880, y: 700 },
      "C-130": { x: 880, y: 760 },
    };

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

      const isHandicapped = normalizedCode === "A-101" || normalizedCode === "A-102" || slotData.is_handicapped;
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
      const slotObj = slotsByCode[normalizedCode] || slotsByCode[found] || {
        id: found,
        code: found,
        floor: 1,
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
            <h3 className="text-base font-extrabold text-white tracking-tight">FIRST FLOOR PLAN BLUEPRINT MAP</h3>
            <p className="text-[11px] text-purple-200/70 font-sans">Architectural 2D Schematic · Non-Blocking Vehicle Overlay Simulation</p>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => simulateCarTrip("B-120")}
            className="rounded-full border-purple-500/40 bg-purple-950/50 text-purple-200 hover:bg-purple-900/60 text-xs font-semibold flex items-center gap-1.5"
          >
            <Car className="w-3.5 h-3.5 text-purple-400" />
            Simulate B-120 Trip
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setAutoTraffic(!autoTraffic)}
            className="rounded-full border-purple-500/40 bg-purple-950/50 text-purple-200 hover:bg-purple-900/60 text-xs font-semibold flex items-center gap-1.5"
          >
            <Play className={`w-3.5 h-3.5 ${autoTraffic ? "text-emerald-400" : "text-slate-400"}`} />
            {autoTraffic ? "Auto Traffic ON" : "Auto Traffic OFF"}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={clearVehicles}
            className="rounded-full text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </Button>
        </div>
      </div>

      {/* Blueprint Map Container with Non-Blocking Overlay */}
      <div className="relative rounded-3xl border-2 border-purple-500/50 bg-[#090514] p-3 shadow-[0_0_50px_rgba(168,85,247,0.25)] overflow-hidden">
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
