import { useMemo } from 'react'
import * as THREE from 'three'
import { heatMapHex } from '../utils/format'

export function useShelterMaterials({ thermalView, thermal, wallColor, roofColor, textures, wireframe = false }) {
  return useMemo(() => {
    const indoor = thermal.indoorTemperature || 20
    const ambient = -8
    
    // Thermal colors for components based on temperature delta
    const wallHeatColor = heatMapHex(indoor - 2, ambient)
    const roofHeatColor = heatMapHex(indoor + 2, ambient)
    const floorHeatColor = heatMapHex(indoor - 5, ambient)

    // Wall Material
    const wall = new THREE.MeshStandardMaterial({
      color: thermalView ? new THREE.Color(wallHeatColor) : new THREE.Color(wallColor || '#64748B'),
      map: thermalView ? textures.thermalGradient : textures.stone,
      roughness: thermalView ? 0.4 : 0.75,
      metalness: thermalView ? 0.1 : 0.12,
      emissive: thermalView ? new THREE.Color(wallHeatColor).multiplyScalar(0.35) : new THREE.Color(0x000000),
      wireframe: wireframe,
    })

    // Roof Material
    const roof = new THREE.MeshStandardMaterial({
      color: thermalView ? new THREE.Color(roofHeatColor) : new THREE.Color(roofColor || '#475569'),
      map: thermalView ? textures.thermalGradient : textures.metal,
      roughness: thermalView ? 0.35 : 0.4,
      metalness: thermalView ? 0.2 : 0.65,
      emissive: thermalView ? new THREE.Color(roofHeatColor).multiplyScalar(0.4) : new THREE.Color(0x000000),
      wireframe: wireframe,
    })

    // Glass Window Material (Double glazing with realistic transmission)
    const glass = new THREE.MeshPhysicalMaterial({
      color: thermalView ? '#22d3ee' : '#bae6fd',
      map: textures.glass,
      transparent: true,
      opacity: thermalView ? 0.75 : 0.45,
      roughness: 0.08,
      metalness: 0.1,
      transmission: thermalView ? 0.2 : 0.7,
      ior: 1.52,
      thickness: 0.25,
      emissive: thermalView ? new THREE.Color('#0891b2') : new THREE.Color(0x000000),
      emissiveIntensity: thermalView ? 0.3 : 0,
      wireframe: wireframe,
    })

    // Window Frame / Mullions Material
    const frame = new THREE.MeshStandardMaterial({
      color: thermalView ? '#0284c7' : '#0f172a',
      roughness: 0.5,
      metalness: 0.7,
      wireframe: wireframe,
    })

    // Door Material (Thermal-break composite)
    const door = new THREE.MeshStandardMaterial({
      color: thermalView ? new THREE.Color(floorHeatColor) : '#334155',
      roughness: 0.6,
      metalness: 0.3,
      emissive: thermalView ? new THREE.Color(floorHeatColor).multiplyScalar(0.2) : new THREE.Color(0x000000),
      wireframe: wireframe,
    })

    // Door Handle Accent
    const handle = new THREE.MeshStandardMaterial({
      color: '#00D4FF',
      metalness: 0.9,
      roughness: 0.15,
    })

    // Foundation / Plinth Material
    const plinth = new THREE.MeshStandardMaterial({
      color: thermalView ? '#1e3a8a' : '#1e293b',
      roughness: 0.9,
      metalness: 0.05,
      wireframe: wireframe,
    })

    // Insulation Inspection Layer (glowing amber/yellow when viewing inner envelope)
    const insulation = new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      map: textures.insulation,
      transparent: true,
      opacity: 0.45,
      roughness: 0.8,
      emissive: new THREE.Color('#d97706'),
      emissiveIntensity: 0.25,
      wireframe: wireframe,
    })

    return { wall, roof, glass, frame, door, handle, plinth, insulation }
  }, [thermalView, thermal, wallColor, roofColor, textures, wireframe])
}
