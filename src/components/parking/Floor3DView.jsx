import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { Zap, Layers, Compass, Building2, Accessibility, Eye, Play, Pause, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Video, Navigation, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Waypoints for Google Earth Style Ground POV Tour
 */
const POV_WAYPOINTS = [
  {
    name: "Main Entrance & Ticket Kiosk",
    pos: new THREE.Vector3(2.5, 1.7, 19.0),
    target: new THREE.Vector3(2.5, 1.7, 5.0),
    desc: "Main Street Entry Gate, Barrier & Automated Ticket Kiosk",
  },
  {
    name: "Zone A Driving Lane",
    pos: new THREE.Vector3(-4.0, 1.7, 8.0),
    target: new THREE.Vector3(-4.0, 1.7, -10.0),
    desc: "Zone A Northbound & Southbound Driving Corridor",
  },
  {
    name: "Curved Ramp to 2nd Floor",
    pos: new THREE.Vector3(-11.0, 1.7, -10.0),
    target: new THREE.Vector3(-11.0, 3.5, -15.0),
    desc: "Dual Elevated Curved Vehicle Ramp to Level 2",
  },
  {
    name: "Top Cross-Aisle Walkway",
    pos: new THREE.Vector3(0.0, 1.7, -13.5),
    target: new THREE.Vector3(12.0, 1.7, -13.5),
    desc: "Pedestrian Crosswalk connecting Zone A, B, and C",
  },
  {
    name: "Elevator Lobby & Fire Staircase",
    pos: new THREE.Vector3(12.0, 1.7, -11.0),
    target: new THREE.Vector3(14.5, 2.5, -12.5),
    desc: "Glass Panoramic Elevators, Fire Exit & Stairwell",
  },
  {
    name: "Zone C Pedestrian Walkway",
    pos: new THREE.Vector3(12.5, 1.7, 5.0),
    target: new THREE.Vector3(12.5, 1.7, 18.0),
    desc: "Zone C Accessible Bays & Pedestrian Safety Corridor",
  },
];

/**
 * Creates realistic 3D Car Model Mesh with curved chassis, glass windows, headlights & wheels
 */
function createRealistic3DCarMesh(color = "#334155", isEv = false, isHandicapped = false) {
  const carGroup = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(isHandicapped ? "#2563eb" : color),
    metalness: 0.75,
    roughness: 0.25,
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.1,
  });

  // Chassis Body
  const chassisGeo = new THREE.BoxGeometry(1.65, 0.45, 3.6);
  chassisGeo.translate(0, 0.32, 0);
  const chassis = new THREE.Mesh(chassisGeo, bodyMat);
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  carGroup.add(chassis);

  // Aerodynamic Cabin Roof
  const cabinGeo = new THREE.BoxGeometry(1.4, 0.48, 1.85);
  cabinGeo.translate(0, 0.78, -0.15);
  const cabin = new THREE.Mesh(cabinGeo, bodyMat);
  cabin.castShadow = true;
  carGroup.add(cabin);

  // Windshield (Front Glass)
  const windshieldGeo = new THREE.BoxGeometry(1.32, 0.45, 0.75);
  windshieldGeo.rotateX(Math.PI / 5.5);
  windshieldGeo.translate(0, 0.75, 0.75);
  const windshield = new THREE.Mesh(windshieldGeo, glassMat);
  carGroup.add(windshield);

  // Rear Window Glass
  const rearWindowGeo = new THREE.BoxGeometry(1.32, 0.42, 0.75);
  rearWindowGeo.rotateX(-Math.PI / 5.5);
  rearWindowGeo.translate(0, 0.75, -1.05);
  const rearWindow = new THREE.Mesh(rearWindowGeo, glassMat);
  carGroup.add(rearWindow);

  // Headlights
  const hlGeo = new THREE.BoxGeometry(0.4, 0.08, 0.08);
  const hlMat = new THREE.MeshStandardMaterial({
    color: isEv ? 0x38bdf8 : 0xfff099,
    emissive: isEv ? 0x0284c7 : 0xeab308,
    emissiveIntensity: 0.9,
  });
  const hlLeft = new THREE.Mesh(hlGeo, hlMat);
  hlLeft.position.set(-0.55, 0.42, 1.81);
  const hlRight = new THREE.Mesh(hlGeo, hlMat);
  hlRight.position.set(0.55, 0.42, 1.81);
  carGroup.add(hlLeft, hlRight);

  // Taillights
  const tlGeo = new THREE.BoxGeometry(0.4, 0.08, 0.08);
  const tlMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 0.8,
  });
  const tlLeft = new THREE.Mesh(tlGeo, tlMat);
  tlLeft.position.set(-0.55, 0.42, -1.81);
  const tlRight = new THREE.Mesh(tlGeo, tlMat);
  tlRight.position.set(0.55, 0.42, -1.81);
  carGroup.add(tlLeft, tlRight);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 24);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
  const hubGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.24, 16);
  hubGeo.rotateZ(Math.PI / 2);

  [
    [-0.85, 0.32, 1.05],
    [0.85, 0.32, 1.05],
    [-0.85, 0.32, -1.05],
    [0.85, 0.32, -1.05],
  ].forEach(([x, y, z]) => {
    const tire = new THREE.Mesh(wheelGeo, wheelMat);
    tire.position.set(x, y, z);
    tire.castShadow = true;
    const hub = new THREE.Mesh(hubGeo, chromeMat);
    hub.position.set(x, y, z);
    carGroup.add(tire, hub);
  });

  return carGroup;
}

