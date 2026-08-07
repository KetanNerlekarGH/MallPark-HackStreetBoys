import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CircleParking, CarFront, Percent, Zap } from "lucide-react";
import StatCard from "@/components/parking/StatCard";
import Filters from "@/components/parking/Filters";
import FloorLayout from "@/components/parking/FloorLayout";
import ReserveDialog from "@/components/parking/ReserveDialog";
import SmartSuggest from "@/components/parking/SmartSuggest";
import Floor3DView from "@/components/parking/Floor3DView";
import DirectionsModal from "@/components/parking/DirectionsModal";
import { useToast } from "@/components/ui/use-toast";

export default function Dashboard() {
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
            setSlots(d);
            setLoading(false);
        });
    }, []);

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

    const floors = useMemo(() => [...new Set(slots.map((s) => s.floor))].sort(), [slots]);
    const floorSlots = slots.filter((s) => s.floor === floor);
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
        await base44.entities.Reservation.create({
            slot_code: slot.code,
            floor: slot.floor,
            vehicle_type: slot.vehicle_type,
            vehicle_number: vehicleNumber,
            hours,
            estimated_fee: fee,
            is_ev: !!slot.is_ev,
            status: "active",
        });
        await base44.entities.ParkingSlot.update(slot.id, { status: "reserved" });
        setSlots((prev) => prev.map((s) => (s.id === slot.id ? { ...s, status: "reserved" } : s)));
        setSelected(null);
        toast({ title: `Slot ${slot.code} reserved`, description: `Estimated fee ₹${fee}` });
    };

    return (
        <div className="space-y-10">
            <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Live availability</p>
                <h1 className="mt-2 text-4xl md:text-5xl font-semibold tracking-tighter">Find your spot in seconds</h1>
            </div>

            <SmartSuggest
                slots={floorSlots}
                floor={floor}
                onNavigate={(s) => setDirections(s)}
                onReserve={setSelected}
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Available" value={free} sub={`of ${total} on Level ${floor}`} icon={CircleParking} accent="text-emerald-500" />
                <StatCard label="Occupied" value={total - free} sub="currently parked" icon={CarFront} accent="text-rose-500" />
                <StatCard label="Occupancy" value={`${rate}%`} sub="this level" icon={Percent} />
                <StatCard label="EV free" value={evFree} sub="charging bays" icon={Zap} accent="text-sky-500" />
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

            <div className="flex flex-wrap gap-5 text-xs text-muted-foreground">
                <span className="flex items-center gap-2"><i className="w-3 h-3 rounded bg-emerald-500/60" /> Available</span>
                <span className="flex items-center gap-2"><i className="w-3 h-3 rounded bg-rose-500/60" /> Occupied</span>
                <span className="flex items-center gap-2"><i className="w-3 h-3 rounded bg-amber-500/60" /> Reserved</span>
                <span className="flex items-center gap-2"><Zap className="w-3 h-3 text-sky-500" /> EV charging</span>
            </div>

            <Floor3DView slots={slots} highlightCode={directions?.code} onSelect={setSelected} />

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-muted border-t-foreground rounded-full animate-spin" />
                </div>
            ) : (
                <FloorLayout slots={visible} onSelect={setSelected} />
            )}

            <ReserveDialog slot={selected} onClose={() => setSelected(null)} onConfirm={reserve} />
            <DirectionsModal slot={directions} onClose={() => setDirections(null)} />
        </div>
    );
}