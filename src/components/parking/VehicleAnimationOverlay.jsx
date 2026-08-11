import React, { useEffect, useRef } from "react";
import { VEHICLE_PHASES } from "@/hooks/useVehicleSimulation";

/**
 * 2D Top-Down Vehicle Animation Overlay.
 * Rendered with `pointer-events: none` directly over the parking map layout.
 */
export default function VehicleAnimationOverlay({ vehicles = [] }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;

    const render = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Handle DPI scaling for ultra crisp rendering
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Render each vehicle
      vehicles.forEach((vehicle) => {
        const pixelX = vehicle.x * width;
        const pixelY = vehicle.y * height;

        const carWidth = Math.max(38, width * 0.052);
        const carHeight = carWidth * 0.52;

        ctx.save();
        ctx.translate(pixelX, pixelY);
        ctx.rotate(vehicle.angle);

        // 1. Vehicle Drop Shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.roundRect(-carWidth / 2 + 3, -carHeight / 2 + 4, carWidth, carHeight, 5);
        ctx.fill();

        // 2. Headlight Beams (Glowing Cones Forward)
        if (vehicle.phase !== VEHICLE_PHASES.PARKED) {
          const lightGrad = ctx.createRadialGradient(
            carWidth / 2 + 10,
            0,
            2,
            carWidth / 2 + 25,
            0,
            35
          );
          lightGrad.addColorStop(0, "rgba(254, 240, 138, 0.45)");
          lightGrad.addColorStop(1, "rgba(254, 240, 138, 0)");

          ctx.fillStyle = lightGrad;
          ctx.beginPath();
          ctx.moveTo(carWidth / 2, -carHeight / 3);
          ctx.lineTo(carWidth / 2 + 38, -carHeight * 0.9);
          ctx.lineTo(carWidth / 2 + 38, carHeight * 0.9);
          ctx.lineTo(carWidth / 2, carHeight / 3);
          ctx.closePath();
          ctx.fill();
        }

        // 3. Vehicle Body Shell (Classic 2D Racing Game Top-Down Style)
        ctx.fillStyle = vehicle.color || "#ef4444";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.roundRect(-carWidth / 2, -carHeight / 2, carWidth, carHeight, 6);
        ctx.fill();
        ctx.stroke();

        // 4. Dark Windshield & Rear Window Glass
        ctx.fillStyle = "#0f172a";
        // Front windshield
        ctx.fillRect(carWidth * 0.05, -carHeight * 0.38, carWidth * 0.22, carHeight * 0.76);
        // Rear windshield
        ctx.fillRect(-carWidth * 0.32, -carHeight * 0.34, carWidth * 0.18, carHeight * 0.68);
        // Roof highlight lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(-carWidth * 0.12, -carHeight * 0.32, carWidth * 0.18, carHeight * 0.64);

        // 5. Side Mirrors
        ctx.fillStyle = vehicle.color || "#ef4444";
        ctx.fillRect(carWidth * 0.1, -carHeight / 2 - 2, 4, 3);
        ctx.fillRect(carWidth * 0.1, carHeight / 2 - 1, 4, 3);

        // 6. Red Brake Lights (Glowing when Braking or Parked)
        if (vehicle.isBraking || vehicle.phase === VEHICLE_PHASES.PARKED) {
          ctx.fillStyle = "#ff003c";
          ctx.shadowColor = "#ff003c";
          ctx.shadowBlur = 10;
          ctx.fillRect(-carWidth / 2 - 1, -carHeight / 2 + 2, 3, carHeight * 0.3);
          ctx.fillRect(-carWidth / 2 - 1, carHeight / 2 - carHeight * 0.3 - 2, 3, carHeight * 0.3);
          ctx.shadowBlur = 0; // Reset
        }

        // 7. White Reverse Lights (Glowing when Reversing Out)
        if (vehicle.isReversing) {
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur = 8;
          ctx.fillRect(-carWidth / 2 - 1, -carHeight * 0.18, 3, carHeight * 0.36);
          ctx.shadowBlur = 0; // Reset
        }

        ctx.restore();
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [vehicles]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block pointer-events-none" />
    </div>
  );
}
