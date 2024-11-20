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

  // Initialize points in a wider, flatter pattern
  useMemo(() => {
    const count = 80; // Increased number of points
    points.current = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 12 + Math.random() * 6; // Wider radius
      const y = (Math.random() - 0.5) * 4; // Flatter distribution
      
      const initialPosition = new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );

      return {
        position: initialPosition.clone(),
        initialPosition: initialPosition.clone(),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
      };
    });
  }, []);

  useFrame((state) => {
    time.current += 0.001;
    const positions: number[] = [];
    const colors: number[] = [];
    
    // Adjust colors based on theme
    const color1 = new THREE.Color(resolvedTheme === 'dark' ? '#5244e1' : '#5244e1');
    const color2 = new THREE.Color(resolvedTheme === 'dark' ? '#b06ab3' : '#b06ab3');

    // Update points with continuous movement
    points.current.forEach((point, i) => {
      // Complex movement pattern
      const timeOffset = time.current + i * 0.1;
      const xMovement = Math.sin(timeOffset * 0.5) * 0.3;
      const yMovement = Math.cos(timeOffset * 0.3) * 0.2;
      const zMovement = Math.sin(timeOffset * 0.4) * 0.3;

      point.position.x = point.initialPosition.x + xMovement;
      point.position.y = point.initialPosition.y + yMovement;
      point.position.z = point.initialPosition.z + zMovement;

      // Add mouse influence
      const mouseInfluence = new THREE.Vector3(
        (mouse.current[0] * viewport.width) / 2,
        (mouse.current[1] * viewport.height) / 2,
        0
      );
      point.position.lerp(mouseInfluence, 0.01);

      // Add scroll influence
      point.position.y -= scrollY.current * 0.0002;
    });

    // Create lines between points
    points.current.forEach((pointA, i) => {
      points.current.forEach((pointB, j) => {
        if (i < j) {
          const distance = pointA.position.distanceTo(pointB.position);
          const maxDistance = 4 + Math.sin(time.current) * 0.5;
          
          if (distance < maxDistance) {
            positions.push(
              pointA.position.x, pointA.position.y, pointA.position.z,
              pointB.position.x, pointB.position.y, pointB.position.z
            );

            const alpha = 1 - (distance / maxDistance);
            const mixedColor = color1.clone().lerp(color2, alpha);
            colors.push(
              mixedColor.r, mixedColor.g, mixedColor.b,
              mixedColor.r, mixedColor.g, mixedColor.b
            );
          }
        }
      });
    });

    // Update geometry if it exists
    if (linesMesh.current && linesMesh.current.geometry) {
      const geometry = linesMesh.current.geometry;
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      // Safely update attributes
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
        opacity={resolvedTheme === 'dark' ? 0.15 : 0.3} // Higher opacity for light mode
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
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <Network mouse={mouse} scrollY={scrollY} />
        <EffectComposer>
          <Bloom
            intensity={0.3}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}