export default function SemiCylindricalShelter({ inputs, materials, thermalView }) {
  const {
    length = 8,
    height = 3.2,
    windowCount = 4,
    windowWidth = 1.1,
    windowHeight = 0.9,
    doorWidth = 1.0,
    doorHeight = 2.1,
    insulationThickness = 0.08,
  } = inputs

  const radius = height
  const plinthHeight = 0.2
  const ribCount = 5

  // Windows positioned along the curved flanks
  const windows = Array.from({ length: windowCount }, (_, i) => {
    const frac = (i + 1) / (windowCount + 1)
    const z = -length / 2 + frac * length
    // Angle along the curve (45° to 70°)
    const angle = Math.PI * 0.28 + (i % 2 === 0 ? 0 : 0.2)
    const x = Math.cos(angle) * radius * 0.98
    const y = plinthHeight + Math.sin(angle) * radius * 0.98
    return {
      position: [x, y, z],
      rotation: [0, 0, angle - Math.PI / 2],
    }
  })

  return (
    <group>
      {/* Rectangular Foundation Plinth */}
      <mesh position={[0, plinthHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[radius * 2 + 0.3, plinthHeight, length + 0.3]} />
        <primitive object={materials.plinth} attach="material" />
      </mesh>

      {/* Main Curved Half-Cylinder Shell */}
      <mesh
        position={[0, plinthHeight, 0]}
        rotation={[0, 0, Math.PI / 2]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[radius, radius, length, 48, 1, false, 0, Math.PI]} />
        <primitive object={materials.roof} attach="material" />
      </mesh>

      {/* Structural Arched Reinforcement Exterior Ribs */}
      {Array.from({ length: ribCount }, (_, idx) => {
        const z = -length / 2 + (idx / (ribCount - 1)) * length
        return (
          <mesh
            key={idx}
            position={[0, plinthHeight, z]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry
              args={[radius + 0.04, radius + 0.04, 0.12, 36, 1, true, 0, Math.PI]}
            />
            <primitive object={materials.frame} attach="material" />
          </mesh>
        )
      })}

      {/* Front Bulkhead Semicircular End Wall */}
      <mesh
        position={[0, plinthHeight, length / 2]}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <circleGeometry args={[radius * 0.98, 36, 0, Math.PI]} />
        <primitive object={materials.wall} attach="material" />
      </mesh>

      {/* Rear Bulkhead Semicircular End Wall */}
      <mesh
        position={[0, plinthHeight, -length / 2]}
        rotation={[0, Math.PI, 0]}
        castShadow
        receiveShadow
      >
        <circleGeometry args={[radius * 0.98, 36, 0, Math.PI]} />
        <primitive object={materials.wall} attach="material" />
      </mesh>

      {/* Front Bulkhead Upper Daylight Window */}
      <mesh position={[0, plinthHeight + radius * 0.68, length / 2 + 0.02]} castShadow>
        <boxGeometry args={[windowWidth * 1.2, windowHeight * 0.6, 0.04]} />
        <primitive object={materials.glass} attach="material" />
      </mesh>

      {/* Curved Flank Windows */}
      {windows.map((win, idx) => (
        <group key={idx} position={win.position} rotation={win.rotation}>
          <mesh castShadow>
            <boxGeometry args={[windowWidth + 0.06, 0.04, windowHeight + 0.06]} />
            <primitive object={materials.frame} attach="material" />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[windowWidth, 0.02, windowHeight]} />
            <primitive object={materials.glass} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Front Entrance Airlock Door */}
      <group position={[0, plinthHeight + doorHeight / 2, length / 2 + 0.04]}>
        <mesh castShadow>
          <boxGeometry args={[doorWidth + 0.1, doorHeight + 0.05, 0.06]} />
          <primitive object={materials.frame} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.02]} castShadow>
          <boxGeometry args={[doorWidth, doorHeight, 0.05]} />
          <primitive object={materials.door} attach="material" />
        </mesh>
        <mesh position={[doorWidth * 0.35, 0, 0.06]}>
          <cylinderGeometry args={[0.015, 0.015, 0.3, 16]} />
          <primitive object={materials.handle} attach="material" />
        </mesh>
      </group>

      {/* Thermal View Inner Insulation Vault */}
      {thermalView && (
        <mesh
          position={[0, plinthHeight, 0]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry
            args={[
              radius - insulationThickness * 1.5,
              radius - insulationThickness * 1.5,
              length * 0.94,
              32,
              1,
              false,
              0,
              Math.PI,
            ]}
          />
          <primitive object={materials.insulation} attach="material" />
        </mesh>
      )}
    </group>
  )
}
