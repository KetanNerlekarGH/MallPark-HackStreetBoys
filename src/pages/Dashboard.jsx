import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CircleParking, CarFront, Percent, Zap, MapPin } from "lucide-react";
import StatCard from "@/components/parking/StatCard";
import Filters from "@/components/parking/Filters";
import FloorLayout from "@/components/parking/FloorLayout";
import ReserveDialog from "@/components/parking/ReserveDialog";
import SmartSuggest from "@/components/parking/SmartSuggest";
import Floor3DView from "@/components/parking/Floor3DView";
import DirectionsModal from "@/components/parking/DirectionsModal";
import { useToast } from "@/components/ui/use-toast";
import { useLocationContext } from "@/context/LocationContext";
import { useAuth } from "@/lib/AuthContext";

export default function Dashboard() {
    const { selectedState, selectedCity, selectedMall, openLocationModal } = useLocationContext();
    const { user } = useAuth();
    const username = user?.username || user?.firstName || "User";
    const mallName = selectedMall?.name || "Phoenix Marketcity";

    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [floor, setFloor] = useState(1);
    const [type, setType] = useState("all");
    const [evOnly, setEvOnly] = useState(false);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);
    const [directions, setDirections] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        base44.entities.ParkingSlot.list("code", 500).then((d) => {
            // Update slots hourly rate if mall specifies custom rate
            const updated = d.map((s) => ({
                ...s,
                hourly_rate: selectedMall?.hourlyRate || s.hourly_rate || 40,
            }));
            setSlots(updated);
            setLoading(false);
        });
    }, [selectedMall]);

    // Simulated live updates
    useEffect(() => {
        const id = setInterval(() => {
            setSlots((prev) => {
                if (!prev.length) return prev;
                const next = [...prev];
                for (let i = 0; i < 4; i++) {
                    const idx = Math.floor(Math.random() * next.length);
                    const s = next[idx];
                    if (s.status === "reserved") continue;
                    next[idx] = { ...s, status: s.status === "available" ? "occupied" : "available" };
                }
                return next;
            });
        }, 3500);
        return () => clearInterval(id);
    }, []);

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
    const evFree = floorSlots.filter((s) => s.is_ev && s.status === "available").length;

    const reserve = async ({ slot, hours, vehicleNumber, fee }) => {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + hours * 3600 * 1000);
        await base44.entities.Reservation.create({
            slot_code: slot.code,
            floor: slot.floor,
            vehicle_type: slot.vehicle_type,
            vehicle_number: vehicleNumber,
            hours,
            estimated_fee: fee,
            is_ev: !!slot.is_ev,
            status: "active",
            created_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
        });
        await base44.entities.ParkingSlot.update(slot.id, { status: "reserved" });
        setSlots((prev) => prev.map((s) => (s.id === slot.id ? { ...s, status: "reserved" } : s)));
        setSelected(null);
        toast({ title: `Slot ${slot.code} reserved`, description: `Estimated fee ₹${fee}` });
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Good Morning.";
        if (hour >= 12 && hour < 17) return "Good Afternoon.";
        if (hour >= 17 && hour < 22) return "Good Evening.";

    };

    return (
        <div className="space-y-10 animate-fade-in-up">
            <div>
                <div className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-purple-600 dark:text-purple-300/80 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span>{selectedState} &gt; {selectedCity} &gt; {selectedMall?.name}</span>
                </div>
                <div className="min-h-[3.2rem] sm:min-h-[3.8rem] flex items-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:via-purple-100 dark:to-indigo-200 dark:bg-clip-text">
                        {getGreeting()} Welcome to {mallName}, <span className="text-purple-700 dark:text-purple-300 font-bold">{username}</span>
                    </h1>
                </div>
            </div>

            <SmartSuggest
                slots={floorSlots}
                floor={floor}
                onNavigate={(s) => setDirections(s)}
                onReserve={setSelected}
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Available" value={free} sub={floor === "all" ? "all floors" : `of ${total} on Level ${floor}`} icon={CircleParking} accent="text-emerald-600 dark:text-emerald-400" />
                <StatCard label="Occupied" value={total - free} sub={floor === "all" ? "all floors" : "currently parked"} icon={CarFront} accent="text-rose-600 dark:text-rose-400" />
                <StatCard label="Occupancy" value={`${rate}%`} sub={floor === "all" ? "full building" : "this level"} icon={Percent} accent="text-foreground dark:text-purple-200" />
                <StatCard label="EV free" value={evFree} sub="charging bays" icon={Zap} accent="text-sky-600 dark:text-sky-400" />
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

            <div className="flex flex-wrap items-center gap-6 text-xs text-muted-foreground dark:text-purple-200/70 border-y border-border/80 dark:border-purple-900/40 py-3.5 px-2 font-medium">
                <span className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" /> Available</span>
                <span className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" /> Occupied</span>
                <span className="flex items-center gap-2"><i className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" /> Reserved</span>
                <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" /> EV charging</span>
            </div>

            <Floor3DView
                slots={slots}
                highlightCode={directions?.code}
                onSelect={setSelected}
                selectedFloor={floor}
                setSelectedFloor={setFloor}
            />

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-neutral-800 border-t-white rounded-full animate-spin" />
                </div>
            ) : (
                <FloorLayout slots={visible} onSelect={setSelected} />
            )}

            <ReserveDialog slot={selected} onClose={() => setSelected(null)} onConfirm={reserve} />
            <DirectionsModal slot={directions} onClose={() => setDirections(null)} />
        </div>
    );
}