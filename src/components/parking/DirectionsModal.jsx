import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Navigation, Flag, ArrowRight } from "lucide-react";

const CENTER = [12.9716, 77.5946];

function parseCoord(code) {
  // L1-A04 -> zone letter index, number
  const m = code.match(/L\d-([A-Z])(\d+)/);
  if (!m) return { z: 0, n: 0 };
  return { z: m[1].charCodeAt(0) - 65, n: parseInt(m[2], 10) };
}

function slotLatLng(code) {
  const { z, n } = parseCoord(code);
  return [CENTER[0] + (n - 10) * 0.00022, CENTER[1] + (z - 1) * 0.00035];
}

const entranceIcon = L.divIcon({
  className: "",
  html: '<div style="background:#1d5fb0;color:#fff;border-radius:9999px;padding:4px 8px;font-size:11px;font-weight:600;box-shadow:0 4px 10px rgba(0,0,0,.3);white-space:nowrap">Entrance</div>',
});
const slotIcon = L.divIcon({
  className: "",
  html: '<div style="width:28px;height:28px;border-radius:50%;background:#10b981;border:3px solid #fff;box-shadow:0 4px 12px rgba(16,185,129,.6)"></div>',
});

function FitBounds({ points }) {
  const map = useMap();
  React.useEffect(() => {
    if (points.length > 1) map.fitBounds(L.latLngBounds(points).pad(0.4), { animate: true });
  }, [points, map]);
  return null;
}

export default function DirectionsModal({ slot, onClose }) {
  const entrance = [CENTER[0] - 0.001, CENTER[1] - 0.0012];
  const dest = useMemo(() => (slot ? slotLatLng(slot.code) : null), [slot]);
  const path = useMemo(() => {
    if (!dest) return [];
    // L-shaped route via a corner waypoint
    return [entrance, [entrance[0], dest[1]], dest];
  }, [dest]);

  const steps = useMemo(() => {
    if (!slot) return [];
    const { z, n } = parseCoord(slot.code);
    return [
      { t: "Start at the mall entrance, Level " + slot.floor },
      { t: "Walk straight past the main lobby" },
      { t: `Turn toward Zone ${slot.zone}` },
      { t: `Continue down aisle ${slot.zone} to row ${n}` },
      { t: `Your slot ${slot.code} is on the right` },
    ];
  }, [slot]);

  if (!slot) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-3" style={{ background: "linear-gradient(135deg,#0b1f3a,#1d5fb0)" }}>
          <DialogTitle className="text-white flex items-center gap-2">
            <Navigation className="w-4 h-4" /> Directions to {slot.code}
          </DialogTitle>
          <p className="text-sky-100/80 text-sm mt-1">
            Level {slot.floor} · Zone {slot.zone} · {slot.vehicle_type.toUpperCase()}
          </p>
        </DialogHeader>

        <div className="h-64 w-full">
          <MapContainer center={CENTER} zoom={16} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; OpenStreetMap &copy; CARTO'
            />
            <Marker position={entrance} icon={entranceIcon}>
              <Popup>Mall entrance</Popup>
            </Marker>
            <Marker position={dest} icon={slotIcon}>
              <Popup>Slot {slot.code}</Popup>
            </Marker>
            <Polyline positions={path} pathOptions={{ color: "#10b981", weight: 5, opacity: 0.9, dashArray: "2 10" }} />
            <FitBounds points={[entrance, dest]} />
          </MapContainer>
        </div>

        <div className="p-6 space-y-3 max-h-60 overflow-y-auto">
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 w-7 h-7 shrink-0 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-300 flex items-center justify-center text-xs font-semibold">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm">{s.t}</p>
              </div>
              {i < steps.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground mt-1.5" />}
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
            <Flag className="w-4 h-4" /> Arrived at {slot.code}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}