import { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { useTheme } from 'next-themes'

function Shapes({ mouse, scrollY }) {
  const group = useRef()
  const { viewport } = useThree()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    // Smooth mouse movement
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x, 
      (mouse.current[1] / 10) + (scrollY.current * 0.005), 
      0.1
    )
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y, 
      mouse.current[0] / 5, 
      0.1
    )
    // Gentle floating animation
    group.current.position.y = THREE.MathUtils.lerp(
      group.current.position.y,
      Math.sin(t / 2) * 0.3,
      0.1
    )
  })

  return (
    <group ref={group}>
      {Array.from({ length: 12 }).map((_, i) => (
        <Shape key={i} index={i} />
      ))}
    </group>
  )
}

function Shape({ index }) {
  const { resolvedTheme } = useTheme()
  const meshRef = useRef()
  const radius = 2

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const position = new THREE.Vector3(
      Math.sin(t + index * 1000) * radius,
      Math.cos(t + index * 1000) * radius,
      Math.sin(t + index * 1000) * radius
    )
    meshRef.current.position.lerp(position, 0.1)
  })

  const gradientTexture = useTexture('/gradient-texture.png') // You'll need to create this texture

  return (
    <mesh ref={meshRef} scale={0.2 + Math.random() * 0.3}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhongMaterial
        color={resolvedTheme === 'dark' ? '#5244e1' : '#b06ab3'}
        transparent
        opacity={0.7}
        shininess={100}
      />
    </mesh>
  )
}

export function GeometricBackground() {
  const mouse = useRef([0, 0])
  const scrollY = useRef(0)
  
  useEffect(() => {
    const handleMouseMove = (event) => {
      mouse.current = [
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1
      ]
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Shapes mouse={mouse} scrollY={scrollY} />
      </Canvas>
    </div>
  )
}