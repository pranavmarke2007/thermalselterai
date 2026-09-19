function WindowWithFrame({ position, rotation, width, height, materials }) {
  const frameThickness = 0.06
  return (
    <group position={position} rotation={rotation}>
      {/* Outer frame */}
      <mesh castShadow>
        <boxGeometry args={[width + frameThickness * 2, height + frameThickness * 2, 0.04]} />
        <primitive object={materials.frame} attach="material" />
      </mesh>
      {/* Glass pane */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width, height]} />
        <primitive object={materials.glass} attach="material" />
      </mesh>
      {/* Cross mullion */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[0.03, height, 0.02]} />
        <primitive object={materials.frame} attach="material" />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[width, 0.03, 0.02]} />
        <primitive object={materials.frame} attach="material" />
      </mesh>
    </group>
  )
}

export default function RectangularShelter({ inputs, materials, thermalView }) {
  const {
    length = 8,
    width = 6,
    height = 3.2,
    windowCount = 4,
    windowWidth = 1.2,
    windowHeight = 1.1,
    doorWidth = 1.0,
    doorHeight = 2.1,
    insulationThickness = 0.08,
  } = inputs

  const plinthHeight = 0.25
  const roofPeakHeight = 1.1
  const eaveOverhang = 0.35

  // Generate window positions distributed along the front (+Z) and rear (-Z) walls
  const windows = []
  const halfCount = Math.max(1, Math.ceil(windowCount / 2))
  for (let i = 0; i < halfCount; i++) {
    const frac = (i + 1) / (halfCount + 1)
    const x = -length / 2 + frac * length
    // Front window (south-facing in default orientation)
    windows.push({
      position: [x, plinthHeight + height * 0.55, width / 2 + 0.02],
      rotation: [0, 0, 0],
    })
    // Rear window
    if (windows.length < windowCount) {
      windows.push({
        position: [x, plinthHeight + height * 0.55, -width / 2 - 0.02],
        rotation: [0, Math.PI, 0],
      })
    }
  }

  return (
    <group>
      {/* Insulated Perimeter Foundation Plinth */}
      <mesh position={[0, plinthHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length + 0.3, plinthHeight, width + 0.3]} />
        <primitive object={materials.plinth} attach="material" />
      </mesh>

      {/* Main Opaque Envelope Walls */}
      <mesh position={[0, plinthHeight + height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, height, width]} />
        <primitive object={materials.wall} attach="material" />
      </mesh>

      {/* Thermal View Inner Insulation Layer Inspection */}
      {thermalView && (
        <mesh position={[0, plinthHeight + height / 2, 0]}>
          <boxGeometry
            args={[
              length - insulationThickness * 2,
              height - insulationThickness * 2,
              width - insulationThickness * 2,
            ]}
          />
          <primitive object={materials.insulation} attach="material" />
        </mesh>
      )}

      {/* Pitched Gabled Roof with Overhang */}
      <group position={[0, plinthHeight + height, 0]}>
        {/* Left roof slope */}
        <mesh
          position={[0, roofPeakHeight / 2, width / 4 + eaveOverhang / 4]}
          rotation={[Math.atan2(roofPeakHeight, width / 2), 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              length + eaveOverhang * 2,
              0.14,
              Math.sqrt((width / 2) ** 2 + roofPeakHeight ** 2) + eaveOverhang,
            ]}
          />
          <primitive object={materials.roof} attach="material" />
        </mesh>

        {/* Right roof slope */}
        <mesh
          position={[0, roofPeakHeight / 2, -width / 4 - eaveOverhang / 4]}
          rotation={[-Math.atan2(roofPeakHeight, width / 2), 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[
              length + eaveOverhang * 2,
              0.14,
              Math.sqrt((width / 2) ** 2 + roofPeakHeight ** 2) + eaveOverhang,
            ]}
          />
          <primitive object={materials.roof} attach="material" />
        </mesh>

        {/* Gable End Walls (Triangles) */}
        <mesh position={[length / 2 - 0.02, roofPeakHeight / 2, 0]} castShadow>
          <coneGeometry args={[width * 0.5, roofPeakHeight, 4]} />
          <primitive object={materials.wall} attach="material" />
        </mesh>
        <mesh position={[-length / 2 + 0.02, roofPeakHeight / 2, 0]} castShadow>
          <coneGeometry args={[width * 0.5, roofPeakHeight, 4]} />
          <primitive object={materials.wall} attach="material" />
        </mesh>
      </group>

      {/* Windows with architectural frames */}
      {windows.slice(0, windowCount).map((win, idx) => (
        <WindowWithFrame
          key={idx}
          position={win.position}
          rotation={win.rotation}
          width={windowWidth}
          height={windowHeight}
          materials={materials}
        />
      ))}

      {/* Insulated Main Entrance Door & Airlock Threshold */}
      <group position={[0, plinthHeight + doorHeight / 2, width / 2 + 0.04]}>
        {/* Door Frame */}
        <mesh castShadow>
          <boxGeometry args={[doorWidth + 0.1, doorHeight + 0.05, 0.08]} />
          <primitive object={materials.frame} attach="material" />
        </mesh>
        {/* Door Leaf */}
        <mesh position={[0, 0, 0.02]} castShadow>
          <boxGeometry args={[doorWidth, doorHeight, 0.06]} />
          <primitive object={materials.door} attach="material" />
        </mesh>
        {/* Futuristic Glowing Handle */}
        <mesh position={[doorWidth * 0.35, 0, 0.07]}>
          <cylinderGeometry args={[0.015, 0.015, 0.35, 16]} />
          <primitive object={materials.handle} attach="material" />
        </mesh>
      </group>
    </group>
  )
}
