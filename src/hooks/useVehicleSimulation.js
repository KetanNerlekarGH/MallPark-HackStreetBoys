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
  "#ec4899", // Pink
];

// Base Zone Groupings (A, B, C)
const ZONE_SLOTS = {
  A: ["A-103", "A-106", "A-107", "A-108", "A-109", "A-110"],
  B: ["B-111", "B-112", "B-113", "B-114", "B-115", "B-116", "B-117", "B-118", "B-119", "B-120"],
  C: ["C-121", "C-122", "C-123", "C-124", "C-126", "C-127", "C-128", "C-129", "C-130"],
};

export function useVehicleSimulation({ onSlotStateChange, autoSimulate = false, slots = [], selectedFloor = 1 } = {}) {
  const [vehicles, setVehicles] = useState([]);
  const vehiclesRef = useRef([]);
  vehiclesRef.current = vehicles;

  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  const selectedFloorRef = useRef(selectedFloor);
  selectedFloorRef.current = selectedFloor;

  // Zone distribution index (rotates Zone A -> Zone B -> Zone C)
  const nextZoneIdxRef = useRef(0);
  const activeSlotVehiclesRef = useRef(new Map());

  // Reset vehicles when floor level changes
  useEffect(() => {
    activeSlotVehiclesRef.current.clear();
    setVehicles([]);
  }, [selectedFloor]);

  // Compute set of all occupied or assigned slot codes across database and active vehicles
  const getOccupiedOrAssignedSlotsSet = useCallback(() => {
    const set = new Set();
    const fl = selectedFloorRef.current || 1;

    // 1. Reserved / Occupied / Handicapped spots in database
    slotsRef.current.forEach((s) => {
      if (s.status === "reserved" || s.status === "occupied" || s.is_handicapped) {
        set.add(s.code.toUpperCase());
      }
    });

    // 2. Active simulated vehicles
    vehiclesRef.current.forEach((v) => {
      if (v.slotId && v.phase !== VEHICLE_PHASES.CLEANUP) {
        set.add(v.slotId.toUpperCase());
      }
    });

    // 3. Always preserve reserved handicapped spots (A-101, A-102, A-201, A-202, A-301, A-302)
    set.add(`A-${fl}01`);
    set.add(`A-${fl}02`);

    return set;
  }, []);

  // Reroute approaching cars away from reserved/handicapped spots
  useEffect(() => {
    if (!vehicles || vehicles.length === 0) return;
    const reservedSet = getOccupiedOrAssignedSlotsSet();

    setVehicles((prevVehicles) => {
      let changed = false;
      const updatedList = prevVehicles.map((v) => {
        const normSlot = (v.slotId || "").toUpperCase();
        if ((v.phase === VEHICLE_PHASES.ENTERING || v.phase === VEHICLE_PHASES.PARKING) && reservedSet.has(normSlot)) {
          const fl = selectedFloorRef.current || 1;
          const assignedSet = getOccupiedOrAssignedSlotsSet();
          const candidateSlots = [...ZONE_SLOTS.A, ...ZONE_SLOTS.B, ...ZONE_SLOTS.C].map((c) =>
            c.replace(/([A-Z])-1(\d\d)/, `$1-${fl}$2`)
          );
          const unassigned = candidateSlots.filter((code) => !assignedSet.has(code.toUpperCase()));

          if (unassigned.length > 0) {
            const nextSlot = unassigned[Math.floor(Math.random() * unassigned.length)];
            if (nextSlot && nextSlot.toUpperCase() !== normSlot) {
              changed = true;
              const newWaypoints = getVehicleWaypoints(nextSlot);
              activeSlotVehiclesRef.current.delete(v.slotId);
              activeSlotVehiclesRef.current.set(nextSlot, v.id);
              return {
                ...v,
                slotId: nextSlot,
                waypointsData: newWaypoints,
              };
            }
          }
        }
        return v;
      });
      return changed ? updatedList : prevVehicles;
    });
  }, [slots, getOccupiedOrAssignedSlotsSet]);

  // Trigger a vehicle trip simulation to a specific spot
  const simulateCarTrip = useCallback(
    (slotId, options = {}) => {
      const fl = selectedFloorRef.current || 1;
      const assignedSet = getOccupiedOrAssignedSlotsSet();

      let targetSlot = slotId;
      if (!targetSlot || assignedSet.has(targetSlot.toUpperCase())) {
        const candidateSlots = [...ZONE_SLOTS.A, ...ZONE_SLOTS.B, ...ZONE_SLOTS.C].map((c) =>
          c.replace(/([A-Z])-1(\d\d)/, `$1-${fl}$2`)
        );
        const unassigned = candidateSlots.filter((code) => !assignedSet.has(code.toUpperCase()));
        if (unassigned.length > 0) {
          targetSlot = unassigned[Math.floor(Math.random() * unassigned.length)];
        } else {
          return null; // All spots full
        }
      }

      const waypointsData = getVehicleWaypoints(targetSlot);
      const color = options.color || CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];

      const newVehicle = {
        id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        slotId: targetSlot,
        color,
        phase: VEHICLE_PHASES.ENTERING,
        x: LANDMARKS.ENTRANCE.x,
        y: LANDMARKS.ENTRANCE.y,
        angle: -Math.PI / 2,
        speed: 0.004,
        waypointsData,
        waypointIdx: 0,
        parkedTimer: 0,
        parkDuration: options.parkDuration || 350 + Math.random() * 250,
        isBraking: false,
        isReversing: false,
      };

      activeSlotVehiclesRef.current.set(targetSlot, newVehicle.id);
      setVehicles((prev) => [...prev.filter((v) => v.slotId !== targetSlot), newVehicle]);

      return newVehicle.id;
    },
    [onSlotStateChange, getOccupiedOrAssignedSlotsSet]
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
                if (updated.waypointIdx < entryWaypoints.length - 1) {
                  updated.waypointIdx += 1;
                  updated.phase = VEHICLE_PHASES.PARKING;
                } else {
                  // Car parked inside spot
                  updated.x = info.slot.x;
                  updated.y = info.slot.y;
                  updated.angle = info.turnInAngle;
                  updated.phase = VEHICLE_PHASES.PARKED;
                  updated.isBraking = true;

                  // Spot is RED (occupied)
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
            const approachX = info.approach.x;
            const approachY = info.approach.y;
            const dx = approachX - updated.x;
            const dy = approachY - updated.y;
            const dist = Math.hypot(dx, dy);

            let targetAngle = Math.PI / 2;
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

              // Spot turns GREEN (available) as car leaves spot corridor
              if (onSlotStateChange) {
                onSlotStateChange(slotId, "available");
              }
            }
          } else if (phase === VEHICLE_PHASES.EXITING) {
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

  // Traffic simulator distributing cars evenly across Zone A, Zone B, Zone C
  useEffect(() => {
    if (!autoSimulate) return;

    const interval = setInterval(() => {
      if (vehiclesRef.current.length < 5) {
        const assignedSet = getOccupiedOrAssignedSlotsSet();
        const zoneKeys = ["A", "B", "C"];
        const targetZone = zoneKeys[nextZoneIdxRef.current];
        nextZoneIdxRef.current = (nextZoneIdxRef.current + 1) % zoneKeys.length;

        const fl = selectedFloorRef.current || 1;
        const candidateSlots = ZONE_SLOTS[targetZone].map((c) =>
          c.replace(/([A-Z])-1(\d\d)/, `$1-${fl}$2`)
        );
        const unassignedInZone = candidateSlots.filter((code) => !assignedSet.has(code.toUpperCase()));

        let targetSlot = null;
        if (unassignedInZone.length > 0) {
          targetSlot = unassignedInZone[Math.floor(Math.random() * unassignedInZone.length)];
        } else {
          const allFloorCandidates = [...ZONE_SLOTS.A, ...ZONE_SLOTS.B, ...ZONE_SLOTS.C].map((c) =>
            c.replace(/([A-Z])-1(\d\d)/, `$1-${fl}$2`)
          );
          const allUnassigned = allFloorCandidates.filter((code) => !assignedSet.has(code.toUpperCase()));
          if (allUnassigned.length > 0) {
            targetSlot = allUnassigned[Math.floor(Math.random() * allUnassigned.length)];
          }
        }

        if (targetSlot) {
          simulateCarTrip(targetSlot);
        }
      }
    }, 3800);

    return () => clearInterval(interval);
  }, [autoSimulate, simulateCarTrip, getOccupiedOrAssignedSlotsSet]);

  return {
    vehicles,
    simulateCarTrip,
    clearVehicles,
  };
}
