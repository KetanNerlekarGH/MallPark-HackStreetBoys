import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { Zap, Eye, RotateCcw, Maximize2, Compass, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Creates a procedural 3D Sedan Car Mesh
 * @param {string} color - Hex color for car body
 * @param {boolean} isEv - Whether car is electric
 */
function create3DCarMesh(color = "#cbd5e1", isEv = false) {
  const carGroup = new THREE.Group();

  // Car Body Base (Chassis)
  const bodyGeo = new THREE.BoxGeometry(1.6, 0.55, 3.4);
  bodyGeo.translate(0, 0.38, 0);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.6,
    roughness: 0.3,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  carGroup.add(bodyMesh);

  // Cabin / Roof (Upper Body)
  const cabinGeo = new THREE.BoxGeometry(1.35, 0.48, 1.8);
  cabinGeo.translate(0, 0.8, -0.15);
  const cabinMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#1e293b"),
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85,
  });
  const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
  cabinMesh.castShadow = true;
  carGroup.add(cabinMesh);

  // Windshield & Rear Window Slopes (Smooth Pillars)
  const frontGlassGeo = new THREE.BoxGeometry(1.3, 0.42, 0.7);
  frontGlassGeo.rotateX(Math.PI / 6);
  frontGlassGeo.translate(0, 0.72, 0.75);
  const frontGlass = new THREE.Mesh(frontGlassGeo, cabinMat);
  carGroup.add(frontGlass);

  const rearGlassGeo = new THREE.BoxGeometry(1.3, 0.4, 0.7);
  rearGlassGeo.rotateX(-Math.PI / 6);
  rearGlassGeo.translate(0, 0.72, -1.05);
  const rearGlass = new THREE.Mesh(rearGlassGeo, cabinMat);
  carGroup.add(rearGlass);

  // Headlights (Front Emissive)
  const headlightGeo = new THREE.BoxGeometry(0.35, 0.1, 0.1);
  const headlightMat = new THREE.MeshStandardMaterial({
    color: isEv ? new THREE.Color("#38bdf8") : new THREE.Color("#fef08a"),
    emissive: isEv ? new THREE.Color("#0284c7") : new THREE.Color("#eab308"),
    emissiveIntensity: 0.8,
  });
  const hlLeft = new THREE.Mesh(headlightGeo, headlightMat);
  hlLeft.position.set(-0.55, 0.42, 1.68);
  const hlRight = new THREE.Mesh(headlightGeo, headlightMat);
  hlRight.position.set(0.55, 0.42, 1.68);
  carGroup.add(hlLeft, hlRight);

  // Taillights (Rear Emissive)
  const taillightGeo = new THREE.BoxGeometry(0.35, 0.08, 0.1);
  const taillightMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#ef4444"),
    emissive: new THREE.Color("#dc2626"),
    emissiveIntensity: 0.7,
  });
  const tlLeft = new THREE.Mesh(taillightGeo, taillightMat);
  tlLeft.position.set(-0.55, 0.42, -1.68);
  const tlRight = new THREE.Mesh(taillightGeo, taillightMat);
  tlRight.position.set(0.55, 0.42, -1.68);
  carGroup.add(tlLeft, tlRight);

  // Wheels (4 Alloy Wheels)
  const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 18);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
  const hubMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });

  const wheelPositions = [
    [-0.8, 0.3, 1.0],  // Front Left
    [0.8, 0.3, 1.0],   // Front Right
    [-0.8, 0.3, -1.0], // Rear Left
    [0.8, 0.3, -1.0],  // Rear Right
  ];

  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    
    // Hubcap detail
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.22, 12), hubMat);
    hub.rotateZ(Math.PI / 2);
    hub.position.set(x, y, z);
    
    carGroup.add(wheel, hub);
  });

  return carGroup;
}

/**
 * Creates a procedural 3D EV Charging Station Pillar Mesh
 */
function createEvPillarMesh() {
  const group = new THREE.Group();

  // Pillar Body
  const pillarGeo = new THREE.BoxGeometry(0.3, 1.2, 0.3);
  pillarGeo.translate(0, 0.6, 0);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.castShadow = true;
  group.add(pillar);

  // Glowing Screen / Light Indicator
  const screenGeo = new THREE.BoxGeometry(0.2, 0.3, 0.05);
  screenGeo.translate(0, 0.85, 0.14);
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 1.0,
  });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  group.add(screen);

  return group;
}

