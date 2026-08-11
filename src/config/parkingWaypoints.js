/**
 * Realistic Waypoint Routing & Landmark Configuration for 2D Parking Simulation.
 * Vehicles follow strict driving lane corridors:
 * - Main Entry Aisle (Northbound x: 0.32)
 * - Top Cross-Aisle (Eastbound y: 0.26)
 * - East Driving Aisle (Southbound x: 0.74)
 * - Bottom Cross-Aisle (Westbound y: 0.84)
 * - Exit Aisle (Southbound x: 0.28)
 */

export const LANDMARKS = {
  ENTRANCE: { x: 0.32, y: 0.95 },
  MAIN_AISLE_X: 0.32,
  TOP_CROSS_Y: 0.26,
  EAST_AISLE_X: 0.74,
  BOTTOM_CROSS_Y: 0.84,
  EXIT_AISLE_X: 0.28,
  EXIT_GATE: { x: 0.28, y: 0.95 },
};

// Slot Positions & Approach Aisle Coordinates
export const PARKING_SLOTS_WAYPOINTS = {
  // ZONE A (Left Column - Slots at x: 0.14, approach from Main Aisle x: 0.32)
  "A-101": { slot: { x: 0.14, y: 0.34 }, approach: { x: 0.32, y: 0.34 }, zone: "A", turnInAngle: Math.PI },
  "A-102": { slot: { x: 0.14, y: 0.40 }, approach: { x: 0.32, y: 0.40 }, zone: "A", turnInAngle: Math.PI },
  "A-103": { slot: { x: 0.14, y: 0.46 }, approach: { x: 0.32, y: 0.46 }, zone: "A", turnInAngle: Math.PI },
  "A-106": { slot: { x: 0.14, y: 0.52 }, approach: { x: 0.32, y: 0.52 }, zone: "A", turnInAngle: Math.PI },
  "A-107": { slot: { x: 0.14, y: 0.58 }, approach: { x: 0.32, y: 0.58 }, zone: "A", turnInAngle: Math.PI },
  "A-108": { slot: { x: 0.14, y: 0.64 }, approach: { x: 0.32, y: 0.64 }, zone: "A", turnInAngle: Math.PI },
  "A-109": { slot: { x: 0.14, y: 0.70 }, approach: { x: 0.32, y: 0.70 }, zone: "A", turnInAngle: Math.PI },
  "A-110": { slot: { x: 0.14, y: 0.76 }, approach: { x: 0.32, y: 0.76 }, zone: "A", turnInAngle: Math.PI },

  // ZONE B LEFT COLUMN (Slots at x: 0.44, approach from Main Aisle x: 0.32)
  "B-111": { slot: { x: 0.44, y: 0.34 }, approach: { x: 0.32, y: 0.34 }, zone: "B_LEFT", turnInAngle: 0 },
  "B-112": { slot: { x: 0.44, y: 0.40 }, approach: { x: 0.32, y: 0.40 }, zone: "B_LEFT", turnInAngle: 0 },
  "B-113": { slot: { x: 0.44, y: 0.46 }, approach: { x: 0.32, y: 0.46 }, zone: "B_LEFT", turnInAngle: 0 },
  "B-114": { slot: { x: 0.44, y: 0.52 }, approach: { x: 0.32, y: 0.52 }, zone: "B_LEFT", turnInAngle: 0 },
  "B-115": { slot: { x: 0.44, y: 0.58 }, approach: { x: 0.32, y: 0.58 }, zone: "B_LEFT", turnInAngle: 0 },

  // ZONE B RIGHT COLUMN (Slots at x: 0.57, approach from East Aisle x: 0.74)
  "B-116": { slot: { x: 0.57, y: 0.52 }, approach: { x: 0.74, y: 0.52 }, zone: "B_RIGHT", turnInAngle: Math.PI },
  "B-117": { slot: { x: 0.57, y: 0.58 }, approach: { x: 0.74, y: 0.58 }, zone: "B_RIGHT", turnInAngle: Math.PI },
  "B-118": { slot: { x: 0.57, y: 0.64 }, approach: { x: 0.74, y: 0.64 }, zone: "B_RIGHT", turnInAngle: Math.PI },
  "B-119": { slot: { x: 0.57, y: 0.70 }, approach: { x: 0.74, y: 0.70 }, zone: "B_RIGHT", turnInAngle: Math.PI },
  "B-120": { slot: { x: 0.57, y: 0.76 }, approach: { x: 0.74, y: 0.76 }, zone: "B_RIGHT", turnInAngle: Math.PI },

  // ZONE C (Right Column - Slots at x: 0.88, approach from East Aisle x: 0.74)
  "C-121": { slot: { x: 0.88, y: 0.28 }, approach: { x: 0.74, y: 0.28 }, zone: "C", turnInAngle: 0 },
  "C-122": { slot: { x: 0.88, y: 0.34 }, approach: { x: 0.74, y: 0.34 }, zone: "C", turnInAngle: 0 },
  "C-123": { slot: { x: 0.88, y: 0.40 }, approach: { x: 0.74, y: 0.40 }, zone: "C", turnInAngle: 0 },
  "C-124": { slot: { x: 0.88, y: 0.46 }, approach: { x: 0.74, y: 0.46 }, zone: "C", turnInAngle: 0 },
  "C-126": { slot: { x: 0.88, y: 0.52 }, approach: { x: 0.74, y: 0.52 }, zone: "C", turnInAngle: 0 },
  "C-127": { slot: { x: 0.88, y: 0.58 }, approach: { x: 0.74, y: 0.58 }, zone: "C", turnInAngle: 0 },
  "C-128": { slot: { x: 0.88, y: 0.64 }, approach: { x: 0.74, y: 0.64 }, zone: "C", turnInAngle: 0 },
  "C-129": { slot: { x: 0.88, y: 0.70 }, approach: { x: 0.74, y: 0.70 }, zone: "C", turnInAngle: 0 },
  "C-130": { slot: { x: 0.88, y: 0.76 }, approach: { x: 0.74, y: 0.76 }, zone: "C", turnInAngle: 0 },
};

