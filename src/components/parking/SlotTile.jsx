import React from "react";
import { Zap, Car, Bike, Truck } from "lucide-react";
import { motion } from "framer-motion";

const styles = {
  available: "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20",
  occupied: "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 cursor-not-allowed",
  reserved: "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 cursor-not-allowed",
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
      transition={{ duration: 0.25 }}
      disabled={disabled}
      onClick={() => !disabled && onSelect(slot)}
      className={`relative aspect-[4/5] rounded-2xl border flex flex-col items-center justify-center gap-1 transition-colors ${styles[slot.status]}`}
    >
      {slot.is_ev && <Zap className="absolute top-1.5 right-1.5 w-3 h-3 text-sky-500" />}
      <Icon className="w-4 h-4 opacity-70" />
      <span className="text-[11px] font-medium tracking-tight">{slot.code}</span>
    </motion.button>
  );
}