"use client";

import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

interface Point {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  initialPosition: THREE.Vector3;
}

interface NetworkProps {
  mouse: React.MutableRefObject<[number, number]>;
  scrollY: React.MutableRefObject<number>;
}

function Network({ mouse, scrollY }: NetworkProps) {
  const { viewport } = useThree();
  const points = useRef<Point[]>([]);
  const linesMesh = useRef<THREE.LineSegments>(null!);
  const { resolvedTheme } = useTheme();
  const time = useRef(0);

  // Initialize more points in a wider distribution
  useMemo(() => {
    const count = 150; // Increased point count
    points.current = Array.from({ length: count }, (_, i) => {
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const radius = 20 + Math.random() * 10; // Wider distribution
      
      const initialPosition = new THREE.Vector3(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(theta)
      );

      return {
        position: initialPosition.clone(),
        initialPosition: initialPosition.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.03, // Increased velocity
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03
        ),
      };
    });
  }, []);

  useFrame((state) => {
    time.current += 0.002; // Faster movement
    const positions: number[] = [];
    const colors: number[] = [];
    
    // Much brighter colors, especially for light mode
    const baseColor1 = resolvedTheme === 'dark' ? '#5244e1' : '#4133b7';
    const baseColor2 = resolvedTheme === 'dark' ? '#b06ab3' : '#8351a8';
    
    const color1 = new THREE.Color(baseColor1).multiplyScalar(2.5); // Much brighter
    const color2 = new THREE.Color(baseColor2).multiplyScalar(2.5); // Much brighter

    // Update points with more dynamic movement
    points.current.forEach((point, i) => {
      const timeOffset = time.current + i * 0.1;
      
      // More pronounced movement
      const xMovement = Math.sin(timeOffset * 0.7) * Math.cos(timeOffset * 0.4) * 3;
      const yMovement = Math.cos(timeOffset * 0.6) * Math.sin(timeOffset * 0.3) * 3;
      const zMovement = Math.sin(timeOffset * 0.5) * Math.cos(timeOffset * 0.5) * 3;

      point.position.x = point.initialPosition.x + xMovement;
      point.position.y = point.initialPosition.y + yMovement;
      point.position.z = point.initialPosition.z + zMovement;

      // More responsive mouse influence
      const mouseInfluence = new THREE.Vector3(
        (mouse.current[0] * viewport.width) * 3,
        (mouse.current[1] * viewport.height) * 3,
        0
      );
      point.position.lerp(mouseInfluence, 0.03);

      // Enhanced scroll effect
      point.position.y -= scrollY.current * 0.0003;
      point.position.z += Math.sin(scrollY.current * 0.0002) * 1;
    });

    // Create lines with dynamic connections
    points.current.forEach((pointA, i) => {
      points.current.forEach((pointB, j) => {
        if (i < j) {
          const distance = pointA.position.distanceTo(pointB.position);
          const maxDistance = 6 + Math.sin(time.current + i * 0.2) * 2; // More dynamic connections
          
          if (distance < maxDistance) {
            positions.push(
              pointA.position.x, pointA.position.y, pointA.position.z,
              pointB.position.x, pointB.position.y, pointB.position.z
            );

            // Enhanced color mixing with stronger alpha
            const alpha = Math.pow(1 - (distance / maxDistance), 2); // Sharper transition
            const mixedColor = color1.clone().lerp(color2, alpha);
            colors.push(
              mixedColor.r, mixedColor.g, mixedColor.b,
              mixedColor.r, mixedColor.g, mixedColor.b
            );
          }
        }
      });
    });

    // Update geometry
    if (linesMesh.current && linesMesh.current.geometry) {
      const geometry = linesMesh.current.geometry;
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      if (geometry.attributes.position) geometry.attributes.position.needsUpdate = true;
      if (geometry.attributes.color) geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <lineSegments ref={linesMesh}>
      <bufferGeometry />
      <lineBasicMaterial 
        vertexColors 
        transparent 
        opacity={resolvedTheme === 'dark' ? 0.15 : 0.8} // Much higher opacity for light mode
        blending={THREE.AdditiveBlending}
        depthTest={false}
        depthWrite={false} // Added for better line rendering
      />
    </lineSegments>
  );
}

export function GeometricBackground() {
  const mouse = useRef<[number, number]>([0, 0]);
  const scrollY = useRef<number>(0);
  
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current = [
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1
      ];
    };

    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 25], fov: 60 }}> {/* Wider view */}
        <ambientLight intensity={1.2} /> {/* Much brighter light */}
        <Network mouse={mouse} scrollY={scrollY} />
        <EffectComposer>
          <Bloom
            intensity={1.2} // Much stronger bloom
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            radius={1.2}
          />
          <Bloom // Second bloom pass for extra glow
            intensity={0.8}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            radius={2}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}