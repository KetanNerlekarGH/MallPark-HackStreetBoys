import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#10b981", "#f43f5e", "#f59e0b"];

export default function Analytics() {
    const [slots, setSlots] = useState([]);

    useEffect(() => {
        base44.entities.ParkingSlot.list("code", 500).then(setSlots);
    }, []);

    const byFloor = useMemo(() => {
        const floors = [...new Set(slots.map((s) => s.floor))].sort();
        return floors.map((f) => {
            const fs = slots.filter((s) => s.floor === f);
            return {
                name: `Level ${f}`,
                Available: fs.filter((s) => s.status === "available").length,
                Occupied: fs.filter((s) => s.status === "occupied").length,
                Reserved: fs.filter((s) => s.status === "reserved").length,
            };
        });
    }, [slots]);

    const byType = useMemo(() => {
        const types = [...new Set(slots.map((s) => s.vehicle_type))];
        return types.map((t) => ({ name: t.toUpperCase(), value: slots.filter((s) => s.vehicle_type === t).length }));
    }, [slots]);

    const total = slots.length;
    const occupied = slots.filter((s) => s.status !== "available").length;

    return (
        <div className="space-y-10">
            <div>
                <p className="text-xs font-mono uppercase tracking-[0.25em] text-purple-300/80">Analytics</p>
                <h1 className="mt-2 text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-100 to-indigo-200 bg-clip-text text-transparent">
                    Mall-wide occupancy
                </h1>
                <p className="mt-2 text-sm text-purple-200/70 font-mono">
                    {occupied} of {total} bays in use · {total ? Math.round((occupied / total) * 100) : 0}% occupancy
                </p>
            </div>

            <div className="rounded-2xl border border-purple-900/40 bg-[#0d081c]/80 p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(147,51,234,0.08)]">
                <h2 className="text-xs font-mono uppercase tracking-widest text-purple-300/80 mb-6">Slots per level</h2>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={byFloor}>
                            <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="#a79cc7" />
                            <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#a79cc7" />
                            <Tooltip contentStyle={{ borderRadius: 12, backgroundColor: "#0c071a", border: "1px solid #3b2567", color: "#ffffff" }} />
                            <Legend />
                            <Bar dataKey="Available" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="Occupied" stackId="a" fill="#f43f5e" />
                            <Bar dataKey="Reserved" stackId="a" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-2xl border border-purple-900/40 bg-[#0d081c]/80 p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(147,51,234,0.08)]">
                <h2 className="text-xs font-mono uppercase tracking-widest text-purple-300/80 mb-6">Capacity by vehicle type</h2>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={byType} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                                {byType.map((e, i) => (
                                    <Cell key={e.name} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: 12, backgroundColor: "#0c071a", border: "1px solid #3b2567", color: "#ffffff" }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}