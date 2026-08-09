import React, { useState } from "react";
import { CarFront, Clock, MapPin, X, Check, QrCode, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ValetParkingModal({ isOpen, onClose, currentMall }) {
  const [vehicleNo, setVehicleNo] = useState("MH-12-MP-8899");
  const [pickupGate, setPickupGate] = useState("Main Entrance Gate A");
  const [requested, setRequested] = useState(false);
  const [passId, setPassId] = useState("");

  if (!isOpen) return null;

  const handleRequestValet = (e) => {
    e.preventDefault();
    const id = "VALET-" + Math.floor(1000 + Math.random() * 9000);
    setPassId(id);
    setRequested(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in-scale">
      <div className="w-full max-w-md rounded-3xl border border-purple-500/40 bg-[#0a0614]/95 p-6 shadow-[0_0_60px_rgba(168,85,247,0.35)] relative overflow-hidden text-white space-y-5">
        
        {/* Close Button */}
        <button
          onClick={() => { setRequested(false); onClose(); }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-center hover:bg-purple-500/20 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.4)] shrink-0">
            <CarFront className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/40 text-[10px] font-mono tracking-wider uppercase">
              <Sparkles className="w-3 h-3 text-purple-400" /> VIP Concierge
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">Valet Parking Service</h2>
          </div>
        </div>

        {requested ? (
          <div className="space-y-4 text-center py-2 animate-fade-in-scale font-mono">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Valet Driver Dispatched</h3>
              <p className="text-xs text-purple-200/70 mt-1">
                Your driver will meet you at <strong>{pickupGate}</strong> for <strong>{currentMall?.name || "Mall"}</strong>.
              </p>
            </div>

            {/* Pass QR Box */}
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-purple-300/80">
                <span>Pass ID: <strong>{passId}</strong></span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> ETA 4 mins
                </span>
              </div>
              <div className="w-28 h-28 bg-white p-2 rounded-xl mx-auto flex items-center justify-center shadow-md">
                <QrCode className="w-full h-full text-slate-900" />
              </div>
              <div className="text-[11px] text-purple-300/60">Show QR code to valet captain upon arrival</div>
            </div>

            <Button
              onClick={() => { setRequested(false); onClose(); }}
              className="w-full h-11 font-bold text-xs rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-md"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRequestValet} className="space-y-4 font-mono">
            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-purple-300/80 pl-1">Vehicle License Plate</label>
              <Input
                type="text"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                placeholder="MH-12-AB-1234"
                className="h-11 px-4 rounded-2xl border border-purple-500/40 bg-purple-950/40 text-white text-xs font-semibold focus:border-purple-400"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] uppercase tracking-wider text-purple-300/80 pl-1">Drop-off / Pickup Gate</label>
              <select
                value={pickupGate}
                onChange={(e) => setPickupGate(e.target.value)}
                className="w-full h-11 px-4 rounded-2xl border border-purple-500/40 bg-purple-950/40 text-white text-xs font-semibold focus:border-purple-400 cursor-pointer"
              >
                <option value="Main Entrance Gate A" className="bg-[#12072e]">Main Entrance Gate A</option>
                <option value="North Plaza Gate B" className="bg-[#12072e]">North Plaza Gate B</option>
                <option value="South VIP Lobby Gate C" className="bg-[#12072e]">South VIP Lobby Gate C</option>
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between text-xs text-purple-200/80">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-purple-400" /> Concierge Valet Fee</span>
              <span className="font-extrabold text-emerald-400">₹100 / session</span>
            </div>

            <Button
              type="submit"
              className="w-full h-12 font-bold text-xs rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-[0_0_25px_rgba(168,85,247,0.45)] hover:shadow-[0_0_35px_rgba(192,132,252,0.65)] transition-all"
            >
              Request Valet Pickup
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
