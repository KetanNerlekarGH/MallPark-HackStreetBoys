import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Zap, Clock } from "lucide-react";

export default function ManageReservationDialog({ reservation, slot, onClose, onSave, onCancel }) {
  const [hours, setHours] = useState(reservation?.hours || 1);
  const [vehicleNumber, setVehicleNumber] = useState(reservation?.vehicle_number || "");
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [cancelPay, setCancelPay] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!reservation) return null;
  const hourly = slot?.hourly_rate || (reservation.vehicle_type === "bike" ? 20 : reservation.vehicle_type === "suv" ? 60 : 40);
  const evFee = reservation.is_ev ? 30 * hours : 0;
  const fee = hourly * hours + evFee;

  const created = new Date(reservation.created_date).getTime();
  const elapsedMs = Math.max(0, now - created);
  const pastGrace = elapsedMs > 5 * 60 * 1000;
  const rate = hourly + (reservation.is_ev ? 30 : 0);
  const hoursUsed = Math.max(1, Math.ceil(elapsedMs / 3600000));
  const cancelFee = Math.round(hoursUsed * rate);

  const save = async () => {
    setSaving(true);
    await onSave({ reservation, hours: Number(hours), vehicleNumber, fee });
    setSaving(false);
  };
  const requestCancel = async () => {
    if (!pastGrace) {
      setCancelling(true);
      await onCancel(reservation);
      setCancelling(false);
      return;
    }
    setCancelPay(cancelFee);
  };
  const payCancel = async () => {
    setCancelling(true);
    await onCancel(reservation, cancelPay);
    setCancelling(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {cancelPay ? `Cancel ${reservation.slot_code}` : <>Manage {reservation.slot_code}</>}
            {reservation.is_ev && <Zap className="w-4 h-4 text-sky-500" />}
          </DialogTitle>
        </DialogHeader>

        {cancelPay ? (
          <div className="space-y-5 pt-2">
            <p className="text-sm text-muted-foreground">
              More than 5 minutes have passed — cancellation is payable to exit.
            </p>
            <div className="rounded-2xl bg-muted p-4 flex items-baseline justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Time used</div>
                <div className="text-sm mt-0.5">{hoursUsed}h</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Payable</div>
                <div className="text-3xl font-semibold tracking-tight">₹{cancelFee}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 rounded-full h-11" disabled={cancelling} onClick={payCancel}>
                {cancelling ? "Processing…" : `Pay ₹${cancelFee} & cancel`}
              </Button>
              <Button variant="outline" className="rounded-full h-11" disabled={cancelling} onClick={() => setCancelPay(null)}>
                Back
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            <p className="text-sm text-muted-foreground">
              Level {reservation.floor} · {reservation.vehicle_type.toUpperCase()}
              {reservation.is_ev && " · EV charging"} · ₹{hourly}/hr
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {pastGrace
                ? `Parked ${hoursUsed}h — cancellation payable`
                : `Free cancel within ${5 - Math.floor(elapsedMs / 60000)} min`}
            </div>
            <div className="space-y-2">
              <Label>Vehicle number</Label>
              <Input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())} placeholder="KA 01 AB 1234" />
            </div>
            <div className="space-y-2">
              <Label>Total duration: {hours} hour{hours > 1 ? "s" : ""}</Label>
              <input type="range" min="1" max="12" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full accent-sky-500" />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>1h</span><span>12h</span>
              </div>
            </div>
            <div className="rounded-2xl bg-muted p-4 flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">New estimated fee</span>
              <span className="text-3xl font-semibold tracking-tight">₹{fee}</span>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 rounded-full h-11" disabled={!vehicleNumber || saving} onClick={save}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button variant="outline" className="rounded-full h-11 text-destructive hover:text-destructive" disabled={cancelling} onClick={requestCancel}>
                {cancelling ? "Cancelling…" : "Cancel booking"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}