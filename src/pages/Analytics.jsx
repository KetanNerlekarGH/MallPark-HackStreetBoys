import React, { useEffect, useMemo, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { useLocationContext } from "@/context/LocationContext";
import { useVehicleSimulation } from "@/hooks/useVehicleSimulation";
import { INDIAN_MALLS_DATA } from "@/data/indianMallsData";
import { Activity, CarFront, CircleParking, Percent, Zap, Radio, Building2, Layers, Shuffle } from "lucide-react";
import StatCard from "@/components/parking/StatCard";
import { Button } from "@/components/ui/button";

const PIE_COLORS = ["#38bdf8", "#a855f7", "#10b981", "#f43f5e", "#f59e0b"];

export default function Analytics() {
    const { selectedMall } = useLocationContext();
    const [mallFilter, setMallFilter] = useState("all"); // "all" | mallId
    const [floorFilter, setFloorFilter] = useState("all"); // "all" | 1 | 2 | 3
    const [slots, setSlots] = useState([]);
    const [allMallsData, setAllMallsData] = useState([]);
    const [activityLog, setActivityLog] = useState([]);

    // Live floor-by-floor occupancy state (Level 1, Level 2, Level 3)
    const [floorLiveStats, setFloorLiveStats] = useState({
        1: { available: 17, occupied: 8, reserved: 2 },
        2: { available: 15, occupied: 10, reserved: 2 },
        3: { available: 19, occupied: 6, reserved: 2 },
    });

    const handleSlotStateChange = useCallback((slotCode, newStatus) => {
        if (!slotCode) return;
        const norm = slotCode.trim().toUpperCase();
        setSlots((prev) =>
            prev.map((s) => (s.code.toUpperCase() === norm || s.id === norm ? { ...s, status: newStatus } : s))
        );

        const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const logEntry = {
            id: `${Date.now()}_${Math.random()}`,
            time: timeStr,
            code: norm,
            status: newStatus,
            message: newStatus === "occupied" ? `Vehicle self-parked at Bay ${norm}` : newStatus === "reserved" ? `Bay ${norm} marked Reserved` : `Vehicle departed Bay ${norm}`,
        };

        setActivityLog((prev) => [logEntry, ...prev.slice(0, 8)]);
    }, []);

    // Live Vehicle Simulation running for all floors continuously
    useVehicleSimulation({
        onSlotStateChange: handleSlotStateChange,
        autoSimulate: true,
        slots,
        selectedFloor: floorFilter,
    });

    // Build canonical 81 slots per mall (27 per floor x 3 floors)
    const buildCanonicalSlotsForMall = useCallback((mallId, dbSlots = []) => {
        const canonicalSlots = [];
        const floorsToBuild = [1, 2, 3];
        const zoneASuffixes = ["01", "02", "03", "06", "07", "08", "09", "10"];
        const zoneBSuffixes = ["11", "12", "13", "14", "15", "16", "17", "18", "19", "20"];
        const zoneCSuffixes = ["21", "22", "23", "24", "26", "27", "28", "29", "30"];

        const dbSlotsMap = new Map();
        (dbSlots || []).forEach((s) => {
            if (s.code) dbSlotsMap.set(s.code.toUpperCase(), s);
        });

        floorsToBuild.forEach((fl) => {
            zoneASuffixes.forEach((suf) => {
                const code = `A-${fl}${suf}`;
                const dbSlot = dbSlotsMap.get(code);
                canonicalSlots.push({
                    id: dbSlot?.id || `${mallId}_${code}`,
                    code,
                    floor: fl,
                    mallId,
                    zone: "A",
                    vehicle_type: "car",
                    is_ev: suf === "01" || suf === "02",
                    is_handicapped: false,
                    status: dbSlot?.status || "available",
                });
            });
            zoneBSuffixes.forEach((suf) => {
                const code = `B-${fl}${suf}`;
                const dbSlot = dbSlotsMap.get(code);
                canonicalSlots.push({
                    id: dbSlot?.id || `${mallId}_${code}`,
                    code,
                    floor: fl,
                    mallId,
                    zone: "B",
                    vehicle_type: "car",
                    is_ev: false,
                    is_handicapped: false,
                    status: dbSlot?.status || "available",
                });
            });
            zoneCSuffixes.forEach((suf) => {
                const code = `C-${fl}${suf}`;
                const dbSlot = dbSlotsMap.get(code);
                canonicalSlots.push({
                    id: dbSlot?.id || `${mallId}_${code}`,
                    code,
                    floor: fl,
                    mallId,
                    zone: "C",
                    vehicle_type: "car",
                    is_ev: false,
                    is_handicapped: suf === "21" || suf === "22",
                    status: dbSlot?.status || "available",
                });
            });
        });

        return canonicalSlots;
    }, []);

    const loadData = useCallback(() => {
        const activeMall = INDIAN_MALLS_DATA.find((m) => m.id === mallFilter) || selectedMall || INDIAN_MALLS_DATA[0];
        const currentMallId = activeMall?.id || "default";

        base44.entities.ParkingSlot.list("code", 500, currentMallId).then((dSlots) => {
            const canonical = buildCanonicalSlotsForMall(currentMallId, dSlots);
            setSlots(canonical);
        });

        // Compute simulated live stats for all malls in list for comparison view
        const mallsList = (INDIAN_MALLS_DATA || []).map((m, idx) => {
            const total = 81;
            const seed = (m.name.length * 7 + idx * 13) % 35;
            const occupied = Math.min(total - 10, 22 + seed + (Date.now() % 12));
            const reserved = 6; // 2 per floor x 3 floors
            const available = Math.max(0, total - occupied - reserved);

            return {
                id: m.id,
                name: m.name,
                city: m.city,
                state: m.state,
                Available: available,
                Occupied: occupied,
                Reserved: reserved,
                Total: total,
                occupancyRate: Math.round(((occupied + reserved) / total) * 100),
                evBays: m.evChargingBays || 24,
            };
        });
        setAllMallsData(mallsList);
    }, [mallFilter, selectedMall, buildCanonicalSlotsForMall]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        const handleGlobalSlotChange = (e) => {
            const { slotCode, status } = e.detail || {};
            if (slotCode && status) {
                handleSlotStateChange(slotCode, status);
            }
        };

        window.addEventListener("slot-state-changed", handleGlobalSlotChange);
        return () => window.removeEventListener("slot-state-changed", handleGlobalSlotChange);
    }, [handleSlotStateChange]);

    // Live update loop for 3 Floor Bar Graphs:
    // If a specific floor is chosen, that floor updates strictly from live 2D map simulation while the other floors assume random organic fluctuating occupancy!
    useEffect(() => {
        const interval = setInterval(() => {
            setFloorLiveStats((prev) => {
                const next = { ...prev };
                const floors = [1, 2, 3];

                floors.forEach((f) => {
                    const isSelectedFloor = String(floorFilter) === "all" || Number(floorFilter) === f;
                    const fs = slots.filter((s) => Number(s.floor) === f);

                    if (isSelectedFloor && fs.length > 0) {
                        // Calculate directly from live 2D map slots
                        const occ = fs.filter((s) => s.status === "occupied").length;
                        const res = 2; // Always 2 spots reserved in yellow
                        const avail = Math.max(0, 27 - occ - res);
                        next[f] = { available: avail, occupied: occ, reserved: res };
                    } else {
                        // Assume random availability & occupancy fluctuation for unselected floors
                        const prevOcc = prev[f]?.occupied || 8;
                        const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
                        const newOcc = Math.max(3, Math.min(20, prevOcc + delta));
                        const res = 2; // Always 2 spots reserved in yellow
                        const avail = 27 - newOcc - res;
                        next[f] = { available: avail, occupied: newOcc, reserved: res };
                    }
                });

                return next;
            });
        }, 2200);

        return () => clearInterval(interval);
    }, [slots, floorFilter]);

    // Filtered slots by floor
    const filteredSlots = useMemo(() => {
        if (floorFilter === "all") return slots;
        return slots.filter((s) => Number(s.floor) === Number(floorFilter));
    }, [slots, floorFilter]);

    // Totals calculation
    const totalAvailable = useMemo(() => {
        if (mallFilter === "all") {
            return allMallsData.reduce((acc, curr) => acc + curr.Available, 0);
        }
        return (floorLiveStats[1]?.available || 0) + (floorLiveStats[2]?.available || 0) + (floorLiveStats[3]?.available || 0);
    }, [mallFilter, allMallsData, floorLiveStats]);

    const totalOccupied = useMemo(() => {
        if (mallFilter === "all") {
            return allMallsData.reduce((acc, curr) => acc + curr.Occupied, 0);
        }
        return (floorLiveStats[1]?.occupied || 0) + (floorLiveStats[2]?.occupied || 0) + (floorLiveStats[3]?.occupied || 0);
    }, [mallFilter, allMallsData, floorLiveStats]);

    const totalReserved = useMemo(() => {
        if (mallFilter === "all") {
            return allMallsData.reduce((acc, curr) => acc + curr.Reserved, 0);
        }
        return (floorLiveStats[1]?.reserved || 2) + (floorLiveStats[2]?.reserved || 2) + (floorLiveStats[3]?.reserved || 2);
    }, [mallFilter, allMallsData, floorLiveStats]);

    const totalBaysCount = useMemo(() => {
        if (mallFilter === "all") {
            return allMallsData.reduce((acc, curr) => acc + curr.Total, 0);
        }
        return 81;
    }, [mallFilter, allMallsData]);

    const overallOccupancyRate = totalBaysCount
        ? Math.round(((totalOccupied + totalReserved) / totalBaysCount) * 100)
        : 0;

    const activeMallName = useMemo(() => {
        if (mallFilter === "all") return "All Malls Consolidated";
        const found = INDIAN_MALLS_DATA.find((m) => m.id === mallFilter);
        return found ? `${found.name} (${found.city})` : selectedMall?.name || "Mall";
    }, [mallFilter, selectedMall]);

    // Format single floor data into Recharts bar format showing Available (Green), Occupied (Red), Reserved (Yellow - 2)
    const getSingleFloorChartData = (floorNum) => {
        const stats = floorLiveStats[floorNum] || { available: 18, occupied: 7, reserved: 2 };
        return [
            { category: "Available", count: stats.available, fill: "#10b981" },
            { category: "Occupied", count: stats.occupied, fill: "#ef4444" },
            { category: "Reserved (Yellow)", count: 2, fill: "#eab308" },
        ];
    };

    // Bay type distribution
    const byTypeData = useMemo(() => {
        const standardSlots = filteredSlots.filter((s) => !s.is_ev && !s.is_handicapped);
        const evSlots = filteredSlots.filter((s) => s.is_ev);
        const handiSlots = filteredSlots.filter((s) => s.is_handicapped);

        const standardOcc = standardSlots.filter((s) => s.status === "occupied" || s.status === "reserved").length;
        const evOcc = evSlots.filter((s) => s.status === "occupied" || s.status === "reserved").length;
        const handiOcc = handiSlots.filter((s) => s.status === "occupied" || s.status === "reserved").length;

        return [
            { name: "Standard Occupied", value: standardOcc || 14 },
            { name: "EV Charging ⚡ Occupied", value: evOcc || 2 },
            { name: "Accessible ♿ Occupied", value: handiOcc || 1 },
            { name: "Free Available Bays", value: totalAvailable },
        ];
    }, [filteredSlots, totalAvailable]);

    const renderCustomPieLabel = ({ cx, cy, midAngle, outerRadius, percent, value, name }) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 28;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="#f1f5f9"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                className="font-mono text-xs font-extrabold fill-slate-900 dark:fill-purple-100"
            >
                {`${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
            </text>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header & Live Status */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                        <p className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
                            Multi-Mall &amp; 3-Floor Live Real-Time Analytics
                        </p>
                    </div>
                    <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:via-purple-100 dark:to-indigo-200 dark:bg-clip-text">
                        {activeMallName}
                    </h1>
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-purple-500/10 dark:bg-purple-950/40 border border-purple-500/30 text-xs font-mono font-semibold text-purple-600 dark:text-purple-300 shadow-sm">
                    <Radio className="w-4 h-4 text-emerald-400 animate-ping" />
                    <span>Live 2D Map Simulation Stream Active</span>
                </div>
            </div>

            {/* MALL & FLOOR SELECTOR CONTROLS */}
            <div className="p-4 rounded-3xl border border-border dark:border-purple-900/40 bg-card/80 dark:bg-[#0d071e]/80 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
                {/* Mall Filter */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-purple-600 dark:text-purple-300 uppercase">
                        <Building2 className="w-4 h-4 text-purple-500" />
                        <span>Mall Scope:</span>
                    </div>
                    <select
                        value={mallFilter}
                        onChange={(e) => setMallFilter(e.target.value)}
                        className="h-10 px-3.5 rounded-2xl border border-purple-500/40 bg-card dark:bg-[#150c30] text-foreground dark:text-purple-200 text-xs font-mono font-bold cursor-pointer focus:outline-none focus:border-purple-400 shadow-sm"
                    >
                        <option value="all">🏢 All Malls Consolidated (All-India View)</option>
                        {INDIAN_MALLS_DATA.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name} ({m.city}, {m.state})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Floor Filter */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-purple-600 dark:text-purple-300 uppercase mr-1">
                        <Layers className="w-4 h-4 text-purple-500" />
                        <span>Floor Focus:</span>
                    </div>
                    <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-200/80 dark:bg-[#070414] border border-border dark:border-purple-900/40">
                        {["all", 1, 2, 3].map((fl) => (
                            <Button
                                key={fl}
                                variant={String(floorFilter).toLowerCase() === String(fl).toLowerCase() ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setFloorFilter(fl)}
                                className={`rounded-xl text-xs font-semibold h-8 px-3 transition-all ${
                                    String(floorFilter).toLowerCase() === String(fl).toLowerCase()
                                        ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                                        : "text-muted-foreground hover:text-foreground dark:text-purple-300"
                                }`}
                            >
                                {fl === "all" ? "All 3 Floors" : `Level ${fl} Focus`}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* LIVE KPI STAT CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Live Available Bays"
                    value={totalAvailable}
                    sub={mallFilter === "all" ? "across all registered malls" : `of ${totalBaysCount} bays in ${floorFilter === "all" ? "3 floors" : `Level ${floorFilter}`}`}
                    icon={CircleParking}
                    accent="text-emerald-600 dark:text-emerald-400"
                />
                <StatCard
                    label="Live Occupied"
                    value={totalOccupied}
                    sub="vehicles self-parked"
                    icon={CarFront}
                    accent="text-rose-600 dark:text-rose-400"
                />
                <StatCard
                    label="Active Reserved (Yellow)"
                    value={totalReserved}
                    sub="2 reserved spots per floor"
                    icon={Zap}
                    accent="text-amber-600 dark:text-amber-400"
                />
                <StatCard
                    label="Live Occupancy Load"
                    value={`${overallOccupancyRate}%`}
                    sub="total capacity in active use"
                    icon={Percent}
                    accent="text-purple-600 dark:text-purple-300"
                />
            </div>

            {/* 3 SEPARATE BAR GRAPHS SECTION: ONE INDIVIDUAL BAR CHART PER FLOOR LEVEL */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-extrabold tracking-tight text-foreground dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:via-purple-100 dark:to-indigo-200 dark:bg-clip-text">
                            Floor-by-Floor Live Bar Charts (Level 1, Level 2, Level 3)
                        </h2>
                        <p className="text-xs text-muted-foreground dark:text-purple-300/60 font-mono mt-0.5">
                            Individual bar graphs showing Available (Green), Occupied (Red), and 2 Spots Reserved in Yellow (#eab308) per floor
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((floorNum) => {
                        const isFocusedFloor = String(floorFilter) === "all" || Number(floorFilter) === floorNum;
                        const fStats = floorLiveStats[floorNum] || { available: 17, occupied: 8, reserved: 2 };
                        const chartData = getSingleFloorChartData(floorNum);

                        return (
                            <div
                                key={floorNum}
                                className={`rounded-3xl border ${
                                    isFocusedFloor
                                        ? "border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)] bg-card dark:bg-[#0d071e]/95"
                                        : "border-border/80 dark:border-purple-900/40 bg-card/60 dark:bg-[#080414]/80 opacity-95"
                                } p-6 backdrop-blur-xl transition-all flex flex-col justify-between`}
                            >
                                {/* Header badge */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${isFocusedFloor ? "bg-emerald-400 animate-pulse" : "bg-purple-400"}`} />
                                            <h3 className="font-extrabold text-lg text-foreground dark:text-white font-mono">
                                                Level {floorNum} Garage
                                            </h3>
                                        </div>
                                        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1">
                                            {isFocusedFloor ? <Activity className="w-3 h-3 text-emerald-400 animate-spin" /> : <Shuffle className="w-3 h-3 text-purple-400" />}
                                            {isFocusedFloor ? "2D Map Live" : "Random Sim Organic"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground dark:text-purple-300/60 font-sans mb-4">
                                        27 Total Bays · 2 Reserved (Yellow)
                                    </p>
                                </div>

                                {/* Dedicated Bar Graph for this Floor */}
                                <div className="h-56 my-2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} barSize={28}>
                                            <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={11} stroke="#a855f7" className="font-mono font-bold" />
                                            <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="#a855f7" className="font-mono" domain={[0, 27]} />
                                            <Tooltip
                                                contentStyle={{
                                                    borderRadius: 16,
                                                    backgroundColor: "rgba(13, 7, 30, 0.95)",
                                                    border: "1px solid rgba(168, 85, 247, 0.4)",
                                                    color: "#ffffff",
                                                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                                                    fontWeight: "bold",
                                                }}
                                                itemStyle={{ color: "#ffffff" }}
                                            />
                                            <Bar dataKey="count" isAnimationActive={true}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Exact spot counts summary pills */}
                                <div className="pt-3 border-t border-border/80 dark:border-purple-900/40 grid grid-cols-3 gap-2 font-mono text-xs text-center">
                                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Available</div>
                                        <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-300">{fStats.available}</div>
                                    </div>
                                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30">
                                        <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase">Occupied</div>
                                        <div className="text-base font-extrabold text-rose-600 dark:text-rose-300">{fStats.occupied}</div>
                                    </div>
                                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
                                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase">Reserved</div>
                                        <div className="text-base font-extrabold text-amber-600 dark:text-amber-300">2</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* DYNAMIC VIEW SWITCHING: ALL MALLS CONSOLIDATED VS INDIVIDUAL MALL DETAILS */}
            {mallFilter === "all" ? (
                <div className="space-y-8">
                    {/* ALL MALLS COMPARISON BAR CHART */}
                    <div className="rounded-3xl border border-border dark:border-purple-500/30 bg-card dark:bg-[#0d071e]/90 p-6 backdrop-blur-xl shadow-lg dark:shadow-[0_0_40px_rgba(168,85,247,0.15)]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-foreground dark:text-purple-200">
                                    All-India Malls Live Occupancy Comparison
                                </h2>
                                <p className="text-xs text-muted-foreground dark:text-purple-300/60 font-sans mt-0.5">
                                    Live stacked comparison of Available (Green), Occupied (Red), and Reserved (Yellow) bays across Indian malls
                                </p>
                            </div>
                        </div>
                        <div className="h-88">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={allMallsData} barSize={26}>
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} stroke="#a855f7" className="font-mono font-bold" />
                                    <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#a855f7" className="font-mono" />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: 16,
                                            backgroundColor: "rgba(13, 7, 30, 0.95)",
                                            border: "1px solid rgba(168, 85, 247, 0.4)",
                                            color: "#ffffff",
                                            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                                            fontWeight: "bold",
                                        }}
                                        itemStyle={{ color: "#ffffff" }}
                                    />
                                    <Legend formatter={(value) => <span className="text-foreground dark:text-purple-200 font-semibold text-xs ml-1">{value}</span>} />
                                    <Bar dataKey="Available" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} isAnimationActive={true} />
                                    <Bar dataKey="Occupied" stackId="a" fill="#ef4444" isAnimationActive={true} />
                                    <Bar dataKey="Reserved" stackId="a" fill="#eab308" radius={[8, 8, 0, 0]} isAnimationActive={true} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ALL MALLS LEADERBOARD GRID */}
                    <div>
                        <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-foreground dark:text-purple-200 mb-4">
                            All Malls Live Capacity &amp; Load Summary
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allMallsData.map((m) => (
                                <div
                                    key={m.id}
                                    className="p-5 rounded-2xl border border-border dark:border-purple-900/40 bg-card dark:bg-[#0d071e]/80 backdrop-blur-xl shadow-md space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-extrabold text-foreground dark:text-white text-base">{m.name}</h3>
                                        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold border border-purple-500/30">
                                            {m.occupancyRate}% Load
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground dark:text-purple-300/60 font-mono">
                                        📍 {m.city}, {m.state} · 3 Floor Multi-Level Garage
                                    </p>
                                    <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-border/80 dark:border-purple-900/40">
                                        <span className="text-emerald-500 font-semibold">{m.Available} Free</span>
                                        <span className="text-rose-500 font-semibold">{m.Occupied} Occupied</span>
                                        <span className="text-amber-500 font-semibold">{m.Reserved} Reserved</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* CAPACITY BY VEHICLE TYPE PIE CHART WITH ENHANCED NUMBERS */}
                    <div className="lg:col-span-2 rounded-3xl border border-border dark:border-purple-500/30 bg-card dark:bg-[#0d071e]/90 p-6 backdrop-blur-xl shadow-lg dark:shadow-[0_0_40px_rgba(168,85,247,0.15)]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-foreground dark:text-purple-200">
                                    Live Capacity &amp; Bay Category Breakdown ({floorFilter === "all" ? "All Floors" : `Level ${floorFilter}`})
                                </h2>
                                <p className="text-xs text-muted-foreground dark:text-purple-300/60 font-sans mt-0.5">
                                    Live ratio of Standard, EV Charging, and Accessible bay occupancy
                                </p>
                            </div>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={byTypeData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        label={renderCustomPieLabel}
                                        labelLine={{ stroke: "#a855f7", strokeWidth: 2 }}
                                        isAnimationActive={true}
                                    >
                                        {byTypeData.map((e, i) => (
                                            <Cell key={e.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: 16,
                                            backgroundColor: "rgba(13, 7, 30, 0.95)",
                                            border: "1px solid rgba(168, 85, 247, 0.4)",
                                            color: "#ffffff",
                                            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                                            fontWeight: "bold",
                                        }}
                                        itemStyle={{ color: "#ffffff" }}
                                    />
                                    <Legend formatter={(value) => <span className="text-foreground dark:text-purple-200 font-semibold text-xs ml-1">{value}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* LIVE SIMULATION TRAFFIC ACTIVITY FEED */}
                    <div className="rounded-3xl border border-border dark:border-purple-500/30 bg-card dark:bg-[#0d071e]/90 p-6 backdrop-blur-xl shadow-lg dark:shadow-[0_0_40px_rgba(168,85,247,0.15)] flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-foreground dark:text-purple-200">
                                    Live Map Activity Feed
                                </h2>
                            </div>
                            <p className="text-xs text-muted-foreground dark:text-purple-300/60 font-sans mb-4">
                                Real-time event stream from 2D map traffic
                            </p>

                            <div className="space-y-2.5 font-mono text-xs max-h-[260px] overflow-y-auto pr-1">
                                {activityLog.length === 0 ? (
                                    <p className="text-xs text-muted-foreground dark:text-purple-300/50 py-8 text-center">
                                        Waiting for live map vehicle events...
                                    </p>
                                ) : (
                                    activityLog.map((log) => (
                                        <div
                                            key={log.id}
                                            className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-900/40 flex items-center justify-between gap-2"
                                        >
                                            <div>
                                                <div className="font-bold text-foreground dark:text-white flex items-center gap-1.5">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${log.status === "occupied" ? "bg-rose-400" : log.status === "reserved" ? "bg-amber-400" : "bg-emerald-400"}`} />
                                                    {log.code}
                                                </div>
                                                <p className="text-[11px] text-muted-foreground dark:text-purple-200/70">{log.message}</p>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground dark:text-purple-300/50 shrink-0">{log.time}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="pt-3 border-t border-border/80 dark:border-purple-900/40 text-xs font-mono text-muted-foreground dark:text-purple-300/70 flex items-center justify-between">
                            <span>2D Map Sync</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Updating
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}