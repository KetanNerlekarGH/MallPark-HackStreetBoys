import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Clock, CheckCircle2 } from "lucide-react";

function fmt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function PayExitDialog({ reservation, slot, onClose, onPaid }) {
  const [now, setNow] = useState(Date.now());
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(null);

  useEffect(() => {
    if (paid) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [paid]);

  if (!reservation) return null;

  const created = new Date(reservation.created_date).getTime();
  const elapsedMs = Math.max(0, now - created);
  const bookedMs = (reservation.hours || 1) * 3600000;
  const timeLeftMs = Math.max(0, bookedMs - elapsedMs);
  const perHour = slot?.hourly_rate || (reservation.vehicle_type === "bike" ? 20 : reservation.vehicle_type === "suv" ? 60 : 40);
  const evHour = reservation.is_ev ? 30 : 0;
  const rate = perHour + evHour;
  const hoursUsed = Math.max(1, Math.ceil(elapsedMs / 3600000));
  const amount = Math.round(hoursUsed * rate);
  const overtime = elapsedMs > bookedMs;

  const payload = `MALLPARK|${reservation.slot_code}|${reservation.id || ""}|₹${amount}|${new Date(now).toISOString()}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(payload)}`;

  const pay = async () => {
    setPaying(true);
    await new Promise((res) => setTimeout(res, 900));
    setPaying(false);
    setPaid({ amount, qr: qrUrl });
    onPaid?.(reservation, amount);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {paid ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Exit pass ready
              </>
            ) : (
              <>
                Pay & exit · {reservation.slot_code}
                {reservation.is_ev && <Zap className="w-4 h-4 text-sky-500" />}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Settle your parking fee and collect your exit QR code.
          </DialogDescription>
        </DialogHeader>

        {!paid ? (
          <div className="space-y-5 pt-2">
            <p className="text-sm text-muted-foreground">
              Level {reservation.floor} · {reservation.vehicle_number || "—"} · {reservation.vehicle_type?.toUpperCase()}
              {reservation.is_ev && " · EV"} · ₹{perHour}/hr
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted p-4">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                  <Clock className="w-3 h-3" /> Time left
                </div>
                <div className={`mt-1 text-2xl font-semibold tracking-tight ${overtime ? "text-rose-500" : ""}`}>
                  {fmt(timeLeftMs)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {overtime ? "Overtime — extend in Manage" : `${hoursUsed}h used`}
                </div>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Amount due</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight">₹{amount}</div>
                <div className="text-[11px] text-muted-foreground">{hoursUsed}h × ₹{rate}</div>
              </div>
            </div>
            <Button className="w-full rounded-full h-11" disabled={paying} onClick={pay}>
              {paying ? "Processing payment…" : `Pay ₹${amount} & generate QR`}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              Demo payment · real Stripe checkout can be wired in on request
            </p>
          </div>
        ) : (
          <div className="space-y-5 pt-2 text-center">
            <div className="mx-auto w-fit rounded-2xl border bg-white p-4">
              <img src={paid.qr} alt="Exit QR code" width={200} height={200} className="rounded-lg" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Scan this QR at the exit boom barrier</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">Paid ₹{paid.amount}</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {reservation.slot_code} · {reservation.vehicle_number || "—"}
              </p>
            </div>
            <Button variant="outline" className="rounded-full w-full h-11" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}