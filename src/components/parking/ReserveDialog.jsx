import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";
import VehicleNumberInput, { isValidVehicleNumber } from "./VehicleNumberInput";

export default function ReserveDialog({ slot, onClose, onConfirm }) {
  const [hours, setHours] = useState(2);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [saving, setSaving] = useState(false);

  if (!slot) return null;
  const evFee = slot.is_ev ? 30 * hours : 0;
  const fee = slot.hourly_rate * hours + evFee;
  const isValidVehicle = isValidVehicleNumber(vehicleNumber);

  const confirm = async () => {
    if (!isValidVehicle) return;
    setSaving(true);
    await onConfirm({ slot, hours: Number(hours), vehicleNumber, fee });
    setSaving(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Reserve {slot.code}
            {slot.is_ev && <Zap className="w-4 h-4 text-sky-500" />}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          <p className="text-sm text-muted-foreground">
            Level {slot.floor} · Zone {slot.zone} · {slot.vehicle_type.toUpperCase()} · ₹{slot.hourly_rate}/hr
            {slot.is_ev && " + ₹30/hr charging"}
          </p>

          <VehicleNumberInput value={vehicleNumber} onChange={setVehicleNumber} />

          <div className="space-y-2">
            <Label>Duration: {hours} hour{hours > 1 ? "s" : ""}</Label>
            <input type="range" min="1" max="8" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full accent-emerald-500" />
          </div>

          <div className="rounded-2xl bg-muted p-4 flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Estimated fee</span>
            <span className="text-3xl font-semibold tracking-tight">₹{fee}</span>
          </div>

          <Button className="w-full rounded-full h-11" disabled={!isValidVehicle || saving} onClick={confirm}>
            {saving ? "Reserving…" : "Confirm reservation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}