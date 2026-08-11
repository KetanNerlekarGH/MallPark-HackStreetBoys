import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Float, Text, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { Store, Compass, Info, Building, Camera, Sun, Moon, MapPin, Zap, Car, Sparkles, Navigation, Layers, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Animated Store Pin Node in 3D Space with hover HTML Tooltip
 */
function StoreNodePin({ store, isFloorVisible, onSelectStore, selectedStore }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.8;
    }
  });

  if (!isFloorVisible) return null;

  const isSelected = selectedStore?.id === store.id;

  return (
    <group position={store.position}>
      {/* Floating 3D Marker Gem */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelectStore(store);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <octahedronGeometry args={[hovered || isSelected ? 0.45 : 0.35, 0]} />
        <meshStandardMaterial
          color={store.color || "#3b82f6"}
          emissive={hovered || isSelected ? store.color || "#3b82f6" : "#000000"}
          emissiveIntensity={hovered || isSelected ? 0.6 : 0}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>

      {/* Vertical Pin Support Line */}
      <line>
        <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.4, 0)])} />
        <lineBasicMaterial attach="material" color={store.color || "#3b82f6"} linewidth={2} />
      </line>

      {/* HTML Annotation Label on Hover or Select */}
      {(hovered || isSelected) && (
        <Html position={[0, 0.6, 0]} center distanceFactor={15}>
          <div className="bg-popover/95 text-popover-foreground border border-border px-2.5 py-1.5 rounded-lg shadow-xl text-xs font-semibold whitespace-nowrap backdrop-blur-sm pointer-events-none flex items-center gap-1.5 animate-in fade-in zoom-in-95">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: store.color || "#3b82f6" }} />
            <div>
              <div className="font-bold">{store.name}</div>
              <div className="text-[10px] text-muted-foreground font-normal">{store.category} • Zone {store.zone}</div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

/**
 * 1. Phoenix Marketcity Parametric 3D Layout
 */