/**
 * Creates 3D 'P' Badge Icon Mesh for available bays
 */
function createPBadgeMesh() {
  const group = new THREE.Group();

  // Circular Badge Disc
  const discGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.1, 32);
  const discMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.6,
    metalness: 0.4,
    roughness: 0.2,
  });
  const disc = new THREE.Mesh(discGeo, discMat);
  disc.position.y = 0.8;
  disc.rotateX(Math.PI / 2);
  group.add(disc);

  return group;
}

export default function Floor3DView({ slots = [], highlightCode, onSelect }) {
  const mountRef = useRef(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [cameraPreset, setCameraPreset] = useState("tesla"); // tesla, top, perspective

  // Car color palette for parked vehicles
  const CAR_COLORS = useMemo(
    () => ["#e2e8f0", "#94a3b8", "#475569", "#334155", "#0f172a", "#1e3a8a", "#0284c7", "#b91c1c", "#15803d"],
    []
  );

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = 480;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f1f5f9");
    scene.fog = new THREE.FogExp2("#f1f5f9", 0.008);

    // 2. Camera Setup (Tesla 3D Perspective)
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.5, 300);
    camera.position.set(0, 18, 28);
    camera.lookAt(0, 0, -2);

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

    // 4. Lighting Setup (Soft Studio Lighting matching Tesla UI)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 150;
    dirLight.shadow.camera.left = -35;
    dirLight.shadow.camera.right = 35;
    dirLight.shadow.camera.top = 35;
    dirLight.shadow.camera.bottom = -35;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.5);
    fillLight.position.set(-20, 20, -20);
    scene.add(fillLight);

    // 5. Ground / Asphalt Plane
    const groundGeo = new THREE.PlaneGeometry(80, 70);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Central Driving Aisle Lane Marking Line
    const aisleGeo = new THREE.PlaneGeometry(0.25, 55);
    const aisleMat = new THREE.MeshBasicMaterial({ color: 0xcbd5e1, side: THREE.DoubleSide });
    const aisle = new THREE.Mesh(aisleGeo, aisleMat);
    aisle.rotation.x = -Math.PI / 2;
    aisle.position.set(0, 0.01, -2);
    scene.add(aisle);

    // Driving Tesla Model in Aisle (Center Navigation Car)
    const navCar = create3DCarMesh("#0f172a", true);
    navCar.position.set(0, 0, 8);
    scene.add(navCar);

    // 6. Build 3D Parking Bays & Cars Grid
    // Organize slots into 3 Zones: A (Left), B (Middle), C (Right)
    const raycastableMeshes = [];
    const slotMeshMap = new Map();

    const zones = ["A", "B", "C"];
    const zoneXOffsets = { A: -14, B: 0, C: 14 };

    zones.forEach((zoneKey) => {
      const zoneSlots = slots.filter((s) => s.zone === zoneKey).sort((a, b) => a.code.localeCompare(b.code));
      const xOffset = zoneXOffsets[zoneKey] || 0;

      // Group into 2 facing rows of 5 bays each
      zoneSlots.forEach((slot, idx) => {
        const row = Math.floor(idx / 5); // 0 or 1
        const col = idx % 5;              // 0..4

        // Position coordinates
        const x = xOffset + (col - 2) * 2.5;
        const z = row === 0 ? -12 + (col * 0.2) : -2 + (col * 0.2);
        const rotationY = row === 0 ? 0 : Math.PI;

        const isAvailable = slot.status === "available";
        const isOccupied = slot.status === "occupied";
        const isReserved = slot.status === "reserved";
        const isHighlighted = highlightCode && slot.code === highlightCode;

        // Bay Outline Plane (Ground Box)
        const bayWidth = 2.2;
        const bayLength = 4.2;
        const bayGeo = new THREE.PlaneGeometry(bayWidth, bayLength);
        
        let bayColor = 0xe2e8f0; // default border
        if (isAvailable) bayColor = 0x3b82f6; // Tesla Blue highlight for available
        else if (isReserved) bayColor = 0xf59e0b; // Amber reserved
        else if (isOccupied) bayColor = 0x94a3b8; // Muted grey for occupied

        if (isHighlighted) bayColor = 0x10b981; // Green highlight for searched slot

        const bayMat = new THREE.MeshStandardMaterial({
          color: isAvailable ? 0xdbeafe : 0xf1f5f9,
          roughness: 0.6,
          side: THREE.DoubleSide,
        });

        const bayMesh = new THREE.Mesh(bayGeo, bayMat);
        bayMesh.rotation.x = -Math.PI / 2;
        bayMesh.position.set(x, 0.02, z);
        bayMesh.receiveShadow = true;
        bayMesh.userData = { slot };
        scene.add(bayMesh);
        raycastableMeshes.push(bayMesh);
        slotMeshMap.set(slot.code, bayMesh);

        // 3D Bay Border Line
        const edges = new THREE.EdgesGeometry(bayGeo);
        const lineMat = new THREE.LineBasicMaterial({ color: bayColor, linewidth: 2 });
        const line = new THREE.LineSegments(edges, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(x, 0.03, z);
        scene.add(line);

        // If OCCUPIED or RESERVED: Render a 3D Car Model in the bay!
        if (isOccupied || isReserved) {
          const colorIdx = Math.abs(slot.code.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)) % CAR_COLORS.length;
          const carColor = isReserved ? "#f59e0b" : CAR_COLORS[colorIdx];
          const car = create3DCarMesh(carColor, slot.is_ev);
          car.position.set(x, 0, z);
          car.rotation.y = rotationY;
          scene.add(car);
        }

        // If AVAILABLE: Render Glowing 3D 'P' Badge
        if (isAvailable) {
          const pBadge = createPBadgeMesh();
          pBadge.position.set(x, 0, z);
          scene.add(pBadge);
        }

        // If EV Bay: Add 3D EV Charging Station Pillar
        if (slot.is_ev) {
          const evPillar = createEvPillarMesh();
          evPillar.position.set(x - 0.9, 0, z - 2.0);
          scene.add(evPillar);
        }
      });
    });

    // 7. Raycasting / Interaction (Click to select slot)
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
          setSelectedSlot(clickedSlot);
          if (onSelect) onSelect(clickedSlot);
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("pointerdown", handlePointerDown);

    // 8. Animation & Camera Controls Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle ambient animation for navigation Tesla car
      navCar.position.z = 8 + Math.sin(elapsedTime * 0.8) * 0.5;

      if (autoRotate) {
        scene.rotation.y += 0.003;
      } else {
        scene.rotation.y = 0;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Responsive Resize Handler
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
  }, [slots, highlightCode, autoRotate, CAR_COLORS, onSelect]);

  return (
    <div className="relative rounded-[2rem] border border-border bg-card shadow-xl overflow-hidden">
      {/* 3D Controls Top Bar */}
      <div className="p-4 sm:p-6 border-b bg-muted/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
            <p className="text-xs font-semibold tracking-widest uppercase text-sky-600 dark:text-sky-400">
              Tesla-Style 3D Live Map
            </p>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Interactive 3D Parking Floor Model
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={autoRotate ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRotate((r) => !r)}
            className="rounded-full h-9 text-xs font-medium"
          >
            <Compass className={`w-3.5 h-3.5 mr-1.5 ${autoRotate ? "animate-spin" : ""}`} />
            {autoRotate ? "Auto-Rotating" : "360° Rotate"}
          </Button>
        </div>
      </div>

      {/* Three.js 3D Canvas Mount Container */}
      <div className="relative w-full h-[480px] cursor-grab active:cursor-grabbing bg-slate-100 dark:bg-slate-900">
        <div ref={mountRef} className="w-full h-full" />

        {/* Legend Overlay Box (Matching Screenshot Aesthetic) */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-10 p-3.5 rounded-2xl bg-background/90 backdrop-blur-md border shadow-lg flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-blue-500 border border-blue-400 flex items-center justify-center text-[9px] font-bold text-white">
              P
            </div>
            <span className="font-medium text-foreground">Available Bay (Tap to Reserve)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-2.5 rounded bg-slate-400 border border-slate-500" />
            <span className="font-medium text-muted-foreground">Occupied Car</span>
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