/**
 * Calculates complete multi-waypoint driving corridor routes for a slot ID.
 */
export function getVehicleWaypoints(slotId) {
  const info = PARKING_SLOTS_WAYPOINTS[slotId] || PARKING_SLOTS_WAYPOINTS["A-103"];
  const isEastSide = info.zone === "B_RIGHT" || info.zone === "C";

  let entryWaypoints = [];
  let exitWaypoints = [];

  if (!isEastSide) {
    // ZONE A & ZONE B LEFT (Drive up Main Aisle x: 0.32 directly to approach Y)
    entryWaypoints = [
      { x: LANDMARKS.MAIN_AISLE_X, y: 0.95, targetAngle: -Math.PI / 2 },
      { x: LANDMARKS.MAIN_AISLE_X, y: info.approach.y, targetAngle: -Math.PI / 2 },
      { x: info.slot.x, y: info.slot.y, targetAngle: info.turnInAngle },
    ];

    exitWaypoints = [
      { x: LANDMARKS.EXIT_AISLE_X, y: info.approach.y, targetAngle: Math.PI / 2 },
      { x: LANDMARKS.EXIT_AISLE_X, y: 0.95, targetAngle: Math.PI / 2 },
    ];
  } else {
    // ZONE B RIGHT & ZONE C (Must take Top Cross-Aisle & East Aisle - NO GLIDING THROUGH ZONE B!)
    entryWaypoints = [
      { x: LANDMARKS.MAIN_AISLE_X, y: 0.95, targetAngle: -Math.PI / 2 },
      // Drive up Main Aisle to Top Cross-Aisle
      { x: LANDMARKS.MAIN_AISLE_X, y: LANDMARKS.TOP_CROSS_Y, targetAngle: -Math.PI / 2 },
      // Turn Right East along Top Cross-Aisle to East Aisle
      { x: LANDMARKS.EAST_AISLE_X, y: LANDMARKS.TOP_CROSS_Y, targetAngle: 0 },
      // Turn South down East Aisle to slot approach Y
      { x: LANDMARKS.EAST_AISLE_X, y: info.approach.y, targetAngle: Math.PI / 2 },
      // Turn into spot
      { x: info.slot.x, y: info.slot.y, targetAngle: info.turnInAngle },
    ];

    exitWaypoints = [
      // Reverse out to East Aisle approach
      { x: LANDMARKS.EAST_AISLE_X, y: info.approach.y, targetAngle: Math.PI / 2 },
      // Drive South down East Aisle to Bottom Cross-Aisle
      { x: LANDMARKS.EAST_AISLE_X, y: LANDMARKS.BOTTOM_CROSS_Y, targetAngle: Math.PI / 2 },
      // Turn West along Bottom Cross-Aisle to Exit Aisle
      { x: LANDMARKS.EXIT_AISLE_X, y: LANDMARKS.BOTTOM_CROSS_Y, targetAngle: Math.PI },
      // Turn South down Exit Aisle out to Exit Gate
      { x: LANDMARKS.EXIT_AISLE_X, y: 0.95, targetAngle: Math.PI / 2 },
    ];
  }

  return {
    slotId,
    info,
    entryWaypoints,
    exitWaypoints,
  };
}
