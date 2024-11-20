"use client";

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

export function GeometricBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background

    const particles = new THREE.Group();
    scene.add(particles);

    // Create particles
    const particleCount = 100;
    const particleGeometry = new THREE.SphereGeometry(0.05, 32, 32);
    const particleMaterial = new THREE.MeshBasicMaterial({ 
      color: resolvedTheme === 'dark' ? 0x6366F1 : 0x4338CA // Indigo colors
    });

    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.set(
        Math.random() * 40 - 20,
        Math.random() * 40 - 20,
        Math.random() * 40 - 20
      );
      particles.add(particle);
    }

    camera.position.z = 30;

    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: resolvedTheme === 'dark' ? 0x994976 : 0x7C3AED, // Purple colors
      transparent: true, 
      opacity: resolvedTheme === 'dark' ? 0.3 : 0.5
    });

    let mouseX = 0;
    let mouseY = 0;

    const animate = () => {
      requestAnimationFrame(animate);

      particles.rotation.x += 0.0005;
      particles.rotation.y += 0.0005;

      particles.rotation.y += (mouseX - particles.rotation.y) * 0.05;
      particles.rotation.x += (-mouseY - particles.rotation.x) * 0.05;

      particles.children.forEach((particle, index) => {
        particle.position.y = Math.sin(Date.now() * 0.001 + index) * 0.1 + particle.position.y;
      });

      // Remove old lines
      scene.remove(...scene.children.filter(child => child instanceof THREE.Line));

      // Create new connections
      for (let i = 0; i < particles.children.length; i++) {
        for (let j = i + 1; j < particles.children.length; j++) {
          const distance = particles.children[i].position.distanceTo(particles.children[j].position);
          if (distance < 5) {
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
              particles.children[i].position,
              particles.children[j].position
            ]);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) / 500;
      mouseY = (event.clientY - window.innerHeight / 2) / 500;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      // Cleanup
      scene.clear();
      renderer.dispose();
    };
  }, [resolvedTheme]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none w-full h-full"
    />
  );
}