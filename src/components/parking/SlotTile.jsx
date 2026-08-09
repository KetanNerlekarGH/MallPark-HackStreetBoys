import React from "react";
import { Zap, Car, Bike, Truck } from "lucide-react";
import { motion } from "framer-motion";

const styles = {
  available: "bg-purple-500/10 border-purple-500/35 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.15)] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] cursor-pointer",
  occupied: "bg-rose-500/10 border-rose-500/20 text-rose-400/80 cursor-not-allowed opacity-70",
  reserved: "bg-amber-500/10 border-amber-500/30 text-amber-400 cursor-not-allowed opacity-90",
};

const icons = { car: Car, bike: Bike, suv: Truck };

export default function SlotTile({ slot, onSelect }) {
  const Icon = icons[slot.vehicle_type] || Car;
  const disabled = slot.status !== "available";
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: disabled ? 1 : 1.06, y: disabled ? 0 : -3 }}
      whileTap={{ scale: disabled ? 1 : 0.94 }}
      transition={{ type: "spring", stiffness: 350, damping: 20 }}
      disabled={disabled}
      onClick={() => !disabled && onSelect(slot)}
      className={`relative aspect-[4/5] rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all duration-300 ${styles[slot.status]}`}
    >
      {slot.is_ev && <Zap className="absolute top-1.5 right-1.5 w-3 h-3 text-sky-500" />}
      <Icon className="w-4 h-4 opacity-70" />
      <span className="text-[11px] font-medium tracking-tight">{slot.code}</span>
    </motion.button>
  );
}