export default function AFrameShelter({ inputs, materials, thermalView }) {
  const {
    length = 8,
    width = 6,
    height = 3.8,
    windowCount = 4,
    windowWidth = 1.0,
    windowHeight = 1.0,
    doorWidth = 1.0,
    doorHeight = 2.1,
    insulationThickness = 0.08,
  } = inputs

  const halfW = width / 2
  const slopeAngle = Math.atan2(height, halfW)
  const roofSlopeLength = Math.sqrt(halfW * halfW + height * height)
  const plinthHeight = 0.2

  // Distribute windows: some on front gable, some as roof skylights along the slope
  const roofWindows = []
  const skylightCount = Math.max(1, Math.min(4, windowCount - 1))
  for (let i = 0; i < skylightCount; i++) {
    const frac = (i + 1) / (skylightCount + 1)
    const z = -length / 2 + frac * length
    // Skylight along the sunny right slope (+X)
    roofWindows.push({
      position: [halfW * 0.45, plinthHeight + height * 0.55, z],
      rotation: [0, 0, -slopeAngle],
    })
  }

  return (
    <group>
      {/* Insulated Ground Plinth */}
      <mesh position={[0, plinthHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.4, plinthHeight, length + 0.4]} />
        <primitive object={materials.plinth} attach="material" />
      </mesh>

      {/* Structural Central Ridge Beam */}
      <mesh position={[0, plinthHeight + height + 0.04, 0]} castShadow>
        <boxGeometry args={[0.2, 0.2, length + 0.6]} />
        <primitive object={materials.frame} attach="material" />
      </mesh>

      {/* Right Angled Roof Plane */}
      <mesh
        position={[halfW / 2, plinthHeight + height / 2, 0]}
        rotation={[0, 0, slopeAngle]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[roofSlopeLength + 0.2, 0.16, length + 0.3]} />
        <primitive object={materials.roof} attach="material" />
      </mesh>

      {/* Left Angled Roof Plane */}
      <mesh
        position={[-halfW / 2, plinthHeight + height / 2, 0]}
        rotation={[0, 0, -slopeAngle]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[roofSlopeLength + 0.2, 0.16, length + 0.3]} />
        <primitive object={materials.roof} attach="material" />
      </mesh>

      {/* Front Triangular Gable Wall (South Facing) */}
      <group position={[0, plinthHeight, length / 2]}>
        {/* Wall body */}
        <mesh position={[0, height * 0.4, 0]} castShadow>
          <boxGeometry args={[width * 0.94, height * 0.8, 0.12]} />
          <primitive object={materials.wall} attach="material" />
        </mesh>
        {/* Upper Gable Glazing Apex */}
        <mesh position={[0, height * 0.72, 0.08]} castShadow>
          <boxGeometry args={[width * 0.35, height * 0.35, 0.04]} />
          <primitive object={materials.glass} attach="material" />
        </mesh>
        <mesh position={[0, height * 0.72, 0.07]}>
          <boxGeometry args={[width * 0.38, height * 0.38, 0.02]} />
          <primitive object={materials.frame} attach="material" />
        </mesh>

        {/* Front Entrance Door */}
        <group position={[0, doorHeight / 2, 0.08]}>
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
      </group>

      {/* Rear Triangular Gable Wall */}
      <group position={[0, plinthHeight, -length / 2]}>
        <mesh position={[0, height * 0.4, 0]} castShadow>
          <boxGeometry args={[width * 0.94, height * 0.8, 0.12]} />
          <primitive object={materials.wall} attach="material" />
        </mesh>
        {/* Rear ventilation / light window */}
        <mesh position={[0, height * 0.65, -0.08]}>
          <boxGeometry args={[width * 0.3, height * 0.25, 0.04]} />
          <primitive object={materials.glass} attach="material" />
        </mesh>
      </group>

      {/* Roof Skylight Windows embedded along slope */}
      {roofWindows.map((win, idx) => (
        <group key={idx} position={win.position} rotation={win.rotation}>
          <mesh castShadow>
            <boxGeometry args={[windowWidth + 0.08, 0.06, windowHeight + 0.08]} />
            <primitive object={materials.frame} attach="material" />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[windowWidth, 0.04, windowHeight]} />
            <primitive object={materials.glass} attach="material" />
          </mesh>
        </group>
      ))}

      {/* Thermal View Inner Insulation Visualization */}
      {thermalView && (
        <mesh position={[0, plinthHeight + height * 0.45, 0]}>
          <boxGeometry
            args={[
              width * 0.65 - insulationThickness * 2,
              height * 0.65 - insulationThickness * 2,
              length * 0.9 - insulationThickness * 2,
            ]}
          />
          <primitive object={materials.insulation} attach="material" />
        </mesh>
      )}
    </group>
  )
}
