export default function DomeShelter({ inputs, materials, thermalView }) {
  const {
    length = 8,
    width = 6,
    height = 3.2,
    windowCount = 4,
    windowWidth = 1.0,
    windowHeight = 1.0,
    doorWidth = 1.0,
    doorHeight = 2.1,
    insulationThickness = 0.08,
  } = inputs

  // Dome radius computed from footprint and height
  const radius = Math.max(height, Math.sqrt((length * width) / Math.PI) * 0.95)
  const plinthHeight = 0.2

  // Distribute windows radially along the front arc (South exposure)
  const windows = Array.from({ length: windowCount }, (_, i) => {
    // Arc between -60° and +60° facing positive Z
    const angle = ((i + 1) / (windowCount + 1) - 0.5) * (Math.PI * 0.7)
    const winRadius = radius * 0.98
    const winHeight = plinthHeight + radius * 0.35
    return {
      position: [Math.sin(angle) * winRadius, winHeight, Math.cos(angle) * winRadius],
      rotation: [0, angle, 0],
    }
  })

  // Airlock vestibule extends out from the dome perimeter along +Z
  const vestibuleLen = 1.2
  const vestibuleZ = radius + vestibuleLen / 2 - 0.2

  return (
    <group>
      {/* Foundation Concrete Ring */}
      <mesh position={[0, plinthHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius + 0.25, radius + 0.25, plinthHeight, 48]} />
        <primitive object={materials.plinth} attach="material" />
      </mesh>

      {/* Main Dome Shell */}
      <mesh position={[0, plinthHeight, 0]} castShadow receiveShadow>
        <sphereGeometry args={[radius, 48, 28, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <primitive object={materials.wall} attach="material" />
      </mesh>

      {/* Apex Solar Skylight / Cupola */}
      <mesh position={[0, plinthHeight + radius * 0.96, 0]} castShadow>
        <sphereGeometry args={[radius * 0.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.5]} />
        <primitive object={materials.glass} attach="material" />
      </mesh>
      {/* Skylight Frame Collar */}
      <mesh position={[0, plinthHeight + radius * 0.95, 0]}>
        <cylinderGeometry args={[radius * 0.21, radius * 0.21, 0.08, 32]} />
        <primitive object={materials.frame} attach="material" />
      </mesh>

      {/* Thermal View Inner Insulation Layer */}
      {thermalView && (
        <mesh position={[0, plinthHeight, 0]}>
          <sphereGeometry
            args={[radius - insulationThickness * 1.5, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
          <primitive object={materials.insulation} attach="material" />
        </mesh>
      )}

      {/* Radial Windows with Frame Border */}
      {windows.map((win, idx) => (
        <group key={idx} position={win.position} rotation={win.rotation}>
          {/* Frame */}
          <mesh castShadow>
            <boxGeometry args={[windowWidth + 0.08, windowHeight + 0.08, 0.05]} />
            <primitive object={materials.frame} attach="material" />
          </mesh>
          {/* Glass */}
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[windowWidth, windowHeight]} />
            <primitive object={materials.glass} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Protruding Airlock Vestibule Tunnel (Critical for arctic/high-altitude cold wind protection) */}
      <group position={[0, plinthHeight + doorHeight / 2, vestibuleZ]}>
        {/* Vestibule Walls & Roof */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[doorWidth + 0.4, doorHeight + 0.2, vestibuleLen]} />
          <primitive object={materials.wall} attach="material" />
        </mesh>
        {/* Entrance Door at the front of the vestibule */}
        <mesh position={[0, 0, vestibuleLen / 2 + 0.02]} castShadow>
          <boxGeometry args={[doorWidth, doorHeight, 0.06]} />
          <primitive object={materials.door} attach="material" />
        </mesh>
        {/* Door Frame */}
        <mesh position={[0, 0, vestibuleLen / 2 + 0.01]}>
          <boxGeometry args={[doorWidth + 0.1, doorHeight + 0.06, 0.04]} />
          <primitive object={materials.frame} attach="material" />
        </mesh>
        {/* Door Handle */}
        <mesh position={[doorWidth * 0.35, 0, vestibuleLen / 2 + 0.06]}>
          <cylinderGeometry args={[0.015, 0.015, 0.3, 16]} />
          <primitive object={materials.handle} attach="material" />
        </mesh>
      </group>
    </group>
  )
}
