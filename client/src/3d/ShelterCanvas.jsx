import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import ShelterModel from './ShelterModel'
import Ground from './Ground'
import { formatTemp } from '../utils/format'
import { useTheme } from '../context/ThemeContext'

function SunIndicator({ timeOfDay, isThermal }) {
  const isDay = timeOfDay >= 6 && timeOfDay <= 18
  const sunPos = useMemo(() => {
    if (!isDay) return [0, -10, 0]
    const progress = (timeOfDay - 6) / 12 // 0 at 6:00, 0.5 at 12:00, 1.0 at 18:00
    const angle = progress * Math.PI
    const x = Math.cos(angle) * 22 // East (+22) to West (-22)
    const y = Math.sin(angle) * 18 + 2 // Peak height ~20m
    const z = Math.sin(angle) * 12 // Southward arc
    return [x, y, z]
  }, [timeOfDay, isDay])

  if (!isDay) {
    return (
      <directionalLight
        position={[4, 16, 6]}
        intensity={0.25}
        color="#93c5fd"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    )
  }

  return (
    <group>
      {/* Visual Glowing Sun Sphere in the sky */}
      <mesh position={sunPos}>
        <sphereGeometry args={[1.2, 24, 24]} />
        <meshBasicMaterial color={isThermal ? '#ff9e00' : '#fde047'} />
      </mesh>
      <pointLight position={sunPos} intensity={0.8} color="#fef08a" distance={45} />
      {/* Primary Directional Sunlight with Shadows */}
      <directionalLight
        castShadow
        position={sunPos}
        intensity={isThermal ? 1.6 : 2.0}
        color={isThermal ? '#ffd166' : '#fffbeb'}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
    </group>
  )
}

export default function ShelterCanvas({
  inputs,
  thermal,
  thermalView,
  cameraRef,
  wireframe = false,
  showData = true,
}) {
  const controls = useRef()
  const { theme } = useTheme()

  useEffect(() => {
    if (!cameraRef) return
    cameraRef.current = {
      setView(name) {
        const cam = controls.current?.object
        if (!cam) return
        const maxDim = Math.max(inputs.length || 8, inputs.width || 6, inputs.height || 3.2)
        const d = maxDim * 2.1
        const views = {
          front: [0, (inputs.height || 3.2) * 0.7, d],
          back: [0, (inputs.height || 3.2) * 0.7, -d],
          left: [-d, (inputs.height || 3.2) * 0.7, 0],
          right: [d, (inputs.height || 3.2) * 0.7, 0],
          top: [0, d * 1.5, 0.01],
          iso: [d * 0.85, d * 0.65, d * 0.85],
        }
        const pos = views[name] || views.front
        cam.position.set(...pos)
        controls.current.target.set(0, (inputs.height || 3.2) * 0.45, 0)
        controls.current.update()
      },
    }
  }, [cameraRef, inputs.height, inputs.length, inputs.width])

  const bgColor = thermalView ? '#0a0512' : theme === 'light' ? '#e8f1f4' : '#070B16'
  const fogColor = thermalView ? bgColor : theme === 'light' ? '#e8f1f4' : bgColor

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      className="rounded-2xl"
    >
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[fogColor, 25, 65]} />
      <PerspectiveCamera makeDefault position={[12, 7.5, 14]} fov={40} />

      {/* Lighting Suite */}
      <ambientLight intensity={thermalView ? 0.35 : 0.5} color={thermalView ? '#c084fc' : '#e2e8f0'} />
      <hemisphereLight args={['#38bdf8', theme === 'light' ? '#cbdde2' : '#0b1020', 0.4]} />
      <SunIndicator timeOfDay={inputs.timeOfDay ?? 13} isThermal={thermalView} />

      {/* Cyber Point Accent Fill */}
      <pointLight position={[-8, 5, -8]} intensity={0.4} color="#00D4FF" />

      <Suspense fallback={null}>
        {/* Dynamic Shelter Rotation according to Orientation (0°–360°) */}
        <group rotation={[0, ((inputs.orientation || 0) * Math.PI) / 180, 0]}>
          <ShelterModel
            inputs={inputs}
            thermal={thermal}
            thermalView={thermalView}
            wireframe={wireframe}
          />
        </group>
        {showData ? (
          <group>
            <Html
              position={[0, (inputs.height || 3.2) * 0.72, 0]}
              center
              distanceFactor={10}
              occlude={false}
            >
              <div className="pointer-events-none min-w-[118px] rounded-lg border border-emerald-300/40 bg-emerald-950/75 px-3 py-2 text-center shadow-lg backdrop-blur-md">
                <div className="text-[10px] uppercase tracking-[0.12em] text-emerald-100/80">Inside temp</div>
                <div className="font-mono text-sm font-bold text-emerald-200">
                  {formatTemp(thermal.indoorTemperature)}
                </div>
              </div>
            </Html>
            <Html
              position={[
                (inputs.length || 8) * 0.62,
                Math.max(1.3, (inputs.height || 3.2) * 0.45),
                (inputs.width || 6) * 0.62,
              ]}
              center
              distanceFactor={10}
              occlude={false}
            >
              <div className="pointer-events-none min-w-[118px] rounded-lg border border-sky-300/40 bg-sky-950/75 px-3 py-2 text-center shadow-lg backdrop-blur-md">
                <div className="text-[10px] uppercase tracking-[0.12em] text-sky-100/80">Outside temp</div>
                <div className="font-mono text-sm font-bold text-sky-200">
                  {formatTemp(inputs.ambientTemperature)}
                </div>
              </div>
            </Html>
          </group>
        ) : null}
        <Ground />
      </Suspense>

      <OrbitControls
        ref={controls}
        makeDefault
        enablePan
        enableZoom
        enableRotate
        dampingFactor={0.06}
        minDistance={3.5}
        maxDistance={45}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, (inputs.height || 3.2) * 0.4, 0]}
      />
    </Canvas>
  )
}