function PhoenixLayoutMesh({ mall, activeFloor }) {
  return (
    <group>
      {mall.floors.map((fl) => {
        const elevation = fl.elevation;
        const isSelectedFloor = activeFloor === fl.id;
        const isAllFloors = activeFloor === "all";

        let opacity = 1.0;

        if (!isAllFloors) {
          const selectedElev = mall.floors.find((f) => f.id === activeFloor)?.elevation || 0;
          if (elevation > selectedElev) {
            opacity = 0.15;
          } else if (elevation < selectedElev) {
            opacity = 0.4;
          }
        }

        const slabMat = new THREE.MeshStandardMaterial({
          color: isSelectedFloor ? "#38bdf8" : "#334155",
          roughness: 0.4,
          metalness: 0.3,
          transparent: true,
          opacity: opacity,
        });

        const accentMat = new THREE.MeshStandardMaterial({
          color: isSelectedFloor ? "#f59e0b" : "#475569",
          roughness: 0.3,
          metalness: 0.6,
          transparent: true,
          opacity: opacity,
        });

        const glassMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.3 * opacity,
          roughness: 0.1,
        });

        return (
          <group key={fl.id} position={[0, elevation, 0]}>
            <mesh position={[0, 0, 0]} receiveShadow castShadow>
              <boxGeometry args={[12, 0.25, 14]} />
              <primitive object={slabMat} attach="material" />
            </mesh>

            <mesh position={[-9, 0, 0]} receiveShadow castShadow>
              <boxGeometry args={[6, 0.25, 10]} />
              <primitive object={slabMat} attach="material" />
            </mesh>

            <mesh position={[9, 0, 0]} receiveShadow castShadow>
              <boxGeometry args={[6, 0.25, 10]} />
              <primitive object={slabMat} attach="material" />
            </mesh>

            <mesh position={[0, 0.2, 6.9]}>
              <boxGeometry args={[11.8, 0.3, 0.1]} />
              <primitive object={accentMat} attach="material" />
            </mesh>
            <mesh position={[0, 0.2, -6.9]}>
              <boxGeometry args={[11.8, 0.3, 0.1]} />
              <primitive object={accentMat} attach="material" />
            </mesh>

            {[-5, 5].map((x) =>
              [-5, 5].map((z) => (
                <mesh key={`${x}-${z}`} position={[x, -1.6, z]}>
                  <cylinderGeometry args={[0.3, 0.3, 3.2, 12]} />
                  <primitive object={accentMat} attach="material" />
                </mesh>
              ))
            )}

            {fl.id === "3" && (
              <group position={[0, 3.5, 0]}>
                <mesh>
                  <cylinderGeometry args={[4.5, 4.5, 12, 16, 1, false, 0, Math.PI]} rotation={[Math.PI / 2, 0, Math.PI / 2]} />
                  <primitive object={glassMat} attach="material" />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}

/**
 * 2. Pavilion Mall Parametric 3D Layout
 */
function PavilionLayoutMesh({ mall, activeFloor }) {
  return (
    <group>
      {mall.floors.map((fl) => {
        const elevation = fl.elevation;
        const isSelectedFloor = activeFloor === fl.id;
        const isAllFloors = activeFloor === "all";

        let opacity = 1.0;

        if (!isAllFloors) {
          const selectedElev = mall.floors.find((f) => f.id === activeFloor)?.elevation || 0;
          if (elevation > selectedElev) {
            opacity = 0.15;
          } else if (elevation < selectedElev) {
            opacity = 0.4;
          }
        }

        const slabMat = new THREE.MeshStandardMaterial({
          color: isSelectedFloor ? "#c084fc" : "#1e1b4b",
          roughness: 0.3,
          metalness: 0.4,
          transparent: true,
          opacity: opacity,
        });

        const ringMat = new THREE.MeshStandardMaterial({
          color: "#06b6d4",
          roughness: 0.2,
          metalness: 0.8,
          transparent: true,
          opacity: opacity,
        });

        return (
          <group key={fl.id} position={[0, elevation, 0]}>
            <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
              <ringGeometry args={[4.2, 9.5, 32]} />
              <primitive object={slabMat} attach="material" />
            </mesh>

            <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[4.2, 4.35, 32]} />
              <primitive object={ringMat} attach="material" />
            </mesh>

            {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
              <mesh key={idx} position={[5.5 * Math.cos(angle), -1.6, 5.5 * Math.sin(angle)]}>
                <cylinderGeometry args={[0.25, 0.25, 3.2, 12]} />
                <primitive object={ringMat} attach="material" />
              </mesh>
            ))}

            {fl.id === "2" && (
              <group position={[0, 3.5, 0]}>
                <mesh>
                  <sphereGeometry args={[4.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                  <meshStandardMaterial color="#38bdf8" transparent opacity={0.35 * opacity} roughness={0.1} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}

/**
 * 3. Amanora Mall Parametric 3D Layout
 */
function AmanoraLayoutMesh({ mall, activeFloor }) {
  return (
    <group>
      {mall.floors.map((fl) => {
        const elevation = fl.elevation;
        const isSelectedFloor = activeFloor === fl.id;
        const isAllFloors = activeFloor === "all";

        let opacity = 1.0;

        if (!isAllFloors) {
          const selectedElev = mall.floors.find((f) => f.id === activeFloor)?.elevation || 0;
          if (elevation > selectedElev) {
            opacity = 0.15;
          } else if (elevation < selectedElev) {
            opacity = 0.4;
          }
        }

        const blockMat = new THREE.MeshStandardMaterial({
          color: isSelectedFloor ? "#fb923c" : "#292524",
          roughness: 0.5,
          metalness: 0.2,
          transparent: true,
          opacity: opacity,
        });

        const accentMat = new THREE.MeshStandardMaterial({
          color: "#f43f5e",
          roughness: 0.3,
          metalness: 0.6,
          transparent: true,
          opacity: opacity,
        });

        return (
          <group key={fl.id} position={[0, elevation, 0]}>
            <mesh position={[-7, 0, 0]} receiveShadow castShadow>
              <boxGeometry args={[7, 0.3, 14]} />
              <primitive object={blockMat} attach="material" />
            </mesh>

            <mesh position={[7, 0, 0]} receiveShadow castShadow>
              <boxGeometry args={[7, 0.3, 14]} />
              <primitive object={blockMat} attach="material" />
            </mesh>

            {fl.id === "1" && (
              <mesh position={[0, 0, 1]} receiveShadow castShadow>
                <boxGeometry args={[7, 0.3, 4]} />
                <primitive object={accentMat} attach="material" />
              </mesh>
            )}

            {fl.id === "G" && (
              <group position={[0, 0.05, 4]}>
                <mesh receiveShadow>
                  <boxGeometry args={[6.5, 0.1, 7]} />
                  <meshStandardMaterial color="#15803d" roughness={0.8} />
                </mesh>
                <mesh position={[0, 0.1, 0]}>
                  <cylinderGeometry args={[1.5, 1.5, 0.2, 24]} />
                  <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.1} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
}

export default function Mall3DViewer({ selectedMall, activeFloor, onSelectStore, selectedStore }) {
  const [viewMode, setViewMode] = useState("outside"); // "outside" | "3d"
  const [isNightMode, setIsNightMode] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Interactive 3D Depth Mouse Parallax Effect for Outside View
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Exterior Hotspots mapped over actual mall photo
  const HOTSPOTS = [
    {
      id: "gate-a",
      title: "P1 Multi-Level Parking Gate A",
      icon: Car,
      x: "18%",
      y: "75%",
      color: "bg-emerald-500",
      desc: "Direct access to Level 1, 2 & 3 automated parking bays with sensor guidance.",
    },
    {
      id: "ev-plaza",
      title: "Solar EV Rapid Charging Hub",
      icon: Zap,
      x: "78%",
      y: "78%",
      color: "bg-sky-500",
      desc: "24 Fast DC charging bays powered by rooftop solar infrastructure.",
    },
    {
      id: "main-entry",
      title: "Grand Atrium Retail Entry",
      icon: Building,
      x: "48%",
      y: "48%",
      color: "bg-purple-500",
      desc: "Main pedestrian entrance leading to flagship retail brands & central concourse.",
    },
    {
      id: "cinema-roof",
      title: "Multiplex & Food Capital Dome",
      icon: Sparkles,
      x: "62%",
      y: "22%",
      color: "bg-amber-500",
      desc: "Top floor 9-screen IMAX cinema and open-air rooftop dining deck.",
    },
  ];

  const mallImage = selectedMall?.image || "/malls/phoenix-pune.png";

  return (
    <div className="w-full rounded-3xl overflow-hidden bg-[#06040a] border border-border/80 dark:border-purple-900/40 relative shadow-2xl font-mono">
      {/* Top Viewport Header Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-border/80 dark:border-purple-900/40 bg-card/90 dark:bg-[#0c071a]/90 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-purple-400" />
            <p className="text-xs font-mono font-semibold tracking-widest uppercase text-purple-400">
              {viewMode === "outside" ? "Actual Mall Exterior Interactive Viewport" : "Parametric 3D Structural Model"}
            </p>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground dark:text-white mt-0.5">
            {selectedMall.name} ({selectedMall.location || selectedMall.city})
          </h3>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-full bg-slate-200 dark:bg-[#0a0518] border border-border dark:border-purple-900/40">
            <Button
              variant={viewMode === "outside" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("outside")}
              className={`rounded-full text-xs font-semibold h-8 px-3.5 transition-all ${
                viewMode === "outside"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  : "text-muted-foreground hover:text-foreground dark:text-purple-300"
              }`}
            >
              <Camera className="w-3.5 h-3.5 mr-1.5 text-purple-300" />
              Outside View (Actual)
            </Button>
            <Button
              variant={viewMode === "3d" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("3d")}
              className={`rounded-full text-xs font-semibold h-8 px-3.5 transition-all ${
                viewMode === "3d"
                  ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  : "text-muted-foreground hover:text-foreground dark:text-purple-300"
              }`}
            >
              <Compass className="w-3.5 h-3.5 mr-1.5" />
              3D Structural Model
            </Button>
          </div>

          {viewMode === "outside" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNightMode((n) => !n)}
              className="rounded-full text-xs font-semibold h-8 px-3 bg-card border-border dark:bg-[#0f0a21] dark:border-purple-900/40 dark:text-purple-200"
            >
              {isNightMode ? <Moon className="w-3.5 h-3.5 mr-1 text-purple-400" /> : <Sun className="w-3.5 h-3.5 mr-1 text-amber-400" />}
              {isNightMode ? "Night View" : "Daylight View"}
            </Button>
          )}
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative w-full h-[520px] sm:h-[600px] overflow-hidden bg-slate-950">
        {viewMode === "outside" ? (
          /* OUTSIDE VIEWPORT: Interactive 3D Depth Parallax & Hotspots */
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center"
          >
            {/* Ambient Background Glow */}
            <div
              className={`absolute inset-0 transition-opacity duration-700 ${
                isNightMode ? "opacity-90 bg-gradient-to-b from-[#070314] via-[#09051b] to-[#04010a]" : "opacity-40 bg-slate-800"
              }`}
            />

            {/* Interactive 3D Parallax Image Container */}
            <motion.div
              animate={{
                rotateX: mousePos.y,
                rotateY: mousePos.x,
                scale: 1.05,
              }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className="relative w-full h-full flex items-center justify-center p-4"
              style={{ perspective: 1000 }}
            >
              <img
                src={mallImage}
                alt={selectedMall.name}
                className={`w-full h-full object-cover rounded-2xl shadow-2xl transition-all duration-700 filter ${
                  isNightMode
                    ? "brightness-90 contrast-110 saturate-120 drop-shadow-[0_0_40px_rgba(168,85,247,0.3)]"
                    : "brightness-105 contrast-100"
                }`}
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?auto=format&fit=crop&w=1400&q=80";
                }}
              />

              {/* Night Neon Lighting Ray Grid */}
              {isNightMode && (
                <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-t from-purple-950/40 via-transparent to-indigo-950/30 border border-purple-500/30" />
              )}

              {/* Interactive Hotspot Nodes overlaid on Mall Exterior */}
              {HOTSPOTS.map((hs) => {
                const Icon = hs.icon;
                const isSelected = selectedHotspot?.id === hs.id;
                return (
                  <div
                    key={hs.id}
                    style={{ left: hs.x, top: hs.y }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                  >
                    <button
                      onClick={() => setSelectedHotspot(isSelected ? null : hs)}
                      className={`relative group p-2.5 rounded-full border shadow-2xl transition-all duration-300 transform hover:scale-125 ${
                        isSelected
                          ? "bg-white text-slate-950 border-white ring-4 ring-purple-500/50 scale-125 shadow-[0_0_25px_rgba(255,255,255,0.8)]"
                          : `${hs.color} text-white border-white/60 hover:ring-4 hover:ring-white/40 shadow-[0_0_15px_rgba(0,0,0,0.5)]`
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    </button>
                  </div>
                );
              })}
            </motion.div>

            {/* Hotspot Inspection Card Overlay */}
            <AnimatePresence>
              {selectedHotspot && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-md z-40 p-5 rounded-2xl bg-card/95 dark:bg-[#0c071a]/95 border border-purple-500/40 shadow-[0_0_35px_rgba(168,85,247,0.3)] backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300">
                        <selectedHotspot.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-foreground dark:text-white">
                          {selectedHotspot.title}
                        </h4>
                        <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                          Verified Entrance Landmark
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedHotspot(null)}
                      className="text-xs text-muted-foreground hover:text-white p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground dark:text-purple-200/80 mt-3 leading-relaxed">
                    {selectedHotspot.desc}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Overlay Info Badge */}
            <div className="absolute bottom-4 left-4 z-20 p-3 rounded-2xl bg-card/90 dark:bg-[#0a0518]/90 backdrop-blur-xl border border-border/80 dark:border-purple-900/40 shadow-xl flex items-center gap-3 text-xs text-foreground dark:text-purple-200">
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin-slow" />
              <span>Interactive 3D Tilt Viewport • Move mouse to inspect mall exterior facade</span>
            </div>
          </div>
        ) : (
          /* 3D STRUCTURAL MODEL CANVAS */
          <Canvas
            camera={{ position: [18, 16, 22], fov: 42 }}
            shadows
            gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight
              position={[20, 30, 15]}
              intensity={1.4}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={60}
              shadow-camera-left={-20}
              shadow-camera-right={20}
              shadow-camera-top={20}
              shadow-camera-bottom={-20}
            />
            <pointLight position={[-15, 20, -15]} intensity={0.6} color={selectedMall.theme?.accentMesh || "#0284c7"} />

            <OrbitControls
              enableDamping
              dampingFactor={0.05}
              maxPolarAngle={Math.PI / 2.1}
              minDistance={10}
              maxDistance={45}
            />

            <ContactShadows position={[0, -0.2, 0]} opacity={0.6} scale={40} blur={2.5} far={10} />

            {selectedMall.id === "phoenix" && <PhoenixLayoutMesh mall={selectedMall} activeFloor={activeFloor} />}
            {selectedMall.id === "pavilion" && <PavilionLayoutMesh mall={selectedMall} activeFloor={activeFloor} />}
            {selectedMall.id === "amanora" && <AmanoraLayoutMesh mall={selectedMall} activeFloor={activeFloor} />}

            {selectedMall.stores.map((store) => {
              const isFloorVisible = activeFloor === "all" || activeFloor === store.floor;
              return (
                <StoreNodePin
                  key={store.id}
                  store={store}
                  isFloorVisible={isFloorVisible}
                  onSelectStore={onSelectStore}
                  selectedStore={selectedStore}
                />
              );
            })}
          </Canvas>
        )}
      </div>
    </div>
  );
}
