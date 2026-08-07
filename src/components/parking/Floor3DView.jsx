import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { Zap, Layers, Compass, Building2, Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Creates a realistic 3D Car Model Mesh with curved body, windows, mirrors, grille & wheels
 */
function createRealistic3DCarMesh(color = "#334155", isEv = false, isHandicapped = false) {
  const carGroup = new THREE.Group();

  // Primary Body Paint Material
  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(isHandicapped ? "#2563eb" : color),
    metalness: 0.75,
    roughness: 0.25,
  });

  // Dark Glass Window Material
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85,
  });

  // Chrome Accent Material
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.1,
  });

  // 1. Lower Body / Hood / Trunk Chassis
  const chassisGeo = new THREE.BoxGeometry(1.65, 0.45, 3.6);
  chassisGeo.translate(0, 0.32, 0);
  const chassis = new THREE.Mesh(chassisGeo, bodyMat);
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  carGroup.add(chassis);

  // Hood Slope
  const hoodGeo = new THREE.BoxGeometry(1.58, 0.15, 1.1);
  hoodGeo.rotateX(Math.PI / 24);
  hoodGeo.translate(0, 0.48, 1.1);
  const hood = new THREE.Mesh(hoodGeo, bodyMat);
  carGroup.add(hood);

  // 2. Aerodynamic Cabin Roof
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

  // Side Mirrors (Left & Right)
  const mirrorGeo = new THREE.BoxGeometry(0.2, 0.12, 0.15);
  const mirrorL = new THREE.Mesh(mirrorGeo, bodyMat);
  mirrorL.position.set(-0.88, 0.65, 0.55);
  const mirrorR = new THREE.Mesh(mirrorGeo, bodyMat);
  mirrorR.position.set(0.88, 0.65, 0.55);
  carGroup.add(mirrorL, mirrorR);

  // Front Grille
  const grilleGeo = new THREE.BoxGeometry(1.2, 0.18, 0.05);
  const grille = new THREE.Mesh(grilleGeo, chromeMat);
  grille.position.set(0, 0.35, 1.81);
  carGroup.add(grille);

  // Headlights (Front Emissive LED Bars)
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

  // Taillights (Rear LED Strip)
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

  // 3. Wheels & Chrome Hubcaps
  const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 24);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
  const hubGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.24, 16);
  hubGeo.rotateZ(Math.PI / 2);

  const wheelPositions = [
    [-0.85, 0.32, 1.05],  // FL
    [0.85, 0.32, 1.05],   // FR
    [-0.85, 0.32, -1.05], // RL
    [0.85, 0.32, -1.05],  // RR
  ];

  wheelPositions.forEach(([x, y, z]) => {
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

  // Post
  const postGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.4, 12);
  postGeo.translate(0, 0.7, 0);
  const postMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
  group.add(new THREE.Mesh(postGeo, postMat));

  // Sign Board
  const signGeo = new THREE.BoxGeometry(0.5, 0.5, 0.05);
  signGeo.translate(0, 1.35, 0);
  const signMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, emissive: 0x1d4ed8, emissiveIntensity: 0.5 });
  group.add(new THREE.Mesh(signGeo, signMat));

  return group;
}

/**
 * Creates Floating 'P' Icon Badge for Available Slots
 */
