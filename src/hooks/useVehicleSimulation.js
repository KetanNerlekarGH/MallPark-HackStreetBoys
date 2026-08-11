import { useState, useEffect, useRef, useCallback } from "react";
import { PARKING_SLOTS_WAYPOINTS, getVehicleWaypoints, LANDMARKS } from "@/config/parkingWaypoints";

export const VEHICLE_PHASES = {
  ENTERING: "ENTERING",
  PARKING: "PARKING",
  PARKED: "PARKED",
  LEAVING: "LEAVING",
  EXITING: "EXITING",
  CLEANUP: "CLEANUP",
};

const CAR_COLORS = [
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#a855f7", // Purple
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#ffffff", // White
];

// Zone Grouping for Balanced Zone Distribution (A, B, C)
const ZONE_SLOTS = {
  A: ["A-101", "A-102", "A-103", "A-106", "A-107", "A-108", "A-109", "A-110"],
  B: ["B-111", "B-112", "B-113", "B-114", "B-115", "B-116", "B-117", "B-118", "B-119", "B-120"],
  C: ["C-121", "C-122", "C-123", "C-124", "C-126", "C-127", "C-128", "C-129", "C-130"],
};

export function useVehicleSimulation({ onSlotStateChange, autoSimulate = false } = {}) {
  const [vehicles, setVehicles] = useState([]);
  const vehiclesRef = useRef([]);
  vehiclesRef.current = vehicles;

  // Zone distribution counter to balance Zone A, Zone B, Zone C entering cars
  const nextZoneIdxRef = useRef(0);
  const activeSlotVehiclesRef = useRef(new Map());

  // Trigger a single vehicle trip simulation to a specific spotId
  const simulateCarTrip = useCallback(
    (slotId, options = {}) => {
      const validSlotId = PARKING_SLOTS_WAYPOINTS[slotId] ? slotId : "A-103";
      const waypointsData = getVehicleWaypoints(validSlotId);
      const color = options.color || CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];

      const newVehicle = {
        id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        slotId: validSlotId,
        color,
        phase: VEHICLE_PHASES.ENTERING,
        x: LANDMARKS.ENTRANCE.x,
        y: LANDMARKS.ENTRANCE.y,
        angle: -Math.PI / 2,
        speed: 0.004, // Normalized units per frame
        waypointsData,
        waypointIdx: 0,
        parkedTimer: 0,
        parkDuration: options.parkDuration || 350 + Math.random() * 250,
        isBraking: false,
        isReversing: false,
      };

      activeSlotVehiclesRef.current.set(validSlotId, newVehicle.id);
      setVehicles((prev) => [...prev.filter((v) => v.slotId !== validSlotId), newVehicle]);
      return newVehicle.id;
    },
    []
  );

  // Clear all vehicles
  const clearVehicles = useCallback(() => {
    activeSlotVehiclesRef.current.clear();
    setVehicles([]);
  }, []);

  // Main simulation tick loop
  useEffect(() => {
    let animId;

    const tick = () => {
      setVehicles((prevVehicles) => {
        const nextVehicles = [];

        for (const v of prevVehicles) {
          const updated = { ...v };
          const { waypointsData, phase, slotId } = updated;
          const { info, entryWaypoints, exitWaypoints } = waypointsData;

          if (phase === VEHICLE_PHASES.ENTERING || phase === VEHICLE_PHASES.PARKING) {
            const currentWP = entryWaypoints[updated.waypointIdx];

            if (currentWP) {
              const dx = currentWP.x - updated.x;
              const dy = currentWP.y - updated.y;
              const dist = Math.hypot(dx, dy);

              // Smooth angular rotation
              let targetAngle = Math.atan2(dy, dx);
              if (dist < 0.03 && currentWP.targetAngle !== undefined) {
                targetAngle = currentWP.targetAngle;
              }

              let angleDiff = targetAngle - updated.angle;
              while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
              while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
              updated.angle += angleDiff * 0.14;

              if (dist > 0.008) {
                updated.x += (dx / dist) * updated.speed;
                updated.y += (dy / dist) * updated.speed;
                updated.isBraking = dist < 0.04;
              } else {
                // Advance waypoint
                if (updated.waypointIdx < entryWaypoints.length - 1) {
                  updated.waypointIdx += 1;
                  updated.phase = VEHICLE_PHASES.PARKING;
                } else {
                  // Final Parking Slot reached! Car is officially PARKED inside spot.
                  updated.x = info.slot.x;
                  updated.y = info.slot.y;
                  updated.angle = info.turnInAngle;
                  updated.phase = VEHICLE_PHASES.PARKED;
                  updated.isBraking = true;

                  // Fire callback: Spot turns RED (Occupied) as soon as car enters and parks!
                  if (onSlotStateChange) {
                    onSlotStateChange(slotId, "occupied");
                  }
                }
              }
            }
          } else if (phase === VEHICLE_PHASES.PARKED) {
            updated.parkedTimer += 1;
            if (updated.parkedTimer >= updated.parkDuration) {
              updated.phase = VEHICLE_PHASES.LEAVING;
              updated.waypointIdx = 0;
              updated.isBraking = false;
              updated.isReversing = true;
            }
          } else if (phase === VEHICLE_PHASES.LEAVING) {
            // Reverse backing out of spot into corridor
            const approachX = info.approach.x;
            const approachY = info.approach.y;
            const dx = approachX - updated.x;
            const dy = approachY - updated.y;
            const dist = Math.hypot(dx, dy);

            let targetAngle = Math.PI / 2; // South
            let angleDiff = targetAngle - updated.angle;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            updated.angle += angleDiff * 0.12;

            if (dist > 0.008) {
              updated.x += dx * 0.08;
              updated.y += dy * 0.08;
            } else {
              updated.x = approachX;
              updated.y = approachY;
              updated.angle = Math.PI / 2;
              updated.phase = VEHICLE_PHASES.EXITING;
              updated.waypointIdx = 0;
              updated.isReversing = false;

              // Fire callback: Spot turns GREEN (Available) as soon as car backs out and leaves!
              if (onSlotStateChange) {
                onSlotStateChange(slotId, "available");
              }
            }
          } else if (phase === VEHICLE_PHASES.EXITING) {
            // Drive along exit waypoints out to Exit Gate
            const currentWP = exitWaypoints[updated.waypointIdx];

            if (currentWP) {
              const dx = currentWP.x - updated.x;
              const dy = currentWP.y - updated.y;
              const dist = Math.hypot(dx, dy);

              let targetAngle = Math.atan2(dy, dx);
              if (dist < 0.03 && currentWP.targetAngle !== undefined) {
                targetAngle = currentWP.targetAngle;
              }

              let angleDiff = targetAngle - updated.angle;
              while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
              while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
              updated.angle += angleDiff * 0.14;

              if (dist > 0.01) {
                updated.x += (dx / dist) * (updated.speed * 1.2);
                updated.y += (dy / dist) * (updated.speed * 1.2);
              } else {
                if (updated.waypointIdx < exitWaypoints.length - 1) {
                  updated.waypointIdx += 1;
                } else {
                  updated.phase = VEHICLE_PHASES.CLEANUP;
                  activeSlotVehiclesRef.current.delete(slotId);
                }
              }
            }
          }

          if (updated.phase !== VEHICLE_PHASES.CLEANUP) {
            nextVehicles.push(updated);
          }
        }

        return nextVehicles;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [onSlotStateChange]);

  // Background traffic simulator with balanced Zone A, B, and C distribution
  useEffect(() => {
    if (!autoSimulate) return;

    const interval = setInterval(() => {
      if (vehiclesRef.current.length < 6) {
        const zoneKeys = ["A", "B", "C"];
        const targetZone = zoneKeys[nextZoneIdxRef.current];
        nextZoneIdxRef.current = (nextZoneIdxRef.current + 1) % zoneKeys.length;

        const candidateSlots = ZONE_SLOTS[targetZone];
        const randomSlot = candidateSlots[Math.floor(Math.random() * candidateSlots.length)];
        simulateCarTrip(randomSlot);
      }
    }, 3800);

    return () => clearInterval(interval);
  }, [autoSimulate, simulateCarTrip]);

  return {
    vehicles,
    simulateCarTrip,
    clearVehicles,
  };
}
