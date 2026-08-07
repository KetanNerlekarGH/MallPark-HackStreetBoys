import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Zap, Ticket, Settings, CreditCard, Receipt, History as HistoryIcon } from "lucide-react";
import { format } from "date-fns";
import ManageReservationDialog from "@/components/parking/ManageReservationDialog";
import PayExitDialog from "@/components/parking/PayExitDialog";
import { useToast } from "@/components/ui/use-toast";

export default function Reservations() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("active");
    const [manage, setManage] = useState(null);
    const [pay, setPay] = useState(null);
    const { toast } = useToast();

    const load = () =>
        base44.entities.Reservation.list("-created_date", 200).then((d) => {
            setItems(d);
            setLoading(false);
        });

    useEffect(() => {
        load();
    }, []);

    const openManage = async (r) => {
        const slots = await base44.entities.ParkingSlot.filter({ code: r.slot_code });
        setManage({ reservation: r, slot: slots[0] });
    };
    const openPay = async (r) => {
        const slots = await base44.entities.ParkingSlot.filter({ code: r.slot_code });
        setPay({ reservation: r, slot: slots[0] });
    };

    const save = async ({ reservation, hours, vehicleNumber, fee }) => {
        await base44.entities.Reservation.update(reservation.id, {
            hours,
            vehicle_number: vehicleNumber,
            estimated_fee: fee,
        });
        setManage(null);
        load();
        toast({ title: `${reservation.slot_code} updated`, description: `New fee ₹${fee}` });
    };

    const cancel = async (r, amount) => {
        if (amount) {
            await base44.entities.Reservation.update(r.id, {
                status: "completed",
                paid_amount: amount,
                paid_at: new Date().toISOString(),
            });
        } else {
            await base44.entities.Reservation.update(r.id, { status: "cancelled" });
        }
        const slots = await base44.entities.ParkingSlot.filter({ code: r.slot_code });
        if (slots[0]) await base44.entities.ParkingSlot.update(slots[0].id, { status: "available" });
        setManage(null);
        load();
        toast(
            amount
                ? { title: `Paid ₹${amount} · session closed`, description: "Exit barrier enabled" }
                : { title: `${r.slot_code} cancelled`, description: "Bay released back to availability" }
        );
    };

    const onPaid = async (r, amount) => {
        await base44.entities.Reservation.update(r.id, {
            status: "completed",
            paid_amount: amount,
            paid_at: new Date().toISOString(),
        });
        const slots = await base44.entities.ParkingSlot.filter({ code: r.slot_code });
        if (slots[0]) await base44.entities.ParkingSlot.update(slots[0].id, { status: "available" });
        load();
        toast({ title: `Payment confirmed · ₹${amount}`, description: "Exit QR issued — scan at the barrier" });
    };

    const active = items.filter((r) => r.status === "active");
    const history = items.filter((r) => r.status !== "active");
    const totalPaid = history.reduce(
        (s, r) => s + (r.status === "completed" ? r.paid_amount || r.estimated_fee || 0 : 0),
        0
    );

    const tabs = [
        { id: "active", label: "Active", icon: Ticket, count: active.length },
        { id: "history", label: "History", icon: HistoryIcon, count: history.length },
    ];

    return (
        <div className="space-y-8">
            <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Your bookings</p>
                <h1 className="mt-2 text-4xl font-semibold tracking-tighter">Reservations</h1>
            </div>

            <div className="inline-flex rounded-full border bg-card p-1 gap-1">
                {tabs.map((t) => {
                    const Icon = t.icon;
                    const on = tab === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`inline-flex items-center gap-2 rounded-full px-4 h-9 text-sm font-medium transition-colors ${on ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Icon className="w-4 h-4" /> {t.label}
                            <span className={`text-[11px] px-1.5 rounded-full ${on ? "bg-primary-foreground/20" : "bg-muted"}`}>
                                {t.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {tab === "history" && (
                <div className="rounded-3xl border bg-card p-6 flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Total fees paid</p>
                        <p className="mt-1 text-3xl font-semibold tracking-tight">₹{totalPaid}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Receipt className="w-6 h-6" />
                    </div>
                </div>
            )}

            {loading ? (
                <div className="h-40 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-muted border-t-foreground rounded-full animate-spin" />
                </div>
            ) : tab === "active" ? (
                active.length === 0 ? (
                    <div className="rounded-3xl border border-dashed p-16 text-center">
                        <Ticket className="w-6 h-6 mx-auto text-muted-foreground" />
                        <p className="mt-3 text-muted-foreground">No active reservations — pick a green slot on the live map.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {active.map((r) => (
                            <div
                                key={r.id}
                                className="rounded-3xl border bg-card p-5 flex flex-wrap items-center justify-between gap-4"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-semibold tracking-tight">{r.slot_code}</span>
                                        {r.is_ev && <Zap className="w-4 h-4 text-sky-500" />}
                                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">active</span>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Level {r.floor} · {r.vehicle_number || "—"} · {r.hours}h ·{" "}
                                        {r.created_date ? format(new Date(r.created_date), "d MMM, HH:mm") : ""}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-semibold tracking-tight">₹{r.estimated_fee}</span>
                                    <Button variant="outline" className="rounded-full" onClick={() => openManage(r)}>
                                        <Settings className="w-4 h-4 mr-1.5" /> Manage
                                    </Button>
                                    <Button className="rounded-full" onClick={() => openPay(r)}>
                                        <CreditCard className="w-4 h-4 mr-1.5" /> Pay & Exit
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : history.length === 0 ? (
                <div className="rounded-3xl border border-dashed p-16 text-center">
                    <HistoryIcon className="w-6 h-6 mx-auto text-muted-foreground" />
                    <p className="mt-3 text-muted-foreground">
                        No past sessions yet — completed and cancelled bookings will show here.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {history.map((r) => (
                        <div
                            key={r.id}
                            className="rounded-3xl border bg-card p-5 flex flex-wrap items-center justify-between gap-4"
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-semibold tracking-tight">{r.slot_code}</span>
                                    {r.is_ev && <Zap className="w-4 h-4 text-sky-500" />}
                                    <span
                                        className={`text-[11px] px-2 py-0.5 rounded-full ${r.status === "completed"
                                                ? "bg-emerald-500/15 text-emerald-600"
                                                : "bg-muted text-muted-foreground"
                                            }`}
                                    >
                                        {r.status}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Level {r.floor} · {r.vehicle_number || "—"} · {r.hours}h ·{" "}
                                    {r.created_date ? format(new Date(r.created_date), "d MMM, HH:mm") : ""}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-semibold tracking-tight">
                                    ₹{r.status === "completed" ? r.paid_amount || r.estimated_fee : r.estimated_fee}
                                </span>
                                <p className="text-[11px] text-muted-foreground">
                                    {r.status === "completed" ? "paid" : "cancelled"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ManageReservationDialog
                reservation={manage?.reservation}
                slot={manage?.slot}
                onClose={() => setManage(null)}
                onSave={save}
                onCancel={cancel}
            />
            <PayExitDialog
                reservation={pay?.reservation}
                slot={pay?.slot}
                onClose={() => setPay(null)}
                onPaid={onPaid}
            />
        </div>
    );
}