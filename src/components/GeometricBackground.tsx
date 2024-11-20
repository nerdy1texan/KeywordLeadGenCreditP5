import { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

interface Point {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

interface NetworkProps {
  mouse: React.MutableRefObject<[number, number]>;
  scrollY: React.MutableRefObject<number>;
}

function Network({ mouse, scrollY }: NetworkProps) {
  const { size, viewport } = useThree();
  const points = useRef<Point[]>([]);
  const linesMesh = useRef<THREE.LineSegments>(null!);
  const { resolvedTheme } = useTheme();

  // Initialize points
  useMemo(() => {
    points.current = Array.from({ length: 50 }, () => ({
      position: new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ),
      velocity: new THREE.Vector3(
        Math.random() * 0.02 - 0.01,
        Math.random() * 0.02 - 0.01,
        Math.random() * 0.02 - 0.01
      ),
    }));
  }, []);

  useFrame((state) => {
    const positions: number[] = [];
    const colors: number[] = [];
    const color1 = new THREE.Color(resolvedTheme === 'dark' ? '#5244e1' : '#b06ab3');
    const color2 = new THREE.Color(resolvedTheme === 'dark' ? '#b06ab3' : '#5244e1');

    // Update points
    points.current.forEach((point) => {
      point.position.add(point.velocity);

      // Bounce off boundaries
      ['x', 'y', 'z'].forEach((axis) => {
        if (Math.abs(point.position[axis]) > 5) {
          point.velocity[axis] *= -1;
        }
      });

      // Add mouse influence
      const mouseInfluence = new THREE.Vector3(
        (mouse.current[0] * viewport.width) / 2,
        (mouse.current[1] * viewport.height) / 2,
        0
      );
      point.position.lerp(mouseInfluence, 0.0001);
    });

    // Create lines between nearby points
    for (let i = 0; i < points.current.length; i++) {
      const pointA = points.current[i];
      
      for (let j = i + 1; j < points.current.length; j++) {
        const pointB = points.current[j];
        const distance = pointA.position.distanceTo(pointB.position);
        
        if (distance < 2) {
          positions.push(
            pointA.position.x, pointA.position.y, pointA.position.z,
            pointB.position.x, pointB.position.y, pointB.position.z
          );

          const alpha = 1 - (distance / 2);
          const mixedColor = color1.clone().lerp(color2, alpha);
          colors.push(
            mixedColor.r, mixedColor.g, mixedColor.b,
            mixedColor.r, mixedColor.g, mixedColor.b
          );
        }
      }
    }

    // Update geometry
    const geometry = linesMesh.current.geometry;
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  });

  return (
    <lineSegments ref={linesMesh}>
      <bufferGeometry />
      <lineBasicMaterial vertexColors transparent opacity={0.5} />
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
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <Network mouse={mouse} scrollY={scrollY} />
      </Canvas>
    </div>
  );
}