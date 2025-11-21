"use client";

import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Line, Stars } from "@react-three/drei";
import { Mesh, Color, Vector3 } from "three";
import { Play, Pause } from "lucide-react";

/**
 * Simple helper: create list of satellites with varying radius, speed, color and inclination
 */
function generateSatellites(count = 6) {
  const out = [];
  const colors = [
    "#ff6b6b",
    "#f97316",
    "#f59e0b",
    "#06b6d4",
    "#60a5fa",
    "#a78bfa",
    "#34d399",
  ];
  for (let i = 0; i < count; i++) {
    out.push({
      id: `sat-${i}`,
      radius: 80 + i * 30,
      speed: 0.002 + (i * 0.0008),
      color: colors[i % colors.length],
      inclination: (i % 2 === 0 ? 10 : -12) + i * 5, // degrees
      phase: Math.random() * Math.PI * 2,
      size: 1.6 + (i % 3) * 0.7,
    });
  }
  return out;
}

/* Satellite object - animated via useFrame */
function Satellite({ sat, timeFactor }: { sat: any; timeFactor: number }) {
  const ref = useRef<Mesh | null>(null);
  const segments = 128;

  // Precompute trail points (a circular orbit in local coordinates)
  const trailPoints = useMemo(() => {
    const pts: Vector3[] = [];
    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const x = Math.cos(t) * sat.radius;
      const z = Math.sin(t) * sat.radius;
      const v = new Vector3(x, 0, z);
      v.applyAxisAngle(new Vector3(1, 0, 0), (sat.inclination * Math.PI) / 180);
      pts.push(v);
    }
    return pts;
  }, [sat.radius, sat.inclination]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * sat.speed * timeFactor + sat.phase;
    const x = Math.cos(t) * sat.radius;
    const z = Math.sin(t) * sat.radius;
    const pos = new Vector3(x, 0, z);
    pos.applyAxisAngle(new Vector3(1, 0, 0), (sat.inclination * Math.PI) / 180);
    if (ref.current) {
      ref.current.position.set(pos.x, pos.y, pos.z);
      ref.current.rotation.y = -t; // subtle rotation
    }
  });

  return (
    <group>
      {/* Trail (a thin line around the orbit) */}
      <Line
        points={trailPoints}
        color={sat.color}
        lineWidth={0.6}
        dashed={false}
        transparent
        opacity={0.18}
      />
      {/* Satellite core */}
      <mesh ref={ref}>
        <sphereGeometry args={[sat.size, 16, 16]} />
        <meshStandardMaterial emissive={new Color(sat.color)} emissiveIntensity={0.9} metalness={0.2} roughness={0.2} color={"#000000"} />
      </mesh>
      {/* A soft halo (fake glow) using a slightly larger transparent sphere */}
      <mesh position={[0, 0, 0]} scale={[1.6, 1.6, 1.6]}>
        <sphereGeometry args={[sat.size * 1.6, 16, 16]} />
        <meshBasicMaterial color={sat.color} transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

/* central planet with subtle atmosphere + ring */
function Planet() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[14, 64, 64]} />
        <meshStandardMaterial color={"#0ea5a4"} metalness={0.2} roughness={0.5} />
      </mesh>

      {/* atmosphere halo */}
      <mesh>
        <sphereGeometry args={[15.6, 32, 32]} />
        <meshBasicMaterial color={"#60a5fa"} transparent opacity={0.06} />
      </mesh>

      {/* faint ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[22, 45, 64]} />
        <meshBasicMaterial color={"#9ca3af"} transparent opacity={0.06} side={2} />
      </mesh>
    </group>
  );
}

/* Scene wrapper that sets up lighting and camera behavior */
function Scene({ satellites, playing, speed }: { satellites: any[]; playing: boolean; speed: number }) {
  // Slight scene rotation when playing
  const groupRef = useRef<any>(null);
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = playing ? t * 0.02 * speed : 0.0;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.45} />
      <directionalLight position={[50, 50, 25]} intensity={0.8} />
      <Planet />
      {satellites.map((s) => (
        <Satellite key={s.id} sat={s} timeFactor={playing ? 1 : 0.000001} />
      ))}
    </group>
  );
}

/* Canvas wrapper (keeps three code tidy) */
export default function OrbitVisualizer3D() {
  const sats = useMemo(() => generateSatellites(7), []);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1.0);

  return (
    <div className="rounded-xl border border-border bg-gradient-to-br from-card to-card/50 p-2 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="text-xl">🛰️</div>
          <div>
            <div className="font-semibold text-card-foreground">Orbit Visualizer</div>
            <div className="text-xs text-muted-foreground">Interactive 3D view — drag to rotate, scroll to zoom</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaying((p) => !p)}
            className="flex items-center gap-2 rounded-md px-3 py-1 bg-primary/10 border border-primary/30 hover:bg-primary/20 transition"
            title={playing ? "Pause animation" : "Play animation"}
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-xs text-muted-foreground">{playing ? "Pause" : "Play"}</span>
          </button>
        </div>
      </div>

      <div style={{ height: 360 }} className="rounded-b-xl overflow-hidden">
        <Canvas camera={{ position: [0, 80, 150], fov: 35 }}>
          {/* space stars in the background */}
          <color attach="background" args={["#071025"]} />
          <Stars radius={300} depth={60} count={4000} factor={4} saturation={0.2} fade speed={1} />
          <Scene satellites={sats} playing={playing} speed={speed} />
          <OrbitControls enablePan={true} enableRotate={true} enableZoom={true} />
        </Canvas>
      </div>

      <div className="px-4 py-3 flex items-center gap-3">
        <label className="text-xs text-muted-foreground">Speed</label>
        <input
          type="range"
          min="0.2"
          max="2.5"
          step="0.05"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-muted-foreground w-12 text-right">{speed.toFixed(2)}x</div>
      </div>
    </div>
  );
}