function createPBadge() {
  const group = new THREE.Group();
  const discGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.08, 32);
  const discMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.6,
    metalness: 0.5,
    roughness: 0.2,
  });
  const disc = new THREE.Mesh(discGeo, discMat);
  disc.position.y = 0.9;
  disc.rotateX(Math.PI / 2);
  group.add(disc);
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
  const [internalSelectedFloor, setInternalSelectedFloor] = useState("all");
  const [autoRotate, setAutoRotate] = useState(false);

  const selectedFloor = propSelectedFloor !== undefined ? propSelectedFloor : internalSelectedFloor;
  const setSelectedFloor = propSetSelectedFloor || setInternalSelectedFloor;

  const CAR_COLORS = useMemo(
    () => ["#e2e8f0", "#94a3b8", "#334155", "#0f172a", "#1e3a8a", "#0284c7", "#b91c1c", "#15803d", "#7c3aed"],
    []
  );

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = 520;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f1f5f9");
    scene.fog = new THREE.FogExp2("#f1f5f9", 0.006);

    const isAllMode = String(selectedFloor).toLowerCase() === "all";

    // Fixed 3D Height per Level (Level 1: Y=0, Level 2: Y=9.0, Level 3: Y=18.0)
    const FLOOR_HEIGHT = 9.0;
    const floorYOffsets = {
      1: 0 * FLOOR_HEIGHT,
      2: 1 * FLOOR_HEIGHT,
      3: 2 * FLOOR_HEIGHT,
    };

    // 2. Camera Setup - Auto-adjust camera focus & target to active floor's 3D height
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.5, 400);

    if (isAllMode) {
      // Auto-adjust camera to elevated angle framing all 3 stacked floors
      camera.position.set(0, 38, 52);
      camera.lookAt(0, 9.0, 0);
    } else {
      const activeLevelNum = Number(selectedFloor) || 1;
      const targetY = floorYOffsets[activeLevelNum] ?? 0;
      // Focus camera directly on the active level's fixed 3D elevation
      camera.position.set(0, targetY + 26, 42);
      camera.lookAt(0, targetY + 2.0, 0);
    }

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
    dirLight.position.set(30, 60, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.left = -45;
    dirLight.shadow.camera.right = 45;
    dirLight.shadow.camera.top = 45;
    dirLight.shadow.camera.bottom = -45;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.6);
    fillLight.position.set(-30, 30, -30);
    scene.add(fillLight);

    // Ground Base Ground Level
    const groundGeo = new THREE.PlaneGeometry(100, 90);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Mall Entrance Portal Building Box at Front Right
    const entranceGeo = new THREE.BoxGeometry(8, 6, 12);
    entranceGeo.translate(22, 3, -12);
    const entranceMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const entrance = new THREE.Mesh(entranceGeo, entranceMat);
    entrance.castShadow = true;
    scene.add(entrance);

    // Mall Entrance Sign Board
    const signGeo = new THREE.BoxGeometry(6, 1.2, 0.2);
    signGeo.translate(22, 5.2, -5.9);
    const signMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 0.8 });
    scene.add(new THREE.Mesh(signGeo, signMat));

    // 5. Build 3D Multi-Level Parking Garage Building (Floors 1, 2, 3)
    const raycastableMeshes = [];
    const floorsToRender = [1, 2, 3];

    // Building Support Pillars at corners across vertical height
    if (isAllMode) {
      const pillarGeo = new THREE.CylinderGeometry(0.4, 0.4, 20, 16);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        metalness: 0.5,
        roughness: 0.3,
        transparent: true,
        opacity: 0.6,
      });
      [
        [-18, 9, -18],
        [18, 9, -18],
        [-18, 9, 14],
        [18, 9, 14],
      ].forEach(([px, py, pz]) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(px, py, pz);
        pillar.castShadow = true;
        scene.add(pillar);
      });
    }

    floorsToRender.forEach((floorNum) => {
      // ✅ Keep fixed Y height, control visibility instead of resetting elevation to 0
      const isVisible = isAllMode || String(selectedFloor) === String(floorNum);
      if (!isVisible) return;

      const yOffset = floorYOffsets[floorNum];

      // Transparent Glass / Concrete Floor Slab Plate (~0.38 opacity in Full Building mode)
      const floorSlabGeo = new THREE.BoxGeometry(38, 0.4, 34);
      floorSlabGeo.translate(0, yOffset, -2);
      const floorSlabMat = new THREE.MeshStandardMaterial({
        color: isAllMode ? 0xbae6fd : 0xf8fafc,
        metalness: 0.1,
        roughness: 0.2,
        transparent: isAllMode,
        opacity: isAllMode ? 0.38 : 1.0,
        depthWrite: !isAllMode,
      });
      const floorSlab = new THREE.Mesh(floorSlabGeo, floorSlabMat);
      floorSlab.receiveShadow = !isAllMode;
      scene.add(floorSlab);

      // Sleek cyan/blue border outline for platform visibility
      const slabEdges = new THREE.EdgesGeometry(floorSlabGeo);
      const slabLineMat = new THREE.LineBasicMaterial({
        color: isAllMode ? 0x0284c7 : 0xcbd5e1,
        linewidth: 2,
        transparent: isAllMode,
        opacity: isAllMode ? 0.8 : 1.0,
      });
      const slabLine = new THREE.LineSegments(slabEdges, slabLineMat);
      scene.add(slabLine);

      // Filter slots for this floor, generate full set if empty/partial
      const rawFloorSlots = slots.filter((s) => s.floor === floorNum);

      // Render 3 Rows of 10 Spots (Row 1: Zone A, Row 2: Zone B, Row 3: Zone C)
      const zones = ["A", "B", "C"];
      const zoneZOffsets = { A: -12, B: -2, C: 8 };

      zones.forEach((zoneKey) => {
        let zoneSlots = rawFloorSlots
          .filter((s) => s.zone === zoneKey)
          .sort((a, b) => a.code.localeCompare(b.code));

        // Ensure 10 slots per zone so all 3 floors render 30 bays simultaneously
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

        // Render 10 parking bays per row side-by-side
        zoneSlots.forEach((slot, idx) => {
          const xPos = -14.4 + idx * 3.2; // 10 slots spaced across 32m width

          const isAvailable = slot.status === "available";
          const isOccupied = slot.status === "occupied";
          const isReserved = slot.status === "reserved";
          const isHandicapped = slot.is_handicapped;
          const isHighlighted = highlightCode && slot.code === highlightCode;

          // 3D Bay Ground Outline
          const bayGeo = new THREE.PlaneGeometry(2.6, 4.4);
          let bayColor = 0xe2e8f0;
          if (isHandicapped) bayColor = 0x2563eb; // Blue for Handicapped
          else if (isAvailable) bayColor = 0x3b82f6;
          else if (isReserved) bayColor = 0xf59e0b;
          else if (isOccupied) bayColor = 0x94a3b8;

          if (isHighlighted) bayColor = 0x10b981;

          const bayMat = new THREE.MeshStandardMaterial({
            color: isHandicapped ? 0xeff6ff : isAvailable ? 0xdbeafe : 0xf1f5f9,
            roughness: 0.6,
            side: THREE.DoubleSide,
          });

          const bayMesh = new THREE.Mesh(bayGeo, bayMat);
          bayMesh.rotation.x = -Math.PI / 2;
          bayMesh.position.set(xPos, yOffset + 0.22, zPos);
          bayMesh.receiveShadow = true;
          bayMesh.userData = { slot };
          scene.add(bayMesh);
          raycastableMeshes.push(bayMesh);

          // Border Line Frame
          const edges = new THREE.EdgesGeometry(bayGeo);
          const lineMat = new THREE.LineBasicMaterial({ color: bayColor, linewidth: 2 });
          const line = new THREE.LineSegments(edges, lineMat);
          line.rotation.x = -Math.PI / 2;
          line.position.set(xPos, yOffset + 0.23, zPos);
          scene.add(line);

          // If OCCUPIED or RESERVED: Render Realistic 3D Car Model!
          if (isOccupied || isReserved) {
            const colorIdx = Math.abs(slot.code.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % CAR_COLORS.length;
            const carColor = isHandicapped ? "#2563eb" : isReserved ? "#f59e0b" : CAR_COLORS[colorIdx];
            const car = createRealistic3DCarMesh(carColor, slot.is_ev, isHandicapped);
            car.position.set(xPos, yOffset + 0.22, zPos);
            scene.add(car);
          }

          // If AVAILABLE: Render Glowing 3D 'P' Badge
          if (isAvailable) {
            const pBadge = createPBadge();
            pBadge.position.set(xPos, yOffset + 0.22, zPos);
            scene.add(pBadge);
          }

          // If EV Bay: Add 3D EV Charging Station Pillar
          if (slot.is_ev) {
            const evPillar = createEvPillar();
            evPillar.position.set(xPos - 1.0, yOffset + 0.22, zPos - 2.0);
            scene.add(evPillar);
          }

          // If HANDICAPPED / SPECIALLY ABLED: Add Handicapped Sign
          if (isHandicapped) {
            const handiSign = createHandicappedSign();
            handiSign.position.set(xPos + 1.0, yOffset + 0.22, zPos - 2.0);
            scene.add(handiSign);
          }
        });
      });
    });

    // 6. Raycasting Click Selection
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
        if (clickedSlot && clickedSlot.status === "available") {
          if (onSelect) onSelect(clickedSlot);
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("pointerdown", handlePointerDown);

    // 7. Animation Loop
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate) {
        scene.rotation.y += 0.003;
      } else {
        scene.rotation.y = 0;
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
  }, [slots, highlightCode, selectedFloor, autoRotate, CAR_COLORS, onSelect]);

  return (
    <div className="relative rounded-[2rem] border border-border bg-card shadow-xl overflow-hidden">
      {/* 3D Multi-Level Building Controls Top Bar */}
      <div className="p-4 sm:p-6 border-b bg-muted/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <p className="text-xs font-semibold tracking-widest uppercase text-sky-600 dark:text-sky-400">
              3D Parking Garage Building Model
            </p>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
            3 Floors · 3 Rows of 10 Bays Per Floor
          </h3>
        </div>

        {/* Level Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            variant={String(selectedFloor).toLowerCase() === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFloor("all")}
            className="rounded-full text-xs font-medium h-9"
          >
            <Layers className="w-3.5 h-3.5 mr-1" />
            Full Building
          </Button>
          <Button
            variant={String(selectedFloor) === "1" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFloor(1)}
            className="rounded-full text-xs font-medium h-9"
          >
            Level 1
          </Button>
          <Button
            variant={String(selectedFloor) === "2" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFloor(2)}
            className="rounded-full text-xs font-medium h-9"
          >
            Level 2
          </Button>
          <Button
            variant={String(selectedFloor) === "3" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFloor(3)}
            className="rounded-full text-xs font-medium h-9"
          >
            Level 3
          </Button>
          <Button
            variant={autoRotate ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRotate((r) => !r)}
            className="rounded-full text-xs font-medium h-9 ml-1"
          >
            <Compass className={`w-3.5 h-3.5 mr-1 ${autoRotate ? "animate-spin" : ""}`} />
            {autoRotate ? "Rotating" : "Rotate 360°"}
          </Button>
        </div>
      </div>

      {/* Three.js Canvas Container */}
      <div className="relative w-full h-[520px] bg-slate-100 dark:bg-slate-900 cursor-grab active:cursor-grabbing">
        <div ref={mountRef} className="w-full h-full" />

        {/* Overlay Legend Bar */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-10 p-3.5 rounded-2xl bg-background/90 backdrop-blur-md border shadow-lg flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Accessibility className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-600 dark:text-blue-400">Specially Abled (Near Mall Entrance)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white">P</div>
            <span className="font-medium text-foreground">Tap Free Spot to Reserve</span>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-sky-500" />
            <span className="font-medium text-sky-600 dark:text-sky-400">EV Charger</span>
          </div>
        </div>
      </div>
    </div>
  );
}