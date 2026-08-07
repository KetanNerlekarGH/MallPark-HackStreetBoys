import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Float, Text, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { Store, Compass, Info, Building } from "lucide-react";

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
 * 1. Phoenix Marketcity Parametric 3D Layout (Spacious Rectangular Multi-Wing)
 */
function PhoenixLayoutMesh({ mall, activeFloor }) {
  return (
    <group>
      {mall.floors.map((fl) => {
        const elevation = fl.elevation;
        const isSelectedFloor = activeFloor === fl.id;
        const isAllFloors = activeFloor === "all";

        // Hide upper floors if a specific lower floor is isolated
        let opacity = 1.0;
        let visible = true;

        if (!isAllFloors) {
          const selectedElev = mall.floors.find((f) => f.id === activeFloor)?.elevation || 0;
          if (elevation > selectedElev) {
            opacity = 0.15; // Semi-transparent upper floors
          } else if (elevation < selectedElev) {
            opacity = 0.4; // Faded lower floors
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
            {/* Main Central Atrium Floor Plate */}
            <mesh position={[0, 0, 0]} receiveShadow castShadow>
              <boxGeometry args={[12, 0.25, 14]} />
              <primitive object={slabMat} attach="material" />
            </mesh>

            {/* North Wing Floor Extension */}
            <mesh position={[-9, 0, 0]} receiveShadow castShadow>
              <boxGeometry args={[6, 0.25, 10]} />
              <primitive object={slabMat} attach="material" />
            </mesh>

            {/* South Wing Floor Extension */}
            <mesh position={[9, 0, 0]} receiveShadow castShadow>
              <boxGeometry args={[6, 0.25, 10]} />
              <primitive object={slabMat} attach="material" />
            </mesh>

            {/* Balcony Railings & Accent Edges */}
            <mesh position={[0, 0.2, 6.9]}>
              <boxGeometry args={[11.8, 0.3, 0.1]} />
              <primitive object={accentMat} attach="material" />
            </mesh>
            <mesh position={[0, 0.2, -6.9]}>
              <boxGeometry args={[11.8, 0.3, 0.1]} />
              <primitive object={accentMat} attach="material" />
            </mesh>

            {/* Structural Pillars */}
            {[-5, 5].map((x) =>
              [-5, 5].map((z) => (
                <mesh key={`${x}-${z}`} position={[x, -1.6, z]}>
                  <cylinderGeometry args={[0.3, 0.3, 3.2, 12]} />
                  <primitive object={accentMat} attach="material" />
                </mesh>
              ))
            )}

            {/* Top Floor Skylight Roof Vault */}
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
 * 2. Pavilion Mall Parametric 3D Layout (Circular / Oval Atrium)
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
            {/* Outer Circular Ring Slab */}
            <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow castShadow>
              <ringGeometry args={[4.2, 9.5, 32]} />
              <primitive object={slabMat} attach="material" />
            </mesh>

            {/* Atrium Glass Balcony Railing Ring */}
            <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[4.2, 4.35, 32]} />
              <primitive object={ringMat} attach="material" />
            </mesh>

            {/* Perpendicular Atrium Pillars */}
            {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, idx) => (
              <mesh key={idx} position={[5.5 * Math.cos(angle), -1.6, 5.5 * Math.sin(angle)]}>
                <cylinderGeometry args={[0.25, 0.25, 3.2, 12]} />
                <primitive object={ringMat} attach="material" />
              </mesh>
            ))}

            {/* Top Floor Skylight Dome */}
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
 * 3. Amanora Mall Parametric 3D Layout (Open-Concept Horseshoe Multi-Block Plaza)
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
            {/* West Block Wing */}
            <mesh position={[-7, 0, 0]} receiveShadow castShadow>
              <boxGeometry args={[7, 0.3, 14]} />
              <primitive object={blockMat} attach="material" />
            </mesh>

            {/* East Block Wing */}
            <mesh position={[7, 0, 0]} receiveShadow castShadow>
              <boxGeometry args={[7, 0.3, 14]} />
              <primitive object={blockMat} attach="material" />
            </mesh>

            {/* Connecting Skybridge at Level 1 */}
            {fl.id === "1" && (
              <mesh position={[0, 0, 1]} receiveShadow castShadow>
                <boxGeometry args={[7, 0.3, 4]} />
                <primitive object={accentMat} attach="material" />
              </mesh>
            )}

            {/* Plaza Central Landscape Court (Ground Floor Only) */}
            {fl.id === "G" && (
              <group position={[0, 0.05, 4]}>
                <mesh receiveShadow>
                  <boxGeometry args={[6.5, 0.1, 7]} />
                  <meshStandardMaterial color="#15803d" roughness={0.8} />
                </mesh>
                {/* Central Fountain Ring */}
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
  return (
    <div className="w-full h-[520px] sm:h-[600px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-border relative shadow-2xl">
      {/* R3F Canvas Container */}
      <Canvas
        camera={{ position: [18, 16, 22], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
      >
        {/* Lights Setup */}
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
        <pointLight position={[-15, 20, -15]} intensity={0.6} color={selectedMall.theme.accentMesh} />

        {/* Orbit Controls with Smooth Damping */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.1}
          minDistance={10}
          maxDistance={45}
        />

        {/* Ground Floor Base Shadow Grid */}
        <ContactShadows position={[0, -0.2, 0]} opacity={0.6} scale={40} blur={2.5} far={10} />

        {/* Mall Specific 3D Layout Geometries */}
        {selectedMall.id === "phoenix" && <PhoenixLayoutMesh mall={selectedMall} activeFloor={activeFloor} />}
        {selectedMall.id === "pavilion" && <PavilionLayoutMesh mall={selectedMall} activeFloor={activeFloor} />}
        {selectedMall.id === "amanora" && <AmanoraLayoutMesh mall={selectedMall} activeFloor={activeFloor} />}

        {/* Interactive Store Pins */}
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

      {/* Overlay Compass Badge */}
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md border border-border/80 px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2 text-xs font-semibold text-foreground">
        <Compass className="w-4 h-4 text-primary animate-spin-slow" />
        <span>3D Interactive Viewport</span>
      </div>
    </div>
  );
}
