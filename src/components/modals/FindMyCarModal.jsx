import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Car, Navigation, Layers, X, Loader2, Footprints, Ticket, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FindMyCarModal({ isOpen, onClose, currentMall }) {
  const [activeReservation, setActiveReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  const getExpiryTime = (r) => {
    if (r.expires_at) return new Date(r.expires_at).getTime();
    const created = new Date(r.created_at || r.created_date || Date.now()).getTime();
    return created + (r.hours || 2) * 3600 * 1000;
  };

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    base44.entities.Reservation.list("-created_date", 50)
      .then(async (res) => {
        const now = Date.now();
        let foundActive = null;

        for (const r of res) {
          const expiry = getExpiryTime(r);
          if (r.status === "active") {
            if (now >= expiry) {
              // Auto-expire elapsed booking in database
              try {
                await base44.entities.Reservation.update(r.id, { status: "expired" });
                const slots = await base44.entities.ParkingSlot.filter({ code: r.slot_code });
                if (slots[0]) await base44.entities.ParkingSlot.update(slots[0].id, { status: "available" });
              } catch (err) {
                console.error("Auto-expire error:", err);
              }
            } else if (!foundActive) {
              foundActive = r;
            }
          }
        }

        setActiveReservation(foundActive);
        setLoading(false);
      })
      .catch(() => {
        setActiveReservation(null);
        setLoading(false);
      });
  }, [isOpen]);

  // Live countdown timer for active reservation
  useEffect(() => {
    if (!activeReservation) return;

    const timer = setInterval(() => {
      const expiry = getExpiryTime(activeReservation);
      const diff = expiry - Date.now();

      if (diff <= 0) {
        setActiveReservation(null);
        setTimeLeft("00m 00s (Expired)");
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(
          `${hours > 0 ? `${hours}h ` : ""}${mins.toString().padStart(2, "0")}m ${secs
            .toString()
            .padStart(2, "0")}s`
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeReservation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in-scale">
      <div className="w-full max-w-md rounded-3xl border border-purple-500/40 bg-[#0a0614] opacity-100 p-6 shadow-[0_0_60px_rgba(168,85,247,0.35)] relative overflow-hidden text-white space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-center hover:bg-purple-500/20 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.4)] shrink-0">
            <Car className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/40">
              Live Vehicle Tracker
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1">Find My Parked Car</h2>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-purple-300/70 font-mono text-xs flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <span>Scanning active parking reservations...</span>
          </div>
        ) : activeReservation ? (
          <div className="space-y-4 font-mono">
            
            {/* Active Parked Slot Card */}
            <div className="rounded-2xl border-2 border-purple-500/60 bg-gradient-to-br from-[#170a35] via-[#100726] to-[#0a0518] p-4 space-y-3 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-300/80 font-bold uppercase">Active Parking Spot</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> VEHICLE PARKED
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <div className="text-xs text-purple-300/60 uppercase">Slot Code</div>
                  <div className="text-3xl font-black text-white tracking-tight">{activeReservation.slot_code}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-purple-300/60 uppercase">Floor Level</div>
                  <div className="text-xl font-bold text-purple-300">Level {activeReservation.floor}</div>
                </div>
              </div>

              {/* Countdown Expiration Bar */}
              <div className="p-2.5 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-between text-xs text-purple-200">
                <span className="flex items-center gap-1.5 font-bold text-amber-400">
                  <Clock className="w-3.5 h-3.5 animate-pulse" /> Time Remaining
                </span>
                <span className="font-extrabold font-mono text-emerald-400 tracking-wider">
                  {timeLeft || "Calculating..."}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 text-purple-200/80">
                <div className="flex items-center gap-1.5"><Car className="w-3.5 h-3.5 text-purple-400" /> {activeReservation.vehicle_number || "MH-12-MP-8899"}</div>
                <div className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-purple-400" /> Zone {activeReservation.slot_code.charAt(0) || "A"}</div>
              </div>
            </div>

            {/* Walking Directions Box */}
            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2 text-xs text-purple-200/90">
              <div className="flex items-center gap-2 font-bold text-purple-300">
                <Footprints className="w-4 h-4 text-amber-400" /> Wayfinding Route
              </div>
              <p className="text-[11px] text-purple-200/70 font-sans leading-relaxed">
                Take Main Elevator down to <strong>Level {activeReservation.floor}</strong>. Follow yellow pedestrian crosswalk lines toward <strong>Zone {activeReservation.slot_code.charAt(0) || "A"}</strong>.
              </p>
            </div>

            <Button
              onClick={() => {
                if (activeReservation) {
                  window.dispatchEvent(new CustomEvent("start-ar-guide", { detail: activeReservation }));
                }
                onClose();
              }}
              className="w-full h-12 font-bold text-xs rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-[0_0_25px_rgba(168,85,247,0.45)] flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
            >
              <Navigation className="w-4 h-4" /> Start AR Walking Guide
            </Button>
          </div>
        ) : (
          <div className="py-8 text-center space-y-3 font-mono">
            <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">No Active Parking Booking Found</h3>
              <p className="text-xs text-purple-300/70 mt-1 max-w-xs mx-auto">
                You do not have an active vehicle booking right now. Vehicle tracking is only available while a parking session is active before it expires.
              </p>
            </div>
            <Button
              onClick={onClose}
              className="px-6 h-10 font-bold text-xs rounded-full bg-purple-600 text-white"
            >
              Reserve a Slot Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

