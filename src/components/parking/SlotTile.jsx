import React from "react";
import { Zap, Car, Bike, Truck, Accessibility } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const styles = {
  available: "bg-purple-500/10 border-purple-500/35 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.15)] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] cursor-pointer",
  occupied: "bg-rose-500/10 border-rose-500/20 text-rose-400/80 cursor-not-allowed opacity-70",
  reserved: "bg-amber-500/30 border-amber-400/80 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.35)] cursor-not-allowed",
};

const icons = { car: Car, bike: Bike, suv: Truck };

export default function SlotTile({ slot, onSelect }) {
  const { toast } = useToast();
  const Icon = icons[slot.vehicle_type] || Car;
  const isHandicapped = slot.code?.endsWith("21") || slot.code?.endsWith("22") || slot.is_handicapped;
  const disabled = slot.status === "occupied" || slot.status === "reserved";

  const handleClick = () => {
    if (isHandicapped) {
      toast({
        title: `♿ Slot ${slot.code} Reserved for Handicapped`,
        description: `Slot ${slot.code} is reserved only for handicapped people with accessible permit badges.`,
        variant: "destructive",
      });
      return;
    }
    if (slot.status === "reserved") {
      toast({
        title: `Slot ${slot.code} is Reserved`,
        description: `Spot ${slot.code} is already reserved (marked in Yellow).`,
        variant: "destructive",
      });
      return;
    }
    if (slot.status === "available") {
      onSelect(slot);
    }
  };

  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: disabled ? 1 : 1.06, y: disabled ? 0 : -3 }}
      whileTap={{ scale: disabled ? 1 : 0.94 }}
      transition={{ type: "spring", stiffness: 350, damping: 20 }}
      disabled={disabled}
      onClick={handleClick}
      className={`relative aspect-[4/5] rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all duration-300 ${styles[slot.status]}`}
    >
      {isHandicapped ? (
        <Accessibility className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-amber-400" />
      ) : slot.is_ev ? (
        <Zap className="absolute top-1.5 right-1.5 w-3 h-3 text-sky-500" />
      ) : null}
      <Icon className="w-4 h-4 opacity-70" />
      <span className="text-[11px] font-medium tracking-tight">{slot.code}</span>
    </motion.button>
  );
}