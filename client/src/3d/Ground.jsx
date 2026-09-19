import { Grid, ContactShadows, Text } from '@react-three/drei'

export default function Ground() {
  return (
    <group>
      {/* Ground Substrate Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#090E1C" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Cyber Engineering Grid */}
      <Grid
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.7}
        cellColor="#0e1d38"
        sectionSize={5}
        sectionThickness={1.2}
        sectionColor="#00D4FF"
        fadeDistance={45}
        fadeStrength={1.5}
        infiniteGrid
        position={[0, 0.01, 0]}
      />

      {/* Cardinal Orientation Compass Ring */}
      <group position={[0, 0.03, 0]}>
        {/* Outer Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[11.8, 12, 64]} />
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.3} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[5.9, 6.0, 48]} />
          <meshBasicMaterial color="#00D4FF" transparent opacity={0.15} />
        </mesh>

        {/* Cardinal Direction Text Markers */}
        {/* North (0° / -Z) */}
        <group position={[0, 0, -12.8]} rotation={[-Math.PI / 2, 0, 0]}>
          <Text fontSize={0.9} color="#EF4444" anchorX="center" anchorY="middle">
            NORTH (0°)
          </Text>
        </group>
        {/* South (180° / +Z) - Peak Solar Gain */}
        <group position={[0, 0, 12.8]} rotation={[-Math.PI / 2, 0, Math.PI]}>
          <Text fontSize={0.9} color="#F59E0B" anchorX="center" anchorY="middle">
            SOUTH (180° SOLAR)
          </Text>
        </group>
        {/* East (90° / +X) */}
        <group position={[12.8, 0, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
          <Text fontSize={0.8} color="#00D4FF" anchorX="center" anchorY="middle">
            EAST (90°)
          </Text>
        </group>
        {/* West (270° / -X) */}
        <group position={[-12.8, 0, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
          <Text fontSize={0.8} color="#00D4FF" anchorX="center" anchorY="middle">
            WEST (270°)
          </Text>
        </group>
      </group>

      {/* Dynamic contact shadow beneath shelter */}
      <ContactShadows opacity={0.55} scale={32} blur={2.2} far={14} color="#000000" position={[0, 0.02, 0]} />
    </group>
  )
}
