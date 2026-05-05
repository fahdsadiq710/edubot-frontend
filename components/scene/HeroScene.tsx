'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial, Sphere, Ring, Float } from '@react-three/drei';
import * as THREE from 'three';

/* ── Floating AI "Brain" core orb ──────────────────────────── */
function CoreOrb({ scrollY }: { scrollY: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    // Gentle idle rotation
    meshRef.current.rotation.x = t * 0.12;
    meshRef.current.rotation.y = t * 0.18;
    // Scroll: drift upward and shrink slightly
    const s = scrollY.current;
    meshRef.current.position.y = -s * 0.003;
    meshRef.current.scale.setScalar(1 - s * 0.0005);
  });

  return (
    <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[1.4, 64, 64]}>
        <MeshDistortMaterial
          color="#6366f1"
          attach="material"
          distort={0.45}
          speed={2.2}
          roughness={0}
          metalness={0.3}
          transparent
          opacity={0.9}
        />
      </Sphere>
    </Float>
  );
}

/* ── Orbiting rings ─────────────────────────────────────────── */
function OrbitRing({ radius, tilt, speed, color }: {
  radius: number;
  tilt: number;
  speed: number;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * speed;
  });
  return (
    <Ring ref={ref} args={[radius, radius + 0.018, 120]} rotation={[tilt, 0, 0]}>
      <meshBasicMaterial color={color} transparent opacity={0.55} side={THREE.DoubleSide} />
    </Ring>
  );
}

/* ── Scattered particles ─────────────────────────────────────── */
function Particles() {
  const count = 200;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color="#a5b4fc" size={0.025} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

/* ── Inner glow sphere ──────────────────────────────────────── */
function GlowSphere() {
  return (
    <Sphere args={[1.8, 32, 32]}>
      <meshBasicMaterial color="#6366f1" transparent opacity={0.06} side={THREE.BackSide} />
    </Sphere>
  );
}

/* ── Scene wrapper ──────────────────────────────────────────── */
function Scene({ scrollY }: { scrollY: React.MutableRefObject<number> }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]}   intensity={2}   color="#818cf8" />
      <pointLight position={[-5, -3, 3]} intensity={1.5} color="#c084fc" />
      <pointLight position={[0, -5, 2]}  intensity={1}   color="#38bdf8" />
      <GlowSphere />
      <CoreOrb scrollY={scrollY} />
      <OrbitRing radius={2.2} tilt={Math.PI / 4}   speed={0.4}  color="#818cf8" />
      <OrbitRing radius={2.8} tilt={-Math.PI / 6}  speed={-0.25} color="#c084fc" />
      <OrbitRing radius={3.4} tilt={Math.PI / 2.5} speed={0.18} color="#38bdf8" />
      <Particles />
    </>
  );
}

/* ── Exported canvas ────────────────────────────────────────── */
export default function HeroScene({ scrollY }: { scrollY: React.MutableRefObject<number> }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <Scene scrollY={scrollY} />
      </Suspense>
    </Canvas>
  );
}