/**
 * Creates 3D Ticket Kiosk & Entrance Barrier Structure
 */
function createTicketKioskStructure() {
  const kioskGroup = new THREE.Group();

  // Kiosk Box Building
  const boxGeo = new THREE.BoxGeometry(1.6, 2.4, 2.2);
  boxGeo.translate(0, 1.2, 0);
  const boxMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.castShadow = true;
  kioskGroup.add(box);

  // Glass Window
  const winGeo = new THREE.BoxGeometry(1.62, 0.9, 1.2);
  winGeo.translate(0, 1.5, 0);
  const winMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });
  kioskGroup.add(new THREE.Mesh(winGeo, winMat));

  // Glowing Ticket Machine Display
  const screenGeo = new THREE.BoxGeometry(0.08, 0.45, 0.35);
  screenGeo.translate(-0.85, 1.2, 0);
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 1.0 });
  kioskGroup.add(new THREE.Mesh(screenGeo, screenMat));

  // Barrier Gate Post & Arm
  const postGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.2, 16);
  postGeo.translate(0, 0.6, 1.6);
  const postMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8 });
  kioskGroup.add(new THREE.Mesh(postGeo, postMat));

  // Barrier Arm Stripe
  const armGeo = new THREE.BoxGeometry(3.6, 0.08, 0.12);
  armGeo.translate(-1.8, 1.05, 1.6);
  const armMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.5 });
  kioskGroup.add(new THREE.Mesh(armGeo, armMat));

  return kioskGroup;
}

/**
 * Creates Realistic Curved Ramp up to Second Floor Structure (Top Left)
 */
function createCurvedRampStructure() {
  const rampGroup = new THREE.Group();

  // Dual Curved Ramp Surface (Outer & Inner lanes)
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-14, 0, -4),
    new THREE.Vector3(-14, 4.5, -16),
    new THREE.Vector3(-2, 9.0, -16)
  );

  const points = curve.getPoints(30);
  const rampGeo = new THREE.BufferGeometry().setFromPoints(points);

  // Extruded Curved Slab Ramp
  const shape = new THREE.Shape();
  shape.moveTo(-3, 0);
  shape.lineTo(3, 0);
  shape.lineTo(3, 0.4);
  shape.lineTo(-3, 0.4);
  shape.closePath();

  const extrudeSettings = {
    steps: 40,
    bevelEnabled: false,
    extrudePath: curve,
  };

  const extrudeGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const rampMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.3, roughness: 0.6 });
  const rampMesh = new THREE.Mesh(extrudeGeo, rampMat);
  rampMesh.receiveShadow = true;
  rampGroup.add(rampMesh);

  // Yellow Safety Guardrails along curve
  const railMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
  const railGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.0, 12);

  points.forEach((pt, i) => {
    if (i % 4 === 0) {
      const postL = new THREE.Mesh(railGeo, railMat);
      postL.position.set(pt.x - 2.8, pt.y + 0.5, pt.z);
      const postR = new THREE.Mesh(railGeo, railMat);
      postR.position.set(pt.x + 2.8, pt.y + 0.5, pt.z);
      rampGroup.add(postL, postR);
    }
  });

  return rampGroup;
}

/**
 * Creates Elevator Lobby & Staircase Structure (Top Right)
 */
function createElevatorLobbyStructure() {
  const lobbyGroup = new THREE.Group();

  // Main Enclosure Tower
  const towerGeo = new THREE.BoxGeometry(6.5, 6.0, 7.5);
  towerGeo.translate(0, 3.0, 0);
  const towerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
  const tower = new THREE.Mesh(towerGeo, towerMat);
  tower.castShadow = true;
  lobbyGroup.add(tower);

  // Dual Glass Elevator Shafts
  const eleGlassGeo = new THREE.BoxGeometry(2.4, 5.4, 2.8);
  eleGlassGeo.translate(-1.6, 2.7, 0.2);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.55,
  });
  lobbyGroup.add(new THREE.Mesh(eleGlassGeo, glassMat));

  // Illuminated Elevator Cab Inserts
  const cabGeo = new THREE.BoxGeometry(2.0, 2.2, 2.2);
  cabGeo.translate(-1.6, 2.0, 0.2);
  const cabMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7c3aed, emissiveIntensity: 0.9 });
  lobbyGroup.add(new THREE.Mesh(cabGeo, cabMat));

  // Fire Exit Door Frame (Red accent)
  const doorGeo = new THREE.BoxGeometry(1.4, 2.4, 0.1);
  doorGeo.translate(1.8, 1.2, 3.76);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.6 });
  lobbyGroup.add(new THREE.Mesh(doorGeo, doorMat));

  // Illuminated "ELEVATOR & STAIRS" Header Sign
  const signGeo = new THREE.BoxGeometry(5.8, 0.7, 0.2);
  signGeo.translate(0, 5.2, 3.8);
  const signMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.0 });
  lobbyGroup.add(new THREE.Mesh(signGeo, signMat));

  return lobbyGroup;
}

/**
 * Creates 3D EV Charging Station Pillar
 */
function createEvPillar() {
  const group = new THREE.Group();
  const pillarGeo = new THREE.BoxGeometry(0.35, 1.3, 0.35);
  pillarGeo.translate(0, 0.65, 0);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.2 });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.castShadow = true;
  group.add(pillar);

  const screenGeo = new THREE.BoxGeometry(0.22, 0.35, 0.05);
  screenGeo.translate(0, 0.9, 0.16);
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1 });
  group.add(new THREE.Mesh(screenGeo, screenMat));

  return group;
}

/**
 * Creates 3D Handicapped Specially Abled Pillar/Sign
 */
function createHandicappedSign() {
  const group = new THREE.Group();

  const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.4, 12);
  postGeo.translate(0, 0.7, 0);
  const postMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
  group.add(new THREE.Mesh(postGeo, postMat));

  const signGeo = new THREE.BoxGeometry(0.5, 0.5, 0.05);
  signGeo.translate(0, 1.35, 0);
  const signMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x1d4ed8, emissiveIntensity: 0.6 });
  group.add(new THREE.Mesh(signGeo, signMat));

  return group;
}

export default function Floor3DView({
  slots = [],
  highlightCode,
  onSelect,
  selectedFloor: propSelectedFloor,
  setSelectedFloor: propSetSelectedFloor,
}) {
  const mountRef = useRef(null);
  const [internalSelectedFloor, setInternalSelectedFloor] = useState("1");
  const [autoRotate, setAutoRotate] = useState(false);
  const [viewMode, setViewMode] = useState("orbit"); // "orbit" | "streetview"
  const [currentWaypointIdx, setCurrentWaypointIdx] = useState(0);
  const [isTourPlaying, setIsTourPlaying] = useState(false);

  const selectedFloor = propSelectedFloor !== undefined ? propSelectedFloor : internalSelectedFloor;
  const setSelectedFloor = propSetSelectedFloor || setInternalSelectedFloor;

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  const CAR_COLORS = useMemo(
    () => ["#e2e8f0", "#94a3b8", "#334155", "#0f172a", "#1e3a8a", "#0284c7", "#b91c1c", "#15803d", "#7c3aed"],
    []
  );

  // Smooth Camera Animation Target
  const targetCamPos = useRef(new THREE.Vector3(0, 26, 42));
  const targetCamLookAt = useRef(new THREE.Vector3(0, 2.0, 0));
  const currentCamLookAt = useRef(new THREE.Vector3(0, 2.0, 0));

  // Initialize Scene & Render Loop
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = 540;

    const isDark = document.documentElement.classList.contains("dark");
    const bgColor = isDark ? "#06040a" : "#f8fafc";
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.FogExp2(bgColor, 0.005);
    sceneRef.current = scene;

    const isAllMode = String(selectedFloor).toLowerCase() === "all";

    const FLOOR_HEIGHT = 9.0;
    const floorYOffsets = { 1: 0, 2: FLOOR_HEIGHT, 3: 2 * FLOOR_HEIGHT };

    // Camera Setup
    const camera = new THREE.PerspectiveCamera(viewMode === "streetview" ? 65 : 40, width / height, 0.2, 400);
    cameraRef.current = camera;

    // Set initial camera positions
    if (viewMode === "streetview") {
      const wp = POV_WAYPOINTS[currentWaypointIdx];
      camera.position.copy(wp.pos);
      camera.lookAt(wp.target);
      targetCamPos.current.copy(wp.pos);
      targetCamLookAt.current.copy(wp.target);
      currentCamLookAt.current.copy(wp.target);
    } else if (isAllMode) {
      targetCamPos.current.set(0, 38, 52);
      targetCamLookAt.current.set(0, 9.0, 0);
      camera.position.copy(targetCamPos.current);
      camera.lookAt(targetCamLookAt.current);
    } else {
      const activeLevelNum = Number(selectedFloor) || 1;
      const targetY = floorYOffsets[activeLevelNum] ?? 0;
      targetCamPos.current.set(0, targetY + 26, 42);
      targetCamLookAt.current.set(0, targetY + 2.0, 0);
      camera.position.copy(targetCamPos.current);
      camera.lookAt(targetCamLookAt.current);
    }

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.35);
    dirLight.position.set(30, 60, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xa855f7, 0.6);
    fillLight.position.set(-30, 30, -30);
    scene.add(fillLight);

    // Ground Base Asphalt Floor
    const groundGeo = new THREE.PlaneGeometry(100, 90);
    const groundMat = new THREE.MeshStandardMaterial({ color: isDark ? 0x0a0714 : 0xe2e8f0, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const raycastableMeshes = [];
    const floorsToRender = [1, 2, 3];

    // Building Support Pillars
    if (isAllMode) {
      const pillarGeo = new THREE.CylinderGeometry(0.4, 0.4, 20, 16);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.5, transparent: true, opacity: 0.6 });
      [[-18, 9, -18], [18, 9, -18], [-18, 9, 14], [18, 9, 14]].forEach(([px, py, pz]) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(px, py, pz);
        scene.add(pillar);
      });
    }

    floorsToRender.forEach((floorNum) => {
      const isVisible = isAllMode || String(selectedFloor) === String(floorNum);
      if (!isVisible) return;

      const yOffset = floorYOffsets[floorNum];

      // Floor Slab
      const floorSlabGeo = new THREE.BoxGeometry(38, 0.4, 34);
      floorSlabGeo.translate(0, yOffset, -2);
      const floorSlabMat = new THREE.MeshStandardMaterial({
        color: isAllMode ? 0x1e293b : 0x18181b,
        metalness: 0.2,
        roughness: 0.4,
        transparent: isAllMode,
        opacity: isAllMode ? 0.45 : 1.0,
      });
      const floorSlab = new THREE.Mesh(floorSlabGeo, floorSlabMat);
      floorSlab.receiveShadow = !isAllMode;
      scene.add(floorSlab);

      // Yellow Pedestrian Safety Walkways (Matching Blueprint Image)
      const walkGeo1 = new THREE.BoxGeometry(3.0, 0.05, 32.0);
      walkGeo1.translate(13.0, yOffset + 0.23, -2.0);
      const walkMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.4 });
      scene.add(new THREE.Mesh(walkGeo1, walkMat));

      const walkGeo2 = new THREE.BoxGeometry(32.0, 0.05, 3.0);
      walkGeo2.translate(0, yOffset + 0.23, 13.5);
      scene.add(new THREE.Mesh(walkGeo2, walkMat));

      // 3D Architectural Structures
      // 1. Ticket Kiosk & Entrance Gate
      const kiosk = createTicketKioskStructure();
      kiosk.position.set(2.5, yOffset, 17.5);
      scene.add(kiosk);

      // 2. Curved Ramp to Floor 2 (Top Left)
      const curvedRamp = createCurvedRampStructure();
      curvedRamp.position.set(0, yOffset, 0);
      scene.add(curvedRamp);

      // 3. Elevator Lobby & Staircase (Top Right)
      const eleLobby = createElevatorLobbyStructure();
      eleLobby.position.set(13.5, yOffset, -13.5);
      scene.add(eleLobby);

      // Slots
      const rawFloorSlots = slots.filter((s) => s.floor === floorNum);
      const zones = ["A", "B", "C"];
      const zoneZOffsets = { A: -12, B: -2, C: 8 };

      zones.forEach((zoneKey) => {
        let zoneSlots = rawFloorSlots.filter((s) => s.zone === zoneKey).sort((a, b) => a.code.localeCompare(b.code));

        if (zoneSlots.length < 10) {
          const existingCodes = new Set(zoneSlots.map((s) => s.code));
          const mockSlots = [];
          for (let i = 1; i <= 10; i++) {
            const numStr = String(i).padStart(2, "0");
            const code = `L${floorNum}-${zoneKey}${numStr}`;
            if (!existingCodes.has(code)) {
              const mockStatus = (floorNum + i) % 3 === 0 ? "occupied" : (floorNum + i) % 5 === 0 ? "reserved" : "available";
              mockSlots.push({
                id: `mock-${floorNum}-${zoneKey}-${i}`,
                code,
                floor: floorNum,
                zone: zoneKey,
                status: mockStatus,
                is_ev: i === 1 || i === 2,
                is_handicapped: i === 1,
                vehicle_type: "car",
              });
            }
          }
          zoneSlots = [...zoneSlots, ...mockSlots].slice(0, 10);
        } else {
          zoneSlots = zoneSlots.slice(0, 10);
        }

        const zPos = zoneZOffsets[zoneKey];

        zoneSlots.forEach((slot, idx) => {
          const xPos = -14.4 + idx * 3.2;

          const isAvailable = slot.status === "available";
          const isOccupied = slot.status === "occupied";
          const isReserved = slot.status === "reserved";
          const isHandicapped = slot.is_handicapped || slot.code === "A-101" || slot.code === "A-102";
          const isHighlighted = highlightCode && slot.code === highlightCode;

          // 3D Bay Ground Box
          const bayGeo = new THREE.PlaneGeometry(2.6, 4.4);
          let bayColor = 0xe2e8f0;
          if (isHandicapped) bayColor = 0xf59e0b;
          else if (isAvailable) bayColor = 0x3b82f6;
          else if (isReserved) bayColor = 0xf59e0b;
          else if (isOccupied) bayColor = 0x94a3b8;

          if (isHighlighted) bayColor = 0x10b981;

          const bayMat = new THREE.MeshStandardMaterial({
            color: isHandicapped ? 0xfef3c7 : isAvailable ? 0xdbeafe : 0xf1f5f9,
            roughness: 0.6,
            side: THREE.DoubleSide,
          });

          const bayMesh = new THREE.Mesh(bayGeo, bayMat);
          bayMesh.rotation.x = -Math.PI / 2;
          bayMesh.position.set(xPos, yOffset + 0.24, zPos);
          bayMesh.receiveShadow = true;
          bayMesh.userData = { slot };
          scene.add(bayMesh);
          raycastableMeshes.push(bayMesh);

          // Border Line
          const edges = new THREE.EdgesGeometry(bayGeo);
          const lineMat = new THREE.LineBasicMaterial({ color: bayColor, linewidth: 2 });
          const line = new THREE.LineSegments(edges, lineMat);
          line.rotation.x = -Math.PI / 2;
          line.position.set(xPos, yOffset + 0.25, zPos);
          scene.add(line);

          // 3D Car Model if Occupied or Reserved
          if (isOccupied || isReserved) {
            const colorIdx = Math.abs(slot.code.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % CAR_COLORS.length;
            const carColor = isHandicapped ? "#2563eb" : isReserved ? "#f59e0b" : CAR_COLORS[colorIdx];
            const car = createRealistic3DCarMesh(carColor, slot.is_ev, isHandicapped);
            car.position.set(xPos, yOffset + 0.24, zPos);
            scene.add(car);
          }

          // EV Charger Pillar
          if (slot.is_ev) {
            const evPillar = createEvPillar();
            evPillar.position.set(xPos - 1.0, yOffset + 0.24, zPos - 2.0);
            scene.add(evPillar);
          }

          // Handicapped Sign Pillar
          if (isHandicapped) {
            const handiSign = createHandicappedSign();
            handiSign.position.set(xPos + 1.0, yOffset + 0.24, zPos - 2.0);
            scene.add(handiSign);
          }
        });
      });
    });

    // Pointer Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastableMeshes);

      if (intersects.length > 0) {
        const clickedSlot = intersects[0].object.userData.slot;
        if (clickedSlot && clickedSlot.status === "available" && !clickedSlot.is_handicapped) {
          if (onSelect) onSelect(clickedSlot);
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("pointerdown", handlePointerDown);

    // Animation Loop with Camera Lerp
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (viewMode === "streetview") {
        const wp = POV_WAYPOINTS[currentWaypointIdx];
        targetCamPos.current.copy(wp.pos);
        targetCamLookAt.current.copy(wp.target);

        // Smooth camera lerp movement
        camera.position.lerp(targetCamPos.current, 0.05);
        currentCamLookAt.current.lerp(targetCamLookAt.current, 0.05);
        camera.lookAt(currentCamLookAt.current);
      } else {
        if (autoRotate) {
          scene.rotation.y += 0.003;
        } else {
          scene.rotation.y = 0;
        }
        camera.position.lerp(targetCamPos.current, 0.06);
        currentCamLookAt.current.lerp(targetCamLookAt.current, 0.06);
        camera.lookAt(currentCamLookAt.current);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      domElement.removeEventListener("pointerdown", handlePointerDown);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [slots, highlightCode, selectedFloor, autoRotate, viewMode, currentWaypointIdx, CAR_COLORS, onSelect]);

  // Automated Street View Tour Interval
  useEffect(() => {
    let timer;
    if (viewMode === "streetview" && isTourPlaying) {
      timer = setInterval(() => {
        setCurrentWaypointIdx((prev) => (prev + 1) % POV_WAYPOINTS.length);
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [viewMode, isTourPlaying]);

  const activeWaypoint = POV_WAYPOINTS[currentWaypointIdx];

  return (
    <div className="relative rounded-3xl border border-border/80 dark:border-purple-900/40 bg-card dark:bg-[#0d081c] shadow-2xl overflow-hidden font-mono">
      {/* 3D Model Top Control Toolbar */}
      <div className="p-4 sm:p-5 border-b border-border/80 dark:border-purple-900/40 bg-card/80 dark:bg-[#0c071a]/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <p className="text-xs font-mono font-semibold tracking-widest uppercase text-purple-600 dark:text-purple-300">
              {viewMode === "streetview" ? "Google Earth Ground POV Walkthrough" : "3D Parking Garage Building Model"}
            </p>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground dark:text-white mt-0.5">
            {viewMode === "streetview" ? activeWaypoint.name : "3 Floors · 3 Rows of 10 Bays Per Floor"}
          </h3>
        </div>

        {/* View Mode & Level Switcher Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher: Orbit vs Street View POV */}
          <div className="flex items-center p-1 rounded-full bg-slate-200 dark:bg-[#0a0518] border border-border dark:border-purple-900/40">
            <Button
              variant={viewMode === "orbit" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setViewMode("orbit");
                setIsTourPlaying(false);
              }}
              className={`rounded-full text-xs font-semibold h-8 px-3 transition-all ${
                viewMode === "orbit"
                  ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                  : "text-muted-foreground hover:text-foreground dark:text-purple-300"
              }`}
            >
              <Compass className="w-3.5 h-3.5 mr-1.5" />
              Orbit View
            </Button>
            <Button
              variant={viewMode === "streetview" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setViewMode("streetview");
                setIsTourPlaying(true);
              }}
              className={`rounded-full text-xs font-semibold h-8 px-3 transition-all ${
                viewMode === "streetview"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  : "text-muted-foreground hover:text-foreground dark:text-purple-300"
              }`}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5 text-emerald-300 animate-pulse" />
              Street View POV
            </Button>
          </div>

          {/* Level Buttons (Orbit Mode) */}
          {viewMode === "orbit" && (
            <div className="flex items-center gap-1">
              <Button
                variant={String(selectedFloor).toLowerCase() === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFloor("all")}
                className={`rounded-full text-xs font-medium h-8 ${
                  String(selectedFloor).toLowerCase() === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-card border-border dark:bg-[#0f0a21] dark:border-purple-900/40 dark:text-purple-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5 mr-1" />
                All
              </Button>
              <Button
                variant={String(selectedFloor) === "1" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFloor(1)}
                className={`rounded-full text-xs font-medium h-8 ${
                  String(selectedFloor) === "1"
                    ? "bg-purple-600 text-white"
                    : "bg-card border-border dark:bg-[#0f0a21] dark:border-purple-900/40 dark:text-purple-200"
                }`}
              >
                L1
              </Button>
              <Button
                variant={String(selectedFloor) === "2" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFloor(2)}
                className={`rounded-full text-xs font-medium h-8 ${
                  String(selectedFloor) === "2"
                    ? "bg-purple-600 text-white"
                    : "bg-card border-border dark:bg-[#0f0a21] dark:border-purple-900/40 dark:text-purple-200"
                }`}
              >
                L2
              </Button>
              <Button
                variant={String(selectedFloor) === "3" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFloor(3)}
                className={`rounded-full text-xs font-medium h-8 ${
                  String(selectedFloor) === "3"
                    ? "bg-purple-600 text-white"
                    : "bg-card border-border dark:bg-[#0f0a21] dark:border-purple-900/40 dark:text-purple-200"
                }`}
              >
                L3
              </Button>
            </div>
          )}

          {/* Auto Rotate Button */}
          {viewMode === "orbit" && (
            <Button
              variant={autoRotate ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRotate((r) => !r)}
              className={`rounded-full text-xs font-medium h-8 ${
                autoRotate
                  ? "bg-purple-600 text-white"
                  : "bg-card border-border dark:bg-[#0f0a21] dark:border-purple-900/40 dark:text-purple-200"
              }`}
            >
              <Compass className={`w-3.5 h-3.5 mr-1 ${autoRotate ? "animate-spin" : ""}`} />
              Rotate 360°
            </Button>
          )}
        </div>
      </div>

      {/* 3D Canvas Canvas Container */}
      <div className="relative w-full h-[540px] bg-slate-100 dark:bg-[#06040a]">
        <div ref={mountRef} className="w-full h-full" />

        {/* Street View POV Floating HUD Overlay */}
        {viewMode === "streetview" && (
          <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card/95 dark:bg-[#0a0518]/95 backdrop-blur-xl border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <Navigation className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                  POV Position ({currentWaypointIdx + 1} of {POV_WAYPOINTS.length})
                </p>
                <h4 className="text-base font-bold text-foreground dark:text-white">
                  {activeWaypoint.name}
                </h4>
                <p className="text-xs text-muted-foreground dark:text-purple-200/70">
                  {activeWaypoint.desc}
                </p>
              </div>
            </div>

            {/* Street View Walkthrough Navigation & Waypoint Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWaypointIdx((prev) => (prev === 0 ? POV_WAYPOINTS.length - 1 : prev - 1))}
                className="h-9 px-3 text-xs font-semibold rounded-xl bg-card border-border dark:bg-[#0d071e] dark:border-purple-900/50"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Previous Landmark
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => setIsTourPlaying((p) => !p)}
                className={`h-9 px-4 text-xs font-bold rounded-xl transition-all ${
                  isTourPlaying
                    ? "bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                }`}
              >
                {isTourPlaying ? <Pause className="w-4 h-4 mr-1.5" /> : <Play className="w-4 h-4 mr-1.5" />}
                {isTourPlaying ? "Pause Ground Tour" : "Play Auto Tour"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWaypointIdx((prev) => (prev + 1) % POV_WAYPOINTS.length)}
                className="h-9 px-3 text-xs font-semibold rounded-xl bg-card border-border dark:bg-[#0d071e] dark:border-purple-900/50"
              >
                Next Landmark
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Waypoint Selectors Bar in Street View POV Mode */}
        {viewMode === "streetview" && (
          <div className="absolute bottom-4 left-4 right-4 z-20 p-3 rounded-2xl bg-card/95 dark:bg-[#0a0518]/95 backdrop-blur-xl border border-border/80 dark:border-purple-900/40 shadow-2xl flex items-center justify-between gap-2 overflow-x-auto">
            {POV_WAYPOINTS.map((wp, idx) => (
              <button
                key={wp.name}
                onClick={() => {
                  setCurrentWaypointIdx(idx);
                  setIsTourPlaying(false);
                }}
                className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-left transition-all border ${
                  currentWaypointIdx === idx
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] font-bold"
                    : "bg-card/40 border-border/60 dark:bg-purple-950/20 dark:border-purple-900/30 text-muted-foreground dark:text-purple-200/60 hover:text-white"
                }`}
              >
                <p className="text-[10px] uppercase font-mono tracking-wider opacity-80">POV {idx + 1}</p>
                <p className="text-xs truncate">{wp.name.split("&")[0]}</p>
              </button>
            ))}
          </div>
        )}

        {/* Orbit Mode Legend Bar */}
        {viewMode === "orbit" && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-10 p-3.5 rounded-2xl bg-card/95 dark:bg-[#0c071a]/95 backdrop-blur-xl border border-border/80 dark:border-purple-900/40 shadow-2xl flex flex-wrap items-center gap-4 text-xs text-foreground dark:text-purple-200 font-medium">
            <div className="flex items-center gap-2">
              <Accessibility className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-amber-400">♿ Handicapped (A-101, A-102)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white">P</div>
              <span>Tap Free Spot to Reserve</span>
            </div>

            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
              <span className="text-sky-600 dark:text-sky-400 font-semibold">EV Charger</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}