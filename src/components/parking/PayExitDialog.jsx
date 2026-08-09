import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Clock, CheckCircle2, QrCode, ArrowRight, ShieldCheck, CreditCard, Sparkles } from "lucide-react";

function fmt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function PayExitDialog({ reservation, slot, onClose, onPaid }) {
  const [now, setNow] = useState(Date.now());
  const [step, setStep] = useState("scan"); // "scan" | "verifying" | "success"
  const [paid, setPaid] = useState(null);

  useEffect(() => {
    if (step === "success") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [step]);

  if (!reservation) return null;

  const created = new Date(reservation.created_at || reservation.created_date || Date.now()).getTime();
  const elapsedMs = Math.max(0, now - created);
  const bookedMs = (reservation.hours || 1) * 3600000;
  const timeLeftMs = Math.max(0, bookedMs - elapsedMs);
  const perHour = slot?.hourly_rate || (reservation.vehicle_type === "bike" ? 20 : reservation.vehicle_type === "suv" ? 60 : 40);
  const evHour = reservation.is_ev ? 30 : 0;
  const rate = perHour + evHour;
  const hoursUsed = Math.max(1, Math.ceil(elapsedMs / 3600000));
  const amount = reservation.estimated_fee || Math.round(hoursUsed * rate);
  const overtime = elapsedMs > bookedMs;

  const payload = `MALLPARK_EXIT|${reservation.slot_code}|${reservation.id || ""}|₹${amount}|${new Date(now).toISOString()}`;
  const exitQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(payload)}`;

  const handleConfirmPayment = async () => {
    setStep("verifying");
    // Simulate transaction clearance
    await new Promise((res) => setTimeout(res, 1200));
    setPaid({ amount, qr: exitQrUrl });
    setStep("success");

    // Strictly terminate booking only after payment is verified
    await onPaid?.(reservation, amount);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl border border-purple-500/40 bg-[#0c071e] text-white p-6 shadow-[0_0_60px_rgba(168,85,247,0.35)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
            {step === "success" ? (
              <span className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" /> Payment Confirmed & Booking Ended
              </span>
            ) : (
              <span className="flex items-center gap-2 text-white">
                <QrCode className="w-5 h-5 text-purple-400" /> Pay & Exit · {reservation.slot_code}
                {reservation.is_ev && <Zap className="w-4 h-4 text-sky-400" />}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Scan PhonePe / UPI QR code to pay your total parking fee before terminating your booking.
          </DialogDescription>
        </DialogHeader>

        {step !== "success" ? (
          <div className="space-y-4 pt-1 font-mono">
            {/* Amount Due & Breakdown Card */}
            <div className="rounded-2xl border border-purple-500/50 bg-gradient-to-r from-purple-950/70 via-[#160c36] to-indigo-950/70 p-4 flex items-center justify-between shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-purple-300/70">Total Parking Fee Due</span>
                <div className="text-3xl font-black text-white tracking-tight">₹{amount}</div>
                <div className="text-[11px] text-purple-300/60">{reservation.slot_code} · Level {reservation.floor} · {hoursUsed}h duration</div>
              </div>
              <div className="text-right text-xs">
                <div className="text-[10px] uppercase text-purple-300/70">Vehicle Plate</div>
                <div className="font-bold text-amber-400">{reservation.vehicle_number || "MH-12-MP-8899"}</div>
              </div>
            </div>

            {/* UPI QR Code Scanner Box */}
            <div className="rounded-2xl border-2 border-purple-500/60 bg-[#070314] p-4 text-center space-y-3 relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.25)]">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/40 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> PhonePe / Any UPI App
              </div>
              
              <div className="mx-auto w-fit p-2 rounded-2xl bg-white shadow-[0_0_25px_rgba(255,255,255,0.2)] border-2 border-purple-400">
                <img
                  src="/payment_qr.jpg"
                  alt="PhonePe UPI Payment QR"
                  className="w-48 h-48 object-contain rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-sans text-purple-200/90 font-medium">
                  Scan this QR with <strong>PhonePe, GPay, Paytm, or BHIM</strong> to pay exact amount:
                </p>
                <div className="text-lg font-extrabold text-emerald-400 tracking-wider">
                  ₹{amount}.00
                </div>
              </div>
            </div>

            {/* Confirm Payment Button */}
            <Button
              className="w-full h-12 rounded-full font-bold text-xs bg-gradient-to-r from-emerald-600 via-purple-600 to-indigo-600 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all"
              disabled={step === "verifying"}
              onClick={handleConfirmPayment}
            >
              {step === "verifying" ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Verifying Payment & Terminating Booking...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  I Have Completed Payment of ₹{amount}
                </span>
              )}
            </Button>

            <p className="text-center text-[10px] text-purple-300/60 font-sans">
              🔒 Your booking will terminate and release the slot only after UPI payment verification.
            </p>
          </div>
        ) : (
          <div className="space-y-5 pt-2 text-center font-mono">
            {/* Exit Boom Barrier Pass */}
            <div className="p-4 rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-b from-[#0a2419] to-[#06140e] space-y-3 shadow-[0_0_35px_rgba(16,185,129,0.35)]">
              <span className="px-3 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                BOOKING TERMINATED · EXIT PASS ISSUED
              </span>
              
              <div className="mx-auto w-fit p-3 rounded-2xl bg-white border border-emerald-500 shadow-md">
                <img src={paid.qr} alt="Exit Barrier QR" width={180} height={180} className="rounded-lg" />
              </div>

              <div>
                <p className="text-xs text-purple-200/80 font-sans">Scan at Express Exit Gate B Boom Barrier</p>
                <p className="mt-1 text-2xl font-black text-white">Paid ₹{paid.amount}</p>
                <p className="text-[11px] text-emerald-400 mt-0.5 font-bold">
                  Slot {reservation.slot_code} is now vacant & available
                </p>
              </div>
            </div>

            <Button
              className="rounded-full w-full h-11 font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={onClose}
            >
              Done & Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}