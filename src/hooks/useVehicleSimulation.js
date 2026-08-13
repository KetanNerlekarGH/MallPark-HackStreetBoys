import { useState, useEffect, useRef, useCallback } from "react";
import { PARKING_SLOTS_WAYPOINTS, getVehicleWaypoints, LANDMARKS } from "@/config/parkingWaypoints";

export const VEHICLE_PHASES = {
  ENTERING: "ENTERING",
  PARKING: "PARKING",
  PARKED: "PARKED",
  LEAVING: "LEAVING",
  EXITING: "EXITING",
  VALET_LEAVING: "VALET_LEAVING",
  VALET_TO_ELEVATOR: "VALET_TO_ELEVATOR",
  VALET_ELEVATOR_PAUSE: "VALET_ELEVATOR_PAUSE",
  VALET_TO_EXIT: "VALET_TO_EXIT",
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

export function useVehicleSimulation({ onSlotStateChange, autoSimulate = true, slots = [], selectedFloor = 1 } = {}) {
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

  // Set of occupied or assigned slots
  const getOccupiedOrAssignedSlotsSet = useCallback(() => {
    const set = new Set();

    (vehiclesRef.current || []).forEach((v) => {
      if (v.slotId && v.phase !== VEHICLE_PHASES.CLEANUP) {
        set.add(v.slotId.toUpperCase());
      }
    });

    const fl = selectedFloorRef.current || 1;
    set.add(`C-${fl}21`);
    set.add(`C-${fl}22`);

    return set;
  }, []);

  // Spawn a vehicle targeting a slot ID
  const addVehicle = useCallback(
    (options = {}) => {
      let targetSlot = options.slotId;

      if (!targetSlot) {
        const zoneKeys = ["A", "B", "C"];
        const zone = options.zone || zoneKeys[nextZoneIdxRef.current];
        nextZoneIdxRef.current = (nextZoneIdxRef.current + 1) % zoneKeys.length;

        const fl = selectedFloorRef.current || 1;
        const candidateSlots = ZONE_SLOTS[zone].map((c) =>
          c.replace(/([A-Z])-1(\d\d)/, `$1-${fl}$2`)
        );
        const assignedSet = getOccupiedOrAssignedSlotsSet();
        const unassigned = candidateSlots.filter((code) => !assignedSet.has(code.toUpperCase()));
        if (unassigned.length > 0) {
          targetSlot = unassigned[Math.floor(Math.random() * unassigned.length)];
        } else {
          return null; // All spots full
        }
      }

      const waypointsData = getVehicleWaypoints(targetSlot);
      const color = options.color || CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)];

      const spawnX = waypointsData.spawnPoint ? waypointsData.spawnPoint.x : 0.28;
      const spawnY = waypointsData.spawnPoint ? waypointsData.spawnPoint.y : 0.88;

      const newVehicle = {
        id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        slotId: targetSlot,
        color,
        phase: VEHICLE_PHASES.ENTERING,
        x: spawnX,
        y: spawnY,
        angle: -Math.PI / 2,
        speed: 0.0045,
        waypointsData,
        waypointIdx: 0,
        parkedTimer: 0,
        parkDuration: options.parkDuration || 400 + Math.random() * 300,
        isBraking: false,
        isReversing: false,
      };

      activeSlotVehiclesRef.current.set(targetSlot, newVehicle.id);
      setVehicles((prev) => [...prev.filter((v) => v.slotId !== targetSlot), newVehicle]);

      return newVehicle.id;
    },
    [getOccupiedOrAssignedSlotsSet]
  );

  // Keep a stationary parked vehicle in reserved or occupied slots, and remove when reservation ends
  useEffect(() => {
    if (!slots || slots.length === 0) return;
    const currentFloor = selectedFloorRef.current || 1;
    const activeReservedOrOccupiedCodes = new Set(
      slots
        .filter((s) => (Number(s.floor) || 1) === currentFloor && (s.status === "reserved" || s.status === "occupied"))
        .map((s) => s.code.toUpperCase())
    );

    slots.forEach((s) => {
      const sFloor = Number(s.floor) || 1;
      const code = s.code ? s.code.toUpperCase() : "";
      if (sFloor === currentFloor && (s.status === "reserved" || s.status === "occupied")) {
        if (code && !activeSlotVehiclesRef.current.has(code)) {
          const waypointsData = getVehicleWaypoints(code);
          const info = waypointsData.info;
          if (info && info.slot) {
            const newVehicle = {
              id: `v_reserved_${code}`,
              slotId: code,
              color: s.status === "reserved" ? "#f59e0b" : "#ef4444",
              phase: VEHICLE_PHASES.PARKED,
              x: info.slot.x,
              y: info.slot.y,
              angle: info.turnInAngle,
              speed: 0.005,
              waypointsData,
              waypointIdx: 0,
              parkedTimer: 0,
              parkDuration: 9999999, // Stays parked stationary for reservation duration
              isBraking: true,
              isReversing: false,
              isReservedStationary: true,
              plate: s.vehicle_number || "MH-12-MP-8899",
            };
            activeSlotVehiclesRef.current.set(code, newVehicle.id);
            setVehicles((prev) => [...prev.filter((v) => v.slotId !== code), newVehicle]);
          }
        }
      }
    });

    // When a reservation ends (status becomes available), turn spot green immediately and dispatch the car to Elevator Lobby, then Exit!
    setVehicles((prev) => {
      return prev.map((v) => {
        if (v.isReservedStationary && (v.phase === VEHICLE_PHASES.PARKED || v.phase === VEHICLE_PHASES.PARKING)) {
          const isStillReservedOrOccupied = activeReservedOrOccupiedCodes.has(v.slotId.toUpperCase());
          if (!isStillReservedOrOccupied) {
            // Immediately free the spot to green available
            if (onSlotStateChange) {
              onSlotStateChange(v.slotId, "available");
            }
            const waypointsData = getVehicleWaypoints(v.slotId);
            const info = waypointsData.info;
            const corridorX = info && info.approach ? info.approach.x : 0.28;

            // Dispatch the car to reverse out, drive to Elevator Lobby, pause, then exit
            return {
              ...v,
              phase: VEHICLE_PHASES.VALET_LEAVING,
              waypointIdx: 0,
              isBraking: false,
              isReversing: true,
              isReservedStationary: false,
              color: "#a855f7",
              valetElevatorWPs: [
                { x: corridorX, y: LANDMARKS.TOP_CROSS_Y, targetAngle: -Math.PI / 2 },
                { x: 0.73, y: LANDMARKS.TOP_CROSS_Y, targetAngle: 0 },
              ],
            };
          }
        }
        return v;
      });
    });
  }, [slots, selectedFloor, onSlotStateChange]);

  // Traffic simulator distributing cars evenly across Zone A, Zone B, Zone C
  useEffect(() => {
    if (!autoSimulate) return;

    // Immediately spawn first vehicle on load
    if (vehiclesRef.current.length === 0) {
      addVehicle();
    }

    const interval = setInterval(() => {
      if (vehiclesRef.current.length < 6) {
        addVehicle();
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [autoSimulate, addVehicle]);

  // Listen for Valet Pickup Request Event
  useEffect(() => {
    const handleValetPickup = (e) => {
      const { vehicleNo } = e.detail || {};
      const normInput = (vehicleNo || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

      setVehicles((prev) => {
        let matched = false;
        const updated = prev.map((v) => {
          const vPlate = (v.plate || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
          const isMatch = matched === false && (
            (vPlate && normInput && (vPlate.includes(normInput) || normInput.includes(vPlate))) ||
            v.slotId.toUpperCase().includes(normInput) ||
            !normInput
          );

          if (isMatch && (v.phase === VEHICLE_PHASES.PARKED || v.phase === VEHICLE_PHASES.PARKING)) {
            matched = true;
            return {
              ...v,
              phase: VEHICLE_PHASES.VALET_LEAVING,
              waypointIdx: 0,
              parkedTimer: 0,
              isBraking: false,
              isReversing: true,
              color: "#a855f7",
            };
          }
          return v;
        });

        if (!matched && slotsRef.current) {
          const targetSlot = slotsRef.current.find(
            (s) => (s.status === "reserved" || s.status === "occupied")
          );
          if (targetSlot) {
            const code = targetSlot.code.toUpperCase();
            const waypointsData = getVehicleWaypoints(code);
            const info = waypointsData.info;
            if (info && info.slot) {
              const valetVehicle = {
                id: `v_valet_${Date.now()}`,
                slotId: code,
                color: "#a855f7",
                phase: VEHICLE_PHASES.VALET_LEAVING,
                x: info.slot.x,
                y: info.slot.y,
                angle: info.turnInAngle,
                speed: 0.0055,
                waypointsData,
                waypointIdx: 0,
                parkedTimer: 0,
                isBraking: false,
                isReversing: true,
              };
              activeSlotVehiclesRef.current.set(code, valetVehicle.id);
              return [...updated.filter((v) => v.slotId !== code), valetVehicle];
            }
          }
        }

        return updated;
      });
    };

    window.addEventListener("dispatch-valet-pickup", handleValetPickup);
    return () => window.removeEventListener("dispatch-valet-pickup", handleValetPickup);
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

                  if (onSlotStateChange) {
                    onSlotStateChange(slotId, "occupied");
                  }
                }
              }
            }
          } else if (phase === VEHICLE_PHASES.PARKED) {
            if (!updated.isReservedStationary) {
              updated.parkedTimer += 1;
              if (updated.parkedTimer >= updated.parkDuration) {
                updated.phase = VEHICLE_PHASES.LEAVING;
                updated.waypointIdx = 0;
                updated.isBraking = false;
                updated.isReversing = true;
              }
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
          } else if (phase === VEHICLE_PHASES.VALET_LEAVING) {
            // Step 1 of Valet: Reverse 90° straight out to approach aisle
            const approachX = info.approach.x;
            const approachY = info.approach.y;
            const dx = approachX - updated.x;
            const dy = approachY - updated.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 0.008) {
              updated.x += dx * 0.08;
              updated.y += dy * 0.08;
            } else {
              updated.x = approachX;
              updated.y = approachY;
              updated.phase = VEHICLE_PHASES.VALET_TO_ELEVATOR;
              updated.waypointIdx = 0;
              updated.isReversing = false;

              // Generate waypoints from approach to Elevator Lobby (x: 0.73, y: 0.24)
              const corridorX = info.approach.x;
              updated.valetElevatorWPs = [
                { x: corridorX, y: LANDMARKS.TOP_CROSS_Y, targetAngle: -Math.PI / 2 },
                { x: 0.73, y: LANDMARKS.TOP_CROSS_Y, targetAngle: 0 },
              ];
            }
          } else if (phase === VEHICLE_PHASES.VALET_TO_ELEVATOR) {
            // Step 2 of Valet: Drive up road corridor to Elevator Lobby (0.73, 0.24)
            const wps = updated.valetElevatorWPs || [];
            const currentWP = wps[updated.waypointIdx];

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
                updated.x += (dx / dist) * (updated.speed * 1.3);
                updated.y += (dy / dist) * (updated.speed * 1.3);
              } else {
                if (updated.waypointIdx < wps.length - 1) {
                  updated.waypointIdx += 1;
                } else {
                  // Reached Elevator Lobby! Pause for passengers to enter
                  updated.phase = VEHICLE_PHASES.VALET_ELEVATOR_PAUSE;
                  updated.parkedTimer = 0;
                  updated.isBraking = true;
                  updated.angle = 0; // facing Elevator Lobby
                }
              }
            } else {
              updated.phase = VEHICLE_PHASES.VALET_ELEVATOR_PAUSE;
              updated.parkedTimer = 0;
              updated.isBraking = true;
            }
          } else if (phase === VEHICLE_PHASES.VALET_ELEVATOR_PAUSE) {
            // Step 3 of Valet: Stop at Elevator Lobby for ~4 seconds (200 ticks)
            updated.parkedTimer += 1;
            updated.isBraking = true;
            if (updated.parkedTimer >= 200) {
              updated.phase = VEHICLE_PHASES.VALET_TO_EXIT;
              updated.waypointIdx = 0;
              updated.isBraking = false;
              updated.valetExitWPs = [
                { x: 0.73, y: LANDMARKS.BOTTOM_CROSS_Y, targetAngle: Math.PI / 2 },
                { x: LANDMARKS.EXIT_AISLE_X, y: LANDMARKS.BOTTOM_CROSS_Y, targetAngle: Math.PI },
                { x: LANDMARKS.EXIT_AISLE_X, y: 0.88, targetAngle: Math.PI / 2 },
              ];
            }
          } else if (phase === VEHICLE_PHASES.VALET_TO_EXIT) {
            // Step 4 of Valet: Drive from Elevator Lobby down East Aisle to Exit Gate (0.28, 0.88)
            const wps = updated.valetExitWPs || [];
            const currentWP = wps[updated.waypointIdx];

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
                updated.x += (dx / dist) * (updated.speed * 1.3);
                updated.y += (dy / dist) * (updated.speed * 1.3);
              } else {
                if (updated.waypointIdx < wps.length - 1) {
                  updated.waypointIdx += 1;
                } else {
                  // Reached Exit Gate! Terminate booking and clean up
                  updated.phase = VEHICLE_PHASES.CLEANUP;
                  activeSlotVehiclesRef.current.delete(slotId);

                  if (onSlotStateChange) {
                    onSlotStateChange(slotId, "available");
                  }
                  window.dispatchEvent(
                    new CustomEvent("terminate-valet-booking", { detail: { slotId } })
                  );
                }
              }
            } else {
              updated.phase = VEHICLE_PHASES.CLEANUP;
              activeSlotVehiclesRef.current.delete(slotId);
              if (onSlotStateChange) {
                onSlotStateChange(slotId, "available");
              }
              window.dispatchEvent(
                new CustomEvent("terminate-valet-booking", { detail: { slotId } })
              );
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

  return {
    vehicles,
    addVehicle,
  };
}
