import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CircleParking, CarFront, Percent, Zap, MapPin, Layers, Box, LayoutGrid } from "lucide-react";
import StatCard from "@/components/parking/StatCard";
import Filters from "@/components/parking/Filters";
import FloorLayout from "@/components/parking/FloorLayout";
import ReserveDialog from "@/components/parking/ReserveDialog";
import SmartSuggest from "@/components/parking/SmartSuggest";
import Floor3DView from "@/components/parking/Floor3DView";
import SchematicTopView2D from "@/components/parking/SchematicTopView2D";
import DirectionsModal from "@/components/parking/DirectionsModal";
import { useToast } from "@/components/ui/use-toast";
import { useLocationContext } from "@/context/LocationContext";
import { useAuth } from "@/lib/AuthContext";

export default function Dashboard() {
    const { selectedState, selectedCity, selectedMall, openLocationModal } = useLocationContext();
    const { user } = useAuth();
    const username = user?.username || user?.firstName || "User";
    const mallName = selectedMall?.name || "Phoenix Marketcity";

    const [viewMode, setViewMode] = useState("2d"); // "2d" | "3d" | "grid"
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [floor, setFloor] = useState(1);
    const [type, setType] = useState("all");
    const [evOnly, setEvOnly] = useState(false);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);
    const [directions, setDirections] = useState(null);
    const { toast } = useToast();
    const mapSectionRef = React.useRef(null);

    const scrollToMapSection = () => {
        const elem = document.getElementById("map-section-container") || mapSectionRef.current;
        if (elem) {
            const topPos = elem.getBoundingClientRect().top + window.pageYOffset - 75;
            window.scrollTo({ top: Math.max(0, topPos), behavior: "smooth" });
        }
    };

    useEffect(() => {
        if (directions) {
            setTimeout(scrollToMapSection, 80);
        }
    }, [directions]);

    useEffect(() => {
        const currentMallId = selectedMall?.id || "default";
        Promise.all([
            base44.entities.ParkingSlot.list("code", 500, currentMallId),
            base44.entities.Reservation.list("-created_date", 100, currentMallId),
        ]).then(([dSlots, dReservations]) => {
            const now = Date.now();
            const activeReservedCodes = new Set();

            (dReservations || []).forEach((r) => {
                if (r.status === "active" && (!r.mall_id || r.mall_id === currentMallId)) {
                    const created = new Date(r.created_at || r.created_date || now).getTime();
                    const expiry = r.expires_at ? new Date(r.expires_at).getTime() : created + (r.hours || 2) * 3600 * 1000;
                    if (now < expiry && r.slot_code) {
                        activeReservedCodes.add(r.slot_code.toUpperCase());
                    }
                }
            });

            // Canonical 27 slots per floor matching 3D and 2D model layouts
            const canonicalSlots = [];
            const floorsToBuild = [1, 2, 3];
            const zoneASuffixes = ["01", "02", "03", "06", "07", "08", "09", "10"];
            const zoneBSuffixes = ["11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];
            const zoneCSuffixes = ["21", "22", "23", "24", "26", "27", "28", "29", "30"];

            const dbSlotsMap = new Map();
            (dSlots || []).forEach((s) => {
                if (s.code) dbSlotsMap.set(s.code.toUpperCase(), s);
            });

            floorsToBuild.forEach((fl) => {
                // Zone A: 8 spots (A-x01 and A-x02 are the ONLY 2 EV spots)
                zoneASuffixes.forEach((suf) => {
                    const code = `A-${fl}${suf}`;
                    const dbSlot = dbSlotsMap.get(code);
                    const isEV = suf === "01" || suf === "02";
                    const isReserved = activeReservedCodes.has(code);
                    canonicalSlots.push({
                        id: dbSlot?.id || code,
                        code,
                        floor: fl,
                        zone: "A",
                        vehicle_type: "car",
                        hourly_rate: selectedMall?.hourlyRate || dbSlot?.hourly_rate || 40,
                        is_ev: isEV,
                        is_handicapped: false,
                        status: isReserved ? "reserved" : dbSlot?.status === "occupied" ? "occupied" : "available",
                    });
                });

                // Zone B: 10 spots (B-x11..B-x20 symmetrical island)
                zoneBSuffixes.forEach((suf) => {
                    const code = `B-${fl}${suf}`;
                    const dbSlot = dbSlotsMap.get(code);
                    const isReserved = activeReservedCodes.has(code);
                    canonicalSlots.push({
                        id: dbSlot?.id || code,
                        code,
                        floor: fl,
                        zone: "B",
                        vehicle_type: "car",
                        hourly_rate: selectedMall?.hourlyRate || dbSlot?.hourly_rate || 40,
                        is_ev: false,
                        is_handicapped: false,
                        status: isReserved ? "reserved" : dbSlot?.status === "occupied" ? "occupied" : "available",
                    });
                });

                // Zone C: 9 spots (C-x21 and C-x22 are ♿ Handicapped)
                zoneCSuffixes.forEach((suf) => {
                    const code = `C-${fl}${suf}`;
                    const dbSlot = dbSlotsMap.get(code);
                    const isHandicapped = suf === "21" || suf === "22";
                    const isReserved = activeReservedCodes.has(code);
                    canonicalSlots.push({
                        id: dbSlot?.id || code,
                        code,
                        floor: fl,
                        zone: "C",
                        vehicle_type: "car",
                        hourly_rate: selectedMall?.hourlyRate || dbSlot?.hourly_rate || 40,
                        is_ev: false,
                        is_handicapped: isHandicapped,
                        status: isReserved ? "reserved" : dbSlot?.status === "occupied" ? "occupied" : "available",
                    });
                });
            });

            setSlots(canonicalSlots);
            setLoading(false);
        });
    }, [selectedMall]);

    const floors = useMemo(() => {
        const unique = [...new Set(slots.map((s) => s.floor))].sort((a, b) => a - b);
        return ["all", ...unique];
    }, [slots]);

    const floorSlots = useMemo(() => {
        if (floor === "all") return slots;
        return slots.filter((s) => s.floor === Number(floor));
    }, [slots, floor]);

    const visible = floorSlots.filter(
        (s) =>
            (type === "all" || s.vehicle_type === type) &&
            (!evOnly || s.is_ev) &&
            s.code.toLowerCase().includes(search.toLowerCase())
    );

    const total = floorSlots.length;
    const free = floorSlots.filter((s) => s.status === "available").length;
    const rate = total ? Math.round(((total - free) / total) * 100) : 0;
    const evTotal = floorSlots.filter((s) => s.is_ev).length;
    const evFree = floorSlots.filter((s) => s.is_ev && s.status === "available").length;

    const reserve = async ({ slot, hours, vehicleNumber, fee }) => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + hours * 3600 * 1000);
        const currentMallId = selectedMall?.id || "default";
        try {
            await base44.entities.Reservation.create({
                slot_code: slot.code,
                floor: slot.floor,
                vehicle_type: slot.vehicle_type,
                vehicle_number: vehicleNumber,
                hours,
                estimated_fee: fee,
                is_ev: !!slot.is_ev,
                status: "active",
                mall_id: currentMallId,
                mall_name: selectedMall?.name || "Mall",
                created_at: now.toISOString(),
                expires_at: expiresAt.toISOString(),
            });
            await base44.entities.ParkingSlot.update(slot.code || slot.id, { status: "reserved" }, currentMallId);
        } catch (err) {
            console.warn("Reservation API update skipped:", err);
        }

        const normalizedCode = slot.code.toUpperCase();
        setSlots((prevSlots) => {
            const exists = prevSlots.some(
                (s) => (s.id && s.id === slot.id) || s.code.toUpperCase() === normalizedCode
            );
            if (!exists) {
                return [
                    ...prevSlots,
                    {
                        id: slot.id || normalizedCode,
                        code: slot.code,
                        floor: slot.floor || 1,
                        zone: slot.zone || slot.code.charAt(0),
                        status: "reserved",
                        hourly_rate: slot.hourly_rate || 40,
                        vehicle_type: slot.vehicle_type || "car",
                    },
                ];
            }
            return prevSlots.map((s) =>
                (s.id && s.id === slot.id) || s.code.toUpperCase() === normalizedCode
                    ? { ...s, status: "reserved" }
                    : s
            );
        });

        setSelected(null);
        toast({
            title: `Slot ${slot.code} Reserved`,
            description: `Spot ${slot.code} has been marked as Reserved (Yellow). Fee: ₹${fee}`,
        });
    };

    useEffect(() => {
        const handleStartARGuide = (e) => {
            const res = e.detail;
            if (res && res.slot_code) {
                const targetCode = res.slot_code;
                const targetFloor = Number(res.floor) || 1;
                
                setViewMode("2d");
                setFloor(targetFloor);
                setDirections({ code: targetCode, isARGuide: true, ...res });
            }
        };

        const handleTerminateValetBooking = (e) => {
            const { slotId } = e.detail || {};
            if (!slotId) return;
            const normCode = slotId.toUpperCase();
            const currentMallId = selectedMall?.id || "default";

            setSlots((prev) =>
                prev.map((s) => (s.code.toUpperCase() === normCode ? { ...s, status: "available" } : s))
            );

            try {
                base44.entities.ParkingSlot.update(normCode, { status: "available" }, currentMallId);
            } catch (err) {}

            toast({
                title: `🚘 Valet Pickup Completed`,
                description: `Vehicle from spot ${normCode} has exited the facility. Booking terminated and spot is now Available!`,
            });
        };

        window.addEventListener("start-ar-guide", handleStartARGuide);
        window.addEventListener("terminate-valet-booking", handleTerminateValetBooking);
        return () => {
            window.removeEventListener("start-ar-guide", handleStartARGuide);
            window.removeEventListener("terminate-valet-booking", handleTerminateValetBooking);
        };
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Good Morning.";
        if (hour >= 12 && hour < 17) return "Good Afternoon.";
        if (hour >= 17 && hour < 22) return "Good Evening.";
        return "Welcome.";
    };

    const handleSlotStateChange = (slotCode, newStatus) => {
        if (!slotCode) return;
        const normalizedCode = slotCode.trim().toUpperCase();
        setSlots((prev) =>
            prev.map((s) => (s.code.toUpperCase() === normalizedCode || s.id === normalizedCode ? { ...s, status: newStatus } : s))
        );
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div>
                <div className="min-h-[3.2rem] sm:min-h-[3.8rem] flex items-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:via-purple-100 dark:to-indigo-200 dark:bg-clip-text">
                        {getGreeting()} Welcome to {mallName}, <span className="text-purple-700 dark:text-purple-300 font-bold">{username}</span>
                    </h1>
                </div>
            </div>

            <div id="map-section-container" ref={mapSectionRef} className="space-y-4 pt-2">

            <SmartSuggest
                slots={floorSlots}
                floor={floor}
                onNavigate={(s) => setDirections((prev) => (prev?.code === s.code ? null : s))}
                onReserve={setSelected}
                activeDirections={directions}
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Available Bays" value={free} sub={floor === "all" ? "of 81 across 3 floors" : `of 27 on Level ${floor}`} icon={CircleParking} accent="text-emerald-600 dark:text-emerald-400" />
                <StatCard label="Occupied" value={total - free} sub={floor === "all" ? "all 3 floors" : `currently parked`} icon={CarFront} accent="text-rose-600 dark:text-rose-400" />
                <StatCard label="Occupancy Rate" value={`${rate}%`} sub={floor === "all" ? "full building" : `level ${floor} load`} icon={Percent} accent="text-foreground dark:text-purple-200" />
                <StatCard label="EV Chargers" value={`${evFree}/${evTotal}`} sub="A-101 & A-102 left column" icon={Zap} accent="text-sky-600 dark:text-sky-400" />
            </div>

            <Filters
                floors={floors}
                floor={floor}
                setFloor={setFloor}
                type={type}
                setType={setType}
                evOnly={evOnly}
                setEvOnly={setEvOnly}
                search={search}
                setSearch={setSearch}
            />

            {/* VIEW MODE TAB SWITCHER */}
            <div className="flex items-center justify-between gap-4 bg-card dark:bg-[#0d071e]/90 p-2 rounded-2xl border border-border dark:border-purple-500/30 backdrop-blur-xl">
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setViewMode("2d")}
                        className={`inline-flex items-center gap-2 px-4 h-10 rounded-xl text-xs font-mono font-bold transition-all ${
                            viewMode === "2d"
                                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                                : "text-muted-foreground hover:text-foreground dark:text-purple-300/70 dark:hover:text-white dark:hover:bg-purple-950/40 hover:bg-accent"
                        }`}
                    >
                        <Layers className="w-4 h-4" /> 2D Top View (Blueprint)
                    </button>
                    <button
                        onClick={() => setViewMode("3d")}
                        className={`inline-flex items-center gap-2 px-4 h-10 rounded-xl text-xs font-mono font-bold transition-all ${
                            viewMode === "3d"
                                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                                : "text-muted-foreground hover:text-foreground dark:text-purple-300/70 dark:hover:text-white dark:hover:bg-purple-950/40 hover:bg-accent"
                        }`}
                    >
                        <Box className="w-4 h-4" /> 3D Building Model
                    </button>
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`inline-flex items-center gap-2 px-4 h-10 rounded-xl text-xs font-mono font-bold transition-all ${
                            viewMode === "grid"
                                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                                : "text-muted-foreground hover:text-foreground dark:text-purple-300/70 dark:hover:text-white dark:hover:bg-purple-950/40 hover:bg-accent"
                        }`}
                    >
                        <LayoutGrid className="w-4 h-4" /> List Grid
                    </button>
                </div>

                <div className="hidden md:flex items-center gap-4 text-xs font-mono text-muted-foreground dark:text-purple-200/70 pr-2">
                    <span className="flex items-center gap-1.5"><i className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" /> Live Simulation Active</span>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground dark:text-purple-200/70 border-y border-border/80 dark:border-purple-900/40 py-3.5 px-2 font-medium">
                <span className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" /> Available</span>
                <span className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" /> Occupied</span>
                <span className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" /> Reserved</span>
                <span className="flex items-center gap-2"><span className="text-amber-400 font-bold">♿</span> Handicapped (C-121, C-122)</span>
                <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" /> EV charging</span>
            </div>

            {viewMode === "2d" && (
                <SchematicTopView2D
                    slots={slots}
                    highlightCode={directions?.code}
                    isARGuide={!!directions?.isARGuide}
                    onSelect={setSelected}
                    onSlotStateChange={handleSlotStateChange}
                    onClearDirections={() => setDirections(null)}
                    selectedFloor={floor}
                    selectedMall={selectedMall}
                />
            )}

            {viewMode === "3d" && (
                <Floor3DView
                    slots={slots}
                    highlightCode={directions?.code}
                    onSelect={setSelected}
                    selectedFloor={floor}
                    setSelectedFloor={setFloor}
                    selectedMall={selectedMall}
                />
            )}

            {viewMode === "grid" && (
                loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-neutral-800 border-t-white rounded-full animate-spin" />
                    </div>
                ) : (
                    <FloorLayout slots={visible} onSelect={setSelected} />
                )
            )}
            </div>

            <ReserveDialog slot={selected} onClose={() => setSelected(null)} onConfirm={reserve} />
            <DirectionsModal slot={directions} slots={slots} selectedMall={selectedMall} onClose={() => setDirections(null)} />
        </div>
    );
}