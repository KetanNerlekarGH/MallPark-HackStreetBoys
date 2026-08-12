import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Zap,
  Layers,
  Compass,
  Building2,
  Accessibility,
  Eye,
  Plus,
  Minus,
  Maximize2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Creates High-Resolution Crisp Canvas Text Texture for 3D Text & Badges
 */
function createTextTexture(text, color = "#ffffff", bg = "transparent", fontSize = 72, width = 1024, height = 512, isBadge = false) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (bg !== "transparent") {
    ctx.fillStyle = bg;
    if (isBadge) {
      ctx.beginPath();
      ctx.roundRect(12, 12, width - 24, height - 24, 36);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, width, height);
    }
  }

  // Crisp Text Rendering with Outline
  ctx.font = `900 ${fontSize}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.lineWidth = 12;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.85)";
  ctx.strokeText(text, width / 2, height / 2);

  ctx.fillStyle = color;
  ctx.fillText(text, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/**
 * Creates realistic 3D Car Model Mesh
 */
function createRealistic3DCarMesh(color = "#ef4444", isEv = false, isHandicapped = false) {
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

  // Chassis Body (Length along Z = 3.6, Width along X = 1.65)
  const chassisGeo = new THREE.BoxGeometry(1.65, 0.45, 3.6);
  chassisGeo.translate(0, 0.32, 0);
  const chassis = new THREE.Mesh(chassisGeo, bodyMat);
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  carGroup.add(chassis);

  // Cabin Roof
  const cabinGeo = new THREE.BoxGeometry(1.4, 0.48, 1.85);
  cabinGeo.translate(0, 0.78, -0.15);
  const cabin = new THREE.Mesh(cabinGeo, bodyMat);
  cabin.castShadow = true;
  carGroup.add(cabin);

  // Windshield (Front Glass at +Z)
  const windshieldGeo = new THREE.BoxGeometry(1.32, 0.45, 0.75);
  windshieldGeo.rotateX(Math.PI / 5.5);
  windshieldGeo.translate(0, 0.75, 0.75);
  const windshield = new THREE.Mesh(windshieldGeo, glassMat);
  carGroup.add(windshield);

  // Rear Window Glass at -Z
  const rearWindowGeo = new THREE.BoxGeometry(1.32, 0.42, 0.75);
  rearWindowGeo.rotateX(-Math.PI / 5.5);
  rearWindowGeo.translate(0, 0.75, -1.05);
  const rearWindow = new THREE.Mesh(rearWindowGeo, glassMat);
  carGroup.add(rearWindow);

  // Headlights (Front is +Z)
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

  // Taillights (Rear is -Z)
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
 * Creates 3D Ticket Kiosk & Barrier Gate
 */
function createTicketKioskStructure() {
  const kioskGroup = new THREE.Group();

  const boxGeo = new THREE.BoxGeometry(1.6, 2.4, 2.2);
  boxGeo.translate(0, 1.2, 0);
  const boxMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.castShadow = true;
  kioskGroup.add(box);

  const winGeo = new THREE.BoxGeometry(1.62, 0.9, 1.2);
  winGeo.translate(0, 1.5, 0);
  const winMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });
  kioskGroup.add(new THREE.Mesh(winGeo, winMat));

  const postGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.2, 16);
  postGeo.translate(0, 0.6, 1.6);
  const postMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8 });
  kioskGroup.add(new THREE.Mesh(postGeo, postMat));

  const armGeo = new THREE.BoxGeometry(3.6, 0.08, 0.12);
  armGeo.translate(-1.8, 1.05, 1.6);
  const armMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.5 });
  kioskGroup.add(new THREE.Mesh(armGeo, armMat));

  return kioskGroup;
}

/**
 * Creates Curved Ramp Structure shifted to extreme top-left corner
 */
function createCurvedRampStructure(baseY = 0, targetY = 9.0) {
  const rampGroup = new THREE.Group();

  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-18.5, baseY, -10),
    new THREE.Vector3(-18.5, baseY + (targetY - baseY) * 0.6, -18.5),
    new THREE.Vector3(-10, targetY, -18.5)
  );

  const points = curve.getPoints(30);

  const shape = new THREE.Shape();
  shape.moveTo(-2.5, 0);
  shape.lineTo(2.5, 0);
  shape.lineTo(2.5, 0.35);
  shape.lineTo(-2.5, 0.35);
  shape.closePath();

  const extrudeSettings = { steps: 40, bevelEnabled: false, extrudePath: curve };
  const extrudeGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const rampMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.3, roughness: 0.6 });
  const rampMesh = new THREE.Mesh(extrudeGeo, rampMat);
  rampMesh.receiveShadow = true;
  rampGroup.add(rampMesh);

  const railMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7c3aed, emissiveIntensity: 0.7 });
  const railGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.0, 12);

  points.forEach((pt, i) => {
    if (i % 4 === 0) {
      const postL = new THREE.Mesh(railGeo, railMat);
      postL.position.set(pt.x - 2.4, pt.y + 0.5, pt.z);
      const postR = new THREE.Mesh(railGeo, railMat);
      postR.position.set(pt.x + 2.4, pt.y + 0.5, pt.z);
      rampGroup.add(postL, postR);
    }
  });

  return rampGroup;
}

/**
 * Creates Elevator Lobby Structure (Top Right)
 */
function createElevatorLobbyStructure() {
  const lobbyGroup = new THREE.Group();

  const towerGeo = new THREE.BoxGeometry(6.5, 6.0, 7.5);
  towerGeo.translate(0, 3.0, 0);
  const towerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
  const tower = new THREE.Mesh(towerGeo, towerMat);
  tower.castShadow = true;
  lobbyGroup.add(tower);

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

  const cabGeo = new THREE.BoxGeometry(2.0, 2.2, 2.2);
  cabGeo.translate(-1.6, 2.0, 0.2);
  const cabMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7c3aed, emissiveIntensity: 0.9 });
  lobbyGroup.add(new THREE.Mesh(cabGeo, cabMat));

  const doorGeo = new THREE.BoxGeometry(1.4, 2.4, 0.1);
  doorGeo.translate(1.8, 1.2, 3.76);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.6 });
  lobbyGroup.add(new THREE.Mesh(doorGeo, doorMat));

  const signGeo = new THREE.BoxGeometry(5.8, 0.7, 0.2);
  signGeo.translate(0, 5.2, 3.8);
  const signMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x9333ea, emissiveIntensity: 1.0 });
  lobbyGroup.add(new THREE.Mesh(signGeo, signMat));

  return lobbyGroup;
}

/**
 * Creates 3D EV Charging Station Pillar
 */
function createEvPillar() {
  const group = new THREE.Group();
  const pillarGeo = new THREE.BoxGeometry(0.4, 1.4, 0.4);
  pillarGeo.translate(0, 0.7, 0);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.2 });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.castShadow = true;
  group.add(pillar);

  const screenGeo = new THREE.BoxGeometry(0.25, 0.4, 0.05);
  screenGeo.translate(0, 0.95, 0.21);
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.0 });
  group.add(new THREE.Mesh(screenGeo, screenMat));

  return group;
}

/**
 * Creates 3D Handicapped Sign Pillar
 */
function createHandicappedSign() {
  const group = new THREE.Group();
  const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.4, 12);
  postGeo.translate(0, 0.7, 0);
  const postMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
  group.add(new THREE.Mesh(postGeo, postMat));

  const signGeo = new THREE.BoxGeometry(0.5, 0.5, 0.05);
  signGeo.translate(0, 1.35, 0);
  const signMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x1d4ed8, emissiveIntensity: 0.7 });
  group.add(new THREE.Mesh(signGeo, signMat));

  return group;
}

// ----------------------------------------------------
// DEFAULT PARKING SLOT CONFIGURATION (SYMMETRICAL 5-ROW LAYOUT)
// - Zone A (Left Column): 5 Bays (A-101 EV, A-102 EV top-left)
// - Zone B (Middle Double Island): 10 Bays (5 Left, 5 Right - Symmetrical!)
// - Zone C (Right Column): 5 Bays (C-121 ♿, C-122 ♿ entrance)
// ----------------------------------------------------
const GRID_SLOTS = [
  // ZONE A (Left Column)
  { code: "A-101", zone: "A", row: 0, status: "available", is_ev: true, x: -13.5, z: -10.0, turnInAngle: -Math.PI / 2 },
  { code: "A-102", zone: "A", row: 1, status: "available", is_ev: true, x: -13.5, z: -5.0, turnInAngle: -Math.PI / 2 },
  { code: "A-103", zone: "A", row: 2, status: "occupied", color: "#b91c1c", x: -13.5, z: 0.0, turnInAngle: -Math.PI / 2 },
  { code: "A-104", zone: "A", row: 3, status: "available", x: -13.5, z: 5.0, turnInAngle: -Math.PI / 2 },
  { code: "A-105", zone: "A", row: 4, status: "occupied", color: "#1e3a8a", x: -13.5, z: 10.0, turnInAngle: -Math.PI / 2 },

  // ZONE B (Middle Double Island - Symmetrical 5 Left & 5 Right Bays)
  { code: "B-111", zone: "B", row: 0, status: "available", side: "left", x: -2.5, z: -10.0, turnInAngle: Math.PI / 2 },
  { code: "B-112", zone: "B", row: 1, status: "available", side: "left", x: -2.5, z: -5.0, turnInAngle: Math.PI / 2 },
  { code: "B-113", zone: "B", row: 2, status: "available", side: "left", x: -2.5, z: 0.0, turnInAngle: Math.PI / 2 },
  { code: "B-114", zone: "B", row: 3, status: "occupied", color: "#b91c1c", side: "left", x: -2.5, z: 5.0, turnInAngle: Math.PI / 2 },
  { code: "B-115", zone: "B", row: 4, status: "available", side: "left", x: -2.5, z: 10.0, turnInAngle: Math.PI / 2 },
  { code: "B-116", zone: "B", row: 0, status: "available", side: "right", x: 2.5, z: -10.0, turnInAngle: -Math.PI / 2 },
  { code: "B-117", zone: "B", row: 1, status: "available", side: "right", x: 2.5, z: -5.0, turnInAngle: -Math.PI / 2 },
  { code: "B-118", zone: "B", row: 2, status: "available", side: "right", x: 2.5, z: 0.0, turnInAngle: -Math.PI / 2 },
  { code: "B-119", zone: "B", row: 3, status: "available", side: "right", x: 2.5, z: 5.0, turnInAngle: -Math.PI / 2 },
  { code: "B-120", zone: "B", row: 4, status: "available", side: "right", x: 2.5, z: 10.0, turnInAngle: -Math.PI / 2 },

  // ZONE C (Right Column)
  { code: "C-121", zone: "C", row: 0, status: "available", is_handicapped: true, x: 13.5, z: -10.0, turnInAngle: Math.PI / 2 },
  { code: "C-122", zone: "C", row: 1, status: "available", is_handicapped: true, x: 13.5, z: -5.0, turnInAngle: Math.PI / 2 },
  { code: "C-123", zone: "C", row: 2, status: "available", x: 13.5, z: 0.0, turnInAngle: Math.PI / 2 },
  { code: "C-124", zone: "C", row: 3, status: "occupied", color: "#94a3b8", x: 13.5, z: 5.0, turnInAngle: Math.PI / 2 },
  { code: "C-126", zone: "C", row: 4, status: "available", x: 13.5, z: 10.0, turnInAngle: Math.PI / 2 },
];

export default function Floor3DView({
  slots = [],
  highlightCode,
  isARGuide = true,
  onSelect,
  selectedFloor: propSelectedFloor,
  setSelectedFloor: propSetSelectedFloor,
  selectedMall,
}) {
  const mountRef = useRef(null);
  const [internalSelectedFloor, setInternalSelectedFloor] = useState("1");
  const [autoRotate, setAutoRotate] = useState(false);
  const [cameraMode, setCameraMode] = useState("3D");
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [cameraYaw, setCameraYaw] = useState(0);

  const selectedFloor = propSelectedFloor !== undefined ? propSelectedFloor : internalSelectedFloor;
  const setSelectedFloor = propSetSelectedFloor || setInternalSelectedFloor;

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);

  const CAR_COLORS = useMemo(
    () => ["#ef4444", "#3b82f6", "#10b981", "#a855f7", "#f59e0b", "#06b6d4", "#ec4899", "#64748b"],
    []
  );

  // Merge slot states
  const mergedSlots = useMemo(() => {
    const floorNum = Number(selectedFloor) || 1;
    const dbSlotsMap = new Map();
    (slots || []).forEach((s) => {
      if (s.floor === floorNum || selectedFloor === "all") {
        dbSlotsMap.set(s.code, s);
      }
    });

    return GRID_SLOTS.map((gridSlot) => {
      const floorAdjustedCode = gridSlot.code.replace(/([A-Z])-1(\d\d)/, `$1-${floorNum}$2`);
      const dbMatch = dbSlotsMap.get(gridSlot.code) || dbSlotsMap.get(floorAdjustedCode);
      let merged = { ...gridSlot, floor: floorNum };
      if (dbMatch) {
        merged = { ...merged, ...dbMatch, code: gridSlot.code };
      }

      // Strip EV flag from all slots by default
      merged.is_ev = false;

      // Enforce ONLY 2 EV Charging stations in Zone A (left column: A-101, A-102)
      if (gridSlot.code === "A-101" || gridSlot.code === "A-102") {
        merged.is_ev = true;
        merged.is_handicapped = false;
      }

      // Enforce Zone C Entrance spots (C-121, C-122) as Handicapped spots only
      if (gridSlot.code === "C-121" || gridSlot.code === "C-122") {
        merged.is_handicapped = true;
        merged.is_ev = false;
      }

      return merged;
    });
  }, [slots, selectedFloor]);

  // Setup 3D Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = 560;

    const scene = new THREE.Scene();
    const bgColor = new THREE.Color("#080512");
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2("#080512", 0.007);
    sceneRef.current = scene;

    const isAllMode = String(selectedFloor).toLowerCase() === "all";

    // Perspective Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.2, 500);
    cameraRef.current = camera;

    const activeFloorNum = Number(selectedFloor) || 1;
    const targetY = isAllMode ? 9.0 : (activeFloorNum - 1) * 9.0;

    if (cameraMode === "2D") {
      camera.position.set(0, targetY + 52, 0.1);
    } else if (isAllMode) {
      camera.position.set(0, 48, 56);
    } else {
      camera.position.set(0, targetY + 32, 38);
    }
    camera.lookAt(0, targetY, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Enable Maximum Anisotropy for Ultra-Crisp Textures
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy() || 16;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = cameraMode === "2D" ? 0.01 : Math.PI / 2.05;
    controls.minPolarAngle = 0.01;
    controls.minDistance = 10;
    controls.maxDistance = 120;
    controls.target.set(0, targetY, 0);
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(25, 60, 25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const purpleNeonLight = new THREE.PointLight(0xa855f7, 4.0, 50);
    purpleNeonLight.position.set(-14, targetY + 6, -14);
    scene.add(purpleNeonLight);

    const blueNeonLight = new THREE.PointLight(0x38bdf8, 4.0, 50);
    blueNeonLight.position.set(14, targetY + 6, -14);
    scene.add(blueNeonLight);

    const raycastableMeshes = [];
    const floorsToRender = isAllMode ? [1, 2, 3] : [activeFloorNum];
    const FLOOR_HEIGHT = 9.0;

    // Structural Support Pillars
    if (isAllMode) {
      const pillarGeo = new THREE.CylinderGeometry(0.4, 0.4, 20, 16);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.5, transparent: true, opacity: 0.6 });
      [[-18, 9, -18], [18, 9, -18], [-18, 9, 14], [18, 9, 14]].forEach(([px, py, pz]) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(px, py, pz);
        scene.add(pillar);
      });
    }

    floorsToRender.forEach((fNum) => {
      const yOff = (fNum - 1) * FLOOR_HEIGHT;

      // Base Floor Slab
      const groundGeo = new THREE.PlaneGeometry(42, 44);
      const groundMat = new THREE.MeshStandardMaterial({
        color: isAllMode ? 0x140e2b : 0x0f0b1e,
        roughness: 0.8,
        metalness: 0.2,
        transparent: isAllMode,
        opacity: isAllMode ? 0.65 : 1.0,
      });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(0, yOff, 0);
      ground.receiveShadow = true;
      scene.add(ground);

      // Wall Border Frame
      const wallBorderGeo = new THREE.BoxGeometry(40.5, 0.4, 42.5);
      const wallBorderMat = new THREE.MeshStandardMaterial({ color: 0x1e1836, metalness: 0.5, roughness: 0.4 });
      const wallBorder = new THREE.Mesh(wallBorderGeo, wallBorderMat);
      wallBorder.position.set(0, yOff - 0.2, 0);
      scene.add(wallBorder);

      // ----------------------------------------------------
      // HIGH-RESOLUTION RAZOR-SHARP ROAD MARKINGS & BADGES
      // ----------------------------------------------------
      const lane1Tex = createTextTexture("LANE 1: NORTHBOUND ⬆", "#ffffff", "transparent", 76, 1024, 256);
      lane1Tex.anisotropy = maxAnisotropy;
      const lane1Mat = new THREE.MeshBasicMaterial({ map: lane1Tex, transparent: true, opacity: 0.95 });
      const lane1Mesh = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 2.0), lane1Mat);
      lane1Mesh.rotation.x = -Math.PI / 2;
      lane1Mesh.rotation.z = Math.PI / 2;
      lane1Mesh.position.set(-7.5, yOff + 0.02, 3.0);
      scene.add(lane1Mesh);

      const lane2Tex = createTextTexture("LANE 2: SOUTHBOUND ⬇", "#ffffff", "transparent", 76, 1024, 256);
      lane2Tex.anisotropy = maxAnisotropy;
      const lane2Mat = new THREE.MeshBasicMaterial({ map: lane2Tex, transparent: true, opacity: 0.95 });
      const lane2Mesh = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 2.0), lane2Mat);
      lane2Mesh.rotation.x = -Math.PI / 2;
      lane2Mesh.rotation.z = -Math.PI / 2;
      lane2Mesh.position.set(7.5, yOff + 0.02, 3.0);
      scene.add(lane2Mesh);

      // Zebra Crosswalks
      const crosswalkGeo = new THREE.PlaneGeometry(4.0, 0.35);
      const crosswalkMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
      [-7.5, 7.5].forEach((cx) => {
        [-12.0, 14.5].forEach((cz) => {
          for (let stripe = -1.5; stripe <= 1.5; stripe += 0.6) {
            const stripeMesh = new THREE.Mesh(crosswalkGeo, crosswalkMat);
            stripeMesh.rotation.x = -Math.PI / 2;
            stripeMesh.position.set(cx + stripe, yOff + 0.02, cz);
            scene.add(stripeMesh);
          }
        });
      });

      // Pedestrian Safety Path
      const pedPathTex = createTextTexture("🚶 TO MALL ENTRANCE ➡", "#fbbf24", "transparent", 72, 1024, 256);
      pedPathTex.anisotropy = maxAnisotropy;
      const pedPathMat = new THREE.MeshBasicMaterial({ map: pedPathTex, transparent: true });
      const pedPathMesh = new THREE.Mesh(new THREE.PlaneGeometry(9.0, 2.25), pedPathMat);
      pedPathMesh.rotation.x = -Math.PI / 2;
      pedPathMesh.position.set(7.5, yOff + 0.03, -8.0);
      scene.add(pedPathMesh);

      // Zone Badges on Ground
      const zoneATex = createTextTexture(`ZONE A (L${fNum})`, "#ec4899", "transparent", 80, 512, 256);
      zoneATex.anisotropy = maxAnisotropy;
      const zoneAMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 2.25), new THREE.MeshBasicMaterial({ map: zoneATex, transparent: true }));
      zoneAMesh.rotation.x = -Math.PI / 2;
      zoneAMesh.position.set(-13.5, yOff + 0.02, 17.5);
      scene.add(zoneAMesh);

      const zoneBTex = createTextTexture(`ZONE B (L${fNum})`, "#a855f7", "transparent", 80, 512, 256);
      zoneBTex.anisotropy = maxAnisotropy;
      const zoneBMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 2.25), new THREE.MeshBasicMaterial({ map: zoneBTex, transparent: true }));
      zoneBMesh.rotation.x = -Math.PI / 2;
      zoneBMesh.position.set(0.0, yOff + 0.02, 17.5);
      scene.add(zoneBMesh);

      const zoneCTex = createTextTexture(`ZONE C (L${fNum})`, "#38bdf8", "transparent", 80, 512, 256);
      zoneCTex.anisotropy = maxAnisotropy;
      const zoneCMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 2.25), new THREE.MeshBasicMaterial({ map: zoneCTex, transparent: true }));
      zoneCMesh.rotation.x = -Math.PI / 2;
      zoneCMesh.position.set(13.5, yOff + 0.02, 17.5);
      scene.add(zoneCMesh);

      // Architectural Structures
      const kiosks = createTicketKioskStructure();
      kiosks.position.set(-7.5, yOff, 18.5);
      scene.add(kiosks);

      // Curved Ramp Shifted to Extreme Top-Left Corner
      if (fNum < 3 || isAllMode) {
        const ramp = createCurvedRampStructure(yOff, yOff + FLOOR_HEIGHT);
        scene.add(ramp);
      }

      const eleLobby = createElevatorLobbyStructure();
      eleLobby.position.set(13.5, yOff, -15.5);
      scene.add(eleLobby);

      // ----------------------------------------------------
      // RENDER HORIZONTAL PARKING SLOTS & CARS
      // ----------------------------------------------------
      mergedSlots.forEach((slot) => {
        const { x, z, status, is_ev, is_handicapped, code, turnInAngle } = slot;
        const displayCode = code.replace(/([A-Z])-1(\d\d)/, `$1-${fNum}$2`);

        const isAvailable = status === "available";
        const isOccupied = status === "occupied";
        const isReserved = status === "reserved";
        const cleanHighlight = (highlightCode || "").trim().toUpperCase();
        const cleanCode = (code || "").trim().toUpperCase();
        const cleanDisplay = (displayCode || "").trim().toUpperCase();

        const isHighlighted = !!cleanHighlight && (cleanHighlight === cleanCode || cleanHighlight === cleanDisplay || cleanHighlight.includes(cleanCode));

        // Color Priority: Occupied (Red) -> Reserved (Yellow) -> Handicapped (Blue) -> EV (Cyan) -> Available (Green)
        let neonColor = 0x10b981; // Green
        let statusBg = "#10b981";
        let groundColor = 0x0c1e20; // Available dark green ground

        if (isOccupied) {
          neonColor = 0xef4444; // RED
          statusBg = "#ef4444";
          groundColor = 0x3f121d; // Dark Red ground
        } else if (isReserved) {
          neonColor = 0xf59e0b; // YELLOW / GOLD
          statusBg = "#f59e0b";
          groundColor = 0x382408; // Dark Amber ground
        } else if (is_handicapped) {
          neonColor = 0x3b82f6; // Blue
          statusBg = "#2563eb";
          groundColor = 0x0e1b38;
        } else if (is_ev) {
          neonColor = 0x0284c7; // Cyan
          statusBg = "#0284c7";
          groundColor = 0x0a2233;
        }

        if (isHighlighted) {
          neonColor = 0x38bdf8; // Neon Sky Blue Wayfinding
          statusBg = "#0284c7";
          groundColor = 0x0c2a4a;

          // Glowing vertical 3D wayfinding beacon beam
          const beaconGeo = new THREE.CylinderGeometry(0.2, 1.8, 12.0, 16);
          const beaconMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.65,
            side: THREE.DoubleSide,
          });
          const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
          beaconMesh.position.set(x, yOff + 6.0, z);
          scene.add(beaconMesh);

          // Elevated 3D Wayfinding Straight Neon Line Segments
          // Pedestrian AR Guide starts directly from Mall Main Elevator Lobby Building in Top Right (x=13.5, z=-14.0)
          const waypoints = isARGuide
            ? [
                new THREE.Vector3(13.5, yOff + 0.35, -14.0), // Mall Main Elevator Lobby Building (Top Right)
                new THREE.Vector3(x, yOff + 0.35, -14.0),    // Walk along North Cross Corridor to target column x
                new THREE.Vector3(x, yOff + 0.35, z),        // Turn down target aisle to spot (x, z)
              ]
            : [
                new THREE.Vector3(-7.5, yOff + 0.35, 24.0),  // Vehicle Entrance Gate (Bottom Left)
                new THREE.Vector3(-7.5, yOff + 0.35, -14.0), // North Cross Corridor
                new THREE.Vector3(x, yOff + 0.35, -14.0),    // Approach Corridor
                new THREE.Vector3(x, yOff + 0.35, z),        // Target Spot
              ];

          const tubeMat = new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.95,
          });

          for (let i = 0; i < waypoints.length - 1; i++) {
            const p1 = waypoints[i];
            const p2 = waypoints[i + 1];
            if (p1.distanceTo(p2) > 0.1) {
              const lineCurve = new THREE.LineCurve3(p1, p2);
              const segGeo = new THREE.TubeGeometry(lineCurve, 8, 0.35, 12, false);
              const segMesh = new THREE.Mesh(segGeo, tubeMat);
              scene.add(segMesh);
            }
          }
        }

        // HORIZONTAL BAY PLANE
        const bayGeo = new THREE.PlaneGeometry(4.4, 2.6);
        const bayMat = new THREE.MeshStandardMaterial({
          color: groundColor,
          roughness: 0.6,
          metalness: 0.3,
          side: THREE.DoubleSide,
        });
        const bayMesh = new THREE.Mesh(bayGeo, bayMat);
        bayMesh.rotation.x = -Math.PI / 2;
        bayMesh.position.set(x, yOff + 0.02, z);
        bayMesh.userData = { slot: { ...slot, code: displayCode, floor: fNum } };
        scene.add(bayMesh);
        raycastableMeshes.push(bayMesh);

        // NEON BORDER FRAME
        const borderBoxGeo = new THREE.BoxGeometry(4.6, 0.06, 2.8);
        const borderBoxMat = new THREE.MeshStandardMaterial({
          color: neonColor,
          emissive: neonColor,
          emissiveIntensity: 0.8,
          roughness: 0.2,
        });
        const borderMesh = new THREE.Mesh(borderBoxGeo, borderBoxMat);
        borderMesh.position.set(x, yOff + 0.03, z);
        scene.add(borderMesh);

        // RAZOR-SHARP SLOT CODE TEXT BADGE
        const labelText = is_ev ? `${displayCode} EV ⚡` : is_handicapped ? `♿ ${displayCode}` : displayCode;
        const slotTex = createTextTexture(labelText, "#ffffff", statusBg, 72, 512, 256, true);
        slotTex.anisotropy = maxAnisotropy;
        const slotLabelMat = new THREE.MeshBasicMaterial({ map: slotTex, transparent: true });
        const slotLabelMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), slotLabelMat);
        slotLabelMesh.rotation.x = -Math.PI / 2;
        slotLabelMesh.position.set(x, yOff + 0.05, z);
        scene.add(slotLabelMesh);

        // PARKED CAR MODEL IN HORIZONTAL BAY
        if (isOccupied) {
          const carColor = slot.color || CAR_COLORS[Math.abs(displayCode.charCodeAt(0)) % CAR_COLORS.length];
          const carMesh = createRealistic3DCarMesh(carColor, is_ev, is_handicapped);
          carMesh.position.set(x, yOff + 0.02, z);
          carMesh.rotation.y = turnInAngle;
          scene.add(carMesh);
        }

        // EV Charger Pillar (Top Left Zone A: A-101, A-102)
        if (is_ev) {
          const evPillar = createEvPillar();
          evPillar.position.set(x - 2.0, yOff, z);
          scene.add(evPillar);
        }

        // Handicapped Sign (Near Mall Entrance Zone C: C-121, C-122)
        if (is_handicapped) {
          const handiSign = createHandicappedSign();
          handiSign.position.set(x + 2.0, yOff, z);
          scene.add(handiSign);
        }
      });
    });

    // ----------------------------------------------------
    // LIVE RANDOM SELF-PARKING VEHICLE SIMULATION
    // ----------------------------------------------------
    const simCars = [];
    const NUM_SIM_CARS = 3;

    const pickRandomAvailableSpot = (excludedCodes = new Set()) => {
      const available = mergedSlots.filter(
        (s) => s.status === "available" && !s.is_handicapped && !excludedCodes.has(s.code)
      );
      if (available.length === 0) {
        const fallback = mergedSlots.filter((s) => s.status === "available");
        return fallback[Math.floor(Math.random() * fallback.length)] || GRID_SLOTS[0];
      }
      return available[Math.floor(Math.random() * available.length)];
    };

    const assignedCodes = new Set();

    for (let i = 0; i < NUM_SIM_CARS; i++) {
      const color = CAR_COLORS[i % CAR_COLORS.length];
      const mesh = createRealistic3DCarMesh(color);
      mesh.visible = false;
      scene.add(mesh);

      const targetSpot = pickRandomAvailableSpot(assignedCodes);
      assignedCodes.add(targetSpot.code);

      simCars.push({
        mesh,
        active: false,
        x: -7.5,
        y: targetY,
        z: 24.0,
        targetSpot,
        angle: Math.PI,
        speed: 0.12,
        state: "IDLE",
        parkTimer: 0,
        maxParkDuration: 180 + Math.floor(Math.random() * 320),
        startTimer: i * 160 + Math.floor(Math.random() * 80),
      });
    }

    // Raycaster for Hover & Click Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastableMeshes);

      if (intersects.length > 0) {
        const hovered = intersects[0].object.userData.slot;
        if (hovered && hovered.status === "available" && !hovered.is_handicapped) {
          container.style.cursor = "pointer";
          setHoveredSlot(hovered);
          return;
        }
      }
      container.style.cursor = "default";
      setHoveredSlot(null);
    };

    const handlePointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastableMeshes);

      if (intersects.length > 0) {
        const clicked = intersects[0].object.userData.slot;
        if (clicked && clicked.status === "available" && !clicked.is_handicapped) {
          if (onSelect) onSelect(clicked);
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("pointermove", handlePointerMove);
    domElement.addEventListener("pointerdown", handlePointerDown);

    // Main Animation Loop
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && controlsRef.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = 2.0;
      } else if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
      }

      if (controlsRef.current) {
        controlsRef.current.update();
        setCameraYaw(controlsRef.current.getAzimuthalAngle() * (180 / Math.PI));
      }

      // Update Self-Parking Vehicle Movement
      simCars.forEach((car, idx) => {
        if (!car.active) {
          car.startTimer += 1;
          if (car.startTimer >= 200) {
            const isEntryClear = !simCars.some(
              (other, oIdx) => oIdx !== idx && other.active && Math.hypot(other.x - -7.5, other.z - 22.0) < 6.0
            );

            if (isEntryClear) {
              car.active = true;
              car.mesh.visible = true;
              car.x = -7.5;
              car.z = 24.0;
              car.y = targetY;
              car.angle = Math.PI;
              car.mesh.rotation.y = car.angle;
              car.state = "GATE_ENTRY";
              car.parkTimer = 0;
            }
          }
          return;
        }

        const spot = car.targetSpot;
        const approachFromLane1 = (spot.zone === "A" || (spot.zone === "B" && spot.side === "left"));
        const approachX = approachFromLane1 ? -7.5 : 7.5;
        const dxToSpot = spot.x - approachX;

        // Physical Directional 3D Collision Prevention
        let blocked = false;
        simCars.forEach((other, oIdx) => {
          if (oIdx !== idx && other.active && other.state !== "PARKED") {
            const dx = other.x - car.x;
            const dz = other.z - car.z;
            const dist = Math.hypot(dx, dz);

            if (dist < 4.8) {
              if (Math.abs(car.angle - Math.PI) < 0.1) {
                if (other.z < car.z && Math.abs(dx) < 2.2) blocked = true;
              } else if (Math.abs(car.angle - Math.PI / 2) < 0.1) {
                if (other.x > car.x && Math.abs(dz) < 2.2) blocked = true;
              } else if (Math.abs(car.angle) < 0.1) {
                if (other.z > car.z && Math.abs(dx) < 2.2) blocked = true;
              } else if (Math.abs(car.angle - (-Math.PI / 2)) < 0.1) {
                if (other.x < car.x && Math.abs(dz) < 2.2) blocked = true;
              }
            }
          }
        });

        if (blocked) return;

        // ACCURATE PARKING VECTOR STATE MACHINE FOR ALL ZONES
        if (car.state === "GATE_ENTRY") {
          car.angle = Math.PI;
          car.z -= car.speed;
          if (car.z <= 18.0) {
            car.z = 18.0;
            car.state = "APPROACH_LANE1";
          }
        } else if (car.state === "APPROACH_LANE1") {
          car.angle = Math.PI;
          car.z -= car.speed;

          if (approachFromLane1) {
            if (car.z <= spot.z) {
              car.z = spot.z;
              car.state = "PARKING_IN";
              car.angle = spot.turnInAngle;
            }
          } else {
            if (car.z <= -14.0) {
              car.z = -14.0;
              car.state = "APPROACH_CROSSING";
              car.angle = Math.PI / 2;
            }
          }
        } else if (car.state === "APPROACH_CROSSING") {
          car.angle = Math.PI / 2;
          car.x += car.speed;
          if (car.x >= 7.5) {
            car.x = 7.5;
            car.state = "APPROACH_LANE2";
            car.angle = 0;
          }
        } else if (car.state === "APPROACH_LANE2") {
          car.angle = 0;
          car.z += car.speed;
          if (car.z >= spot.z) {
            car.z = spot.z;
            car.state = "PARKING_IN";
            car.angle = spot.turnInAngle;
          }
        } else if (car.state === "PARKING_IN") {
          const stepX = dxToSpot > 0 ? car.speed : -car.speed;
          car.x += stepX;
          car.angle = spot.turnInAngle;

          const reached = dxToSpot > 0 ? car.x >= spot.x : car.x <= spot.x;
          if (reached) {
            car.x = spot.x;
            car.state = "PARKED";
            car.parkTimer = 0;
          }
        } else if (car.state === "PARKED") {
          car.parkTimer += 1;
          if (car.parkTimer >= car.maxParkDuration) {
            car.state = "LEAVING";
          }
        } else if (car.state === "LEAVING") {
          const reverseStepX = spot.x < approachX ? car.speed : -car.speed;
          car.x += reverseStepX;

          const reachedAisle = spot.x < approachX ? car.x >= approachX : car.x <= approachX;
          if (reachedAisle) {
            car.x = approachX;
            if (approachFromLane1) {
              car.state = "EXIT_LANE1";
              car.angle = Math.PI;
            } else {
              car.state = "EXIT_LANE2";
              car.angle = 0;
            }
          }
        } else if (car.state === "EXIT_LANE1") {
          car.angle = Math.PI;
          car.z -= car.speed;
          if (car.z <= -14.0) {
            car.z = -14.0;
            car.state = "EXIT_CROSSING";
            car.angle = Math.PI / 2;
          }
        } else if (car.state === "EXIT_CROSSING") {
          car.angle = Math.PI / 2;
          car.x += car.speed;
          if (car.x >= 7.5) {
            car.x = 7.5;
            car.state = "EXIT_LANE2";
            car.angle = 0;
          }
        } else if (car.state === "EXIT_LANE2") {
          car.angle = 0;
          car.z += car.speed;
          if (car.z >= 24.0) {
            car.active = false;
            car.mesh.visible = false;
            car.startTimer = 0;

            const activeSpots = new Set(simCars.filter((c) => c.active).map((c) => c.targetSpot?.code));
            car.targetSpot = pickRandomAvailableSpot(activeSpots);
            car.maxParkDuration = 180 + Math.floor(Math.random() * 320);
          }
        }

        car.mesh.position.set(car.x, car.y + 0.02, car.z);
        car.mesh.rotation.y = car.angle;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 900;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      domElement.removeEventListener("pointermove", handlePointerMove);
      domElement.removeEventListener("pointerdown", handlePointerDown);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [mergedSlots, highlightCode, selectedFloor, cameraMode, autoRotate, CAR_COLORS, onSelect]);

  // Handle Zoom
  const handleZoom = (delta) => {
    if (!controlsRef.current || !cameraRef.current) return;
    const camera = cameraRef.current;
    const factor = delta > 0 ? 0.85 : 1.18;
    camera.position.multiplyScalar(factor);
    controlsRef.current.update();
  };

  // Reset Camera View
  const handleResetCamera = () => {
    if (!controlsRef.current || !cameraRef.current) return;
    const isAllMode = String(selectedFloor).toLowerCase() === "all";
    const activeFloorNum = Number(selectedFloor) || 1;
    const targetY = isAllMode ? 9.0 : (activeFloorNum - 1) * 9.0;

    if (cameraMode === "2D") {
      cameraRef.current.position.set(0, targetY + 52, 0.1);
    } else if (isAllMode) {
      cameraRef.current.position.set(0, 48, 56);
    } else {
      cameraRef.current.position.set(0, targetY + 32, 38);
    }
    controlsRef.current.target.set(0, targetY, 0);
    controlsRef.current.update();
  };

  return (
    <div className="relative rounded-3xl border border-border/80 dark:border-purple-900/40 bg-card dark:bg-[#0c081e] shadow-2xl overflow-hidden font-sans">
      {/* Top Control Toolbar */}
      <div className="p-4 sm:p-5 border-b border-border/80 dark:border-purple-900/40 bg-card/90 dark:bg-[#0a0618]/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <p className="text-xs font-mono font-semibold tracking-widest uppercase text-purple-600 dark:text-purple-300">
              Interactive Rotatable 3D Self-Parking Garage
            </p>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground dark:text-white mt-0.5">
            {selectedMall?.name ? `${selectedMall.name} · ` : ""}{String(selectedFloor).toLowerCase() === "all" ? "All 3 Floors Stacked 3D Model" : `Floor Level ${selectedFloor} · Zone A, B & C`}
          </h3>
        </div>

        {/* Level Switcher Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-200/80 dark:bg-[#070414] border border-border dark:border-purple-900/40">
            {["all", 1, 2, 3].map((fl) => (
              <Button
                key={fl}
                variant={String(selectedFloor).toLowerCase() === String(fl).toLowerCase() ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedFloor(fl)}
                className={`rounded-xl text-xs font-semibold h-8 px-3 transition-all ${
                  String(selectedFloor).toLowerCase() === String(fl).toLowerCase()
                    ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                    : "text-muted-foreground hover:text-foreground dark:text-purple-300"
                }`}
              >
                {fl === "all" ? "All 3 Floors" : `Level ${fl}`}
              </Button>
            ))}
          </div>

          <Button
            variant={autoRotate ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRotate((r) => !r)}
            className={`rounded-2xl text-xs font-semibold h-9 px-3.5 ${
              autoRotate
                ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "bg-card border-border dark:bg-[#090518] dark:border-purple-900/40 dark:text-purple-200"
            }`}
          >
            <Compass className={`w-3.5 h-3.5 mr-1.5 ${autoRotate ? "animate-spin" : ""}`} />
            Auto 360° Spin
          </Button>
        </div>
      </div>

      {/* 3D Canvas Container */}
      <div className="relative w-full h-[560px] bg-[#080512]">
        <div ref={mountRef} className="w-full h-full" />

        {/* Top Left Live Status Widget */}
        <div className="absolute top-4 left-4 z-20 p-3.5 rounded-2xl bg-card/90 dark:bg-[#0d0822]/90 backdrop-blur-xl border border-border/80 dark:border-purple-900/40 shadow-xl max-w-[240px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live Self-Parking</span>
          </div>
          <p className="text-xs text-foreground dark:text-white font-medium">Cars Navigate & Self-Park</p>
          <p className="text-[10px] text-muted-foreground dark:text-purple-300/60 mt-0.5">Updated just now</p>
        </div>

        {/* Hovered Slot Tooltip Overlay */}
        {hoveredSlot && (
          <div className="absolute top-4 right-20 z-20 p-3 rounded-2xl bg-emerald-500/90 backdrop-blur-md text-white shadow-xl flex items-center gap-2 font-bold text-xs animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Click {hoveredSlot.code} to Book Spot</span>
          </div>
        )}

        {/* Bottom Right Controls */}
        <div className="absolute bottom-5 right-5 z-20 flex flex-col items-center gap-2">
          <div
            className="w-12 h-12 rounded-full bg-card/90 dark:bg-[#0c071e]/90 backdrop-blur-xl border border-border/80 dark:border-purple-900/50 shadow-2xl flex items-center justify-center relative mb-1 cursor-pointer transition-transform hover:scale-105"
            onClick={handleResetCamera}
            title="Reset North Heading"
          >
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-100"
              style={{ transform: `rotate(${-cameraYaw}deg)` }}
            >
              <div className="w-1 h-4 bg-rose-500 rounded-t-full absolute top-1" />
              <div className="w-1 h-4 bg-slate-400 rounded-b-full absolute bottom-1" />
              <span className="text-[10px] font-bold text-white z-10">N</span>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl bg-card/90 dark:bg-[#0c071e]/90 backdrop-blur-xl border border-border/80 dark:border-purple-900/50 shadow-2xl p-1 gap-1">
            <button
              onClick={() => handleZoom(1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground dark:text-purple-200 hover:bg-purple-600 hover:text-white transition-colors"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom(-1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground dark:text-purple-200 hover:bg-purple-600 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="h-px bg-border/80 dark:bg-purple-900/40 my-0.5" />
            <button
              onClick={() => setCameraMode("2D")}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                cameraMode === "2D"
                  ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  : "text-muted-foreground dark:text-purple-300 hover:bg-purple-950/40"
              }`}
              title="2D Top View"
            >
              2D
            </button>
            <button
              onClick={() => setCameraMode("3D")}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                cameraMode === "3D"
                  ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  : "text-muted-foreground dark:text-purple-300 hover:bg-purple-950/40"
              }`}
              title="3D Perspective View"
            >
              3D
            </button>
            <button
              onClick={handleResetCamera}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground dark:text-purple-200 hover:bg-purple-600 hover:text-white transition-colors"
              title="Reset Perspective"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom Left Legend Bar */}
        <div className="absolute bottom-5 left-5 z-20 p-3.5 rounded-2xl bg-card/90 dark:bg-[#0c071e]/90 backdrop-blur-xl border border-border/80 dark:border-purple-900/40 shadow-2xl flex flex-wrap items-center gap-4 text-xs font-medium text-foreground dark:text-purple-200">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-sky-400 font-semibold">EV Charging (Zone A)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-bold">♿</span>
            <span className="text-blue-400 font-semibold">Accessible (Zone C Entrance)</span>
          </div>
        </div>
      </div>
    </div>
  );
}