'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, OrbitControls, PerspectiveCamera, Text3D, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// 3D Microphone component
function Microphone({ position, rotation, scale = 1 }: { position: [number, number, number]; rotation?: [number, number, number]; scale?: number }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={meshRef} position={position} rotation={rotation} scale={scale}>
        {/* Mic stand */}
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 0.8]} />
          <meshStandardMaterial color="#2E8C96" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Mic head */}
        <mesh position={[0, 0.45, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
          <meshStandardMaterial color="#1F2D3A" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Mic grill */}
        <mesh position={[0, 0.52, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#4A5568" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

// 3D People/Attendees (simplified as abstract figures)
function Attendee({ position, color }: { position: [number, number, number]; color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2 + position[0]) * 0.15;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.2;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
      <group ref={groupRef} position={position}>
        {/* Head */}
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Body */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.12, 0.25, 0.08]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* Arms (socializing pose) */}
        <mesh position={[-0.1, 0.15, 0]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.04, 0.15, 0.04]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0.1, 0.15, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.04, 0.15, 0.04]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    </Float>
  );
}

// 3D Stage/Platform
function Stage({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <boxGeometry args={[2, 0.1, 1.5]} />
      <meshStandardMaterial color="#2A7A84" metalness={0.3} roughness={0.7} />
    </mesh>
  );
}

// 3D Speaker/Sound wave
function SoundWave({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      meshRef.current.scale.z = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[0.3, 0.02, 16, 32]} />
      <meshStandardMaterial color="#2E8C96" transparent opacity={0.6} />
    </mesh>
  );
}

// Main 3D Scene
function EventScene() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.15;
    }
  });

  const attendees = useMemo(() => [
    { pos: [-0.8, 0, -0.5] as [number, number, number], color: '#2E8C96' },
    { pos: [0.8, 0, -0.5] as [number, number, number], color: '#2A7A84' },
    { pos: [-0.4, 0, 0.5] as [number, number, number], color: '#30a46c' },
    { pos: [0.4, 0, 0.5] as [number, number, number], color: '#2E8C96' },
  ], []);

  return (
    <group ref={groupRef}>
      {/* Stage */}
      <Stage position={[0, -0.2, 0]} />
      
      {/* Microphones on stage */}
      <Microphone position={[-0.3, 0.1, 0]} rotation={[0, 0.2, 0]} scale={0.8} />
      <Microphone position={[0.3, 0.1, 0]} rotation={[0, -0.2, 0]} scale={0.8} />
      
      {/* Sound waves */}
      <SoundWave position={[-0.3, 0.3, 0]} />
      <SoundWave position={[0.3, 0.3, 0]} />
      
      {/* Attendees/People socializing */}
      {attendees.map((attendee, i) => (
        <Attendee key={i} position={attendee.pos} color={attendee.color} />
      ))}
      
      {/* Ambient particles/confetti effect */}
      {Array.from({ length: 15 }).map((_, i) => {
        const angle = (i / 15) * Math.PI * 2;
        const radius = 1.5;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(i * 0.5) * 0.5 + 0.8,
              Math.sin(angle) * radius,
            ]}
          >
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshStandardMaterial
              color={['#2E8C96', '#2A7A84', '#30a46c'][i % 3]}
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function Hero3DScene() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 1.5, 4], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        <PerspectiveCamera makeDefault position={[0, 1.5, 4]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, 3, -5]} intensity={0.5} color="#2E8C96" />
        <pointLight position={[5, 3, -5]} intensity={0.5} color="#2A7A84" />
        <EventScene />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
    </div>
  );
}
