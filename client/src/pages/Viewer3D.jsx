import { useRef, useState } from 'react'
import ShelterCanvas from '../3d/ShelterCanvas'
import ViewControls from '../components/ViewControls'
import ShelterForm from '../components/ShelterForm'
import GlassCard from '../components/GlassCard'
import { useSimulator } from '../context/SimulatorContext'
import { Box, Maximize2, ShieldAlert, Sparkles, Sliders } from 'lucide-react'
import { formatTemp, formatKw, formatPercent } from '../utils/format'

export default function Viewer3D() {
  const { inputs, thermal, thermalView, setThermalView } = useSimulator()
  const [wireframe, setWireframe] = useState(false)
  const cameraRef = useRef(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.24em] text-[#00D4FF]">
            Spatial CAD Engine · WebGL Three.js / R3F
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-white">
            3D Interactive Shelter Workstation
          </h1>
        </div>
        <ViewControls
          thermalView={thermalView}
          onToggleThermal={() => setThermalView((v) => !v)}
          wireframe={wireframe}
          onToggleWireframe={() => setWireframe((v) => !v)}
          onView={(name) => cameraRef.current?.setView(name)}
        />
      </div>

      {/* Primary Workstation Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Expanded 3D Canvas Viewport */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative h-[72vh] min-h-[500px] w-full overflow-hidden rounded-3xl border border-[#00D4FF]/25 bg-[#070B16] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <ShelterCanvas
              inputs={inputs}
              thermal={thermal}
              thermalView={thermalView}
              cameraRef={cameraRef}
              wireframe={wireframe}
            />

            {/* In-Canvas HUD Telemetry Overlay */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
              <span className="telemetry-badge bg-black/60 backdrop-blur-md">
                Shape: {inputs.shape.toUpperCase()}
              </span>
              <span className="telemetry-badge bg-black/60 backdrop-blur-md text-amber-400 border-amber-400/30">
                Azimuth: {inputs.orientation}°
              </span>
              <span className="telemetry-badge bg-black/60 backdrop-blur-md text-[#4ADE80] border-[#4ADE80]/30">
                Indoor: {formatTemp(thermal.indoorTemperature)}
              </span>
              <span className="telemetry-badge bg-black/60 backdrop-blur-md text-rose-400 border-rose-400/30">
                Loss: {formatKw(thermal.heatLoss)}
              </span>
            </div>

            {/* Bottom HUD Legend */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/70 px-4 py-2 backdrop-blur-md text-xs text-slate-300">
              <span className="font-mono">
                Dimensions: {inputs.length}m (L) × {inputs.width}m (W) × {inputs.height}m (H)
              </span>
              <span className="text-slate-400 hidden sm:inline">
                Left Drag: Orbit · Right Drag: Pan · Scroll: Zoom
              </span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Parametric Dimension Tweaks */}
        <div className="lg:col-span-4 space-y-4">
          <GlassCard className="p-1">
            <ShelterForm />
          </GlassCard>

          {/* Envelope Physics Summary Card */}
          <GlassCard className="p-5 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders size={13} className="text-[#00D4FF]" />
              Active Envelope Telemetry
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="rounded-lg bg-black/30 p-2.5">
                <span className="text-slate-500 block text-[10px]">Net Wall Area</span>
                <span className="text-white font-bold">{thermal.areas?.wallArea?.toFixed(1)} m²</span>
              </div>
              <div className="rounded-lg bg-black/30 p-2.5">
                <span className="text-slate-500 block text-[10px]">Roof Surface</span>
                <span className="text-white font-bold">{thermal.areas?.roofArea?.toFixed(1)} m²</span>
              </div>
              <div className="rounded-lg bg-black/30 p-2.5">
                <span className="text-slate-500 block text-[10px]">Glazing Area</span>
                <span className="text-[#00D4FF] font-bold">{thermal.areas?.windowArea?.toFixed(1)} m²</span>
              </div>
              <div className="rounded-lg bg-black/30 p-2.5">
                <span className="text-slate-500 block text-[10px]">Interior Volume</span>
                <span className="text-amber-400 font-bold">{thermal.areas?.volume?.toFixed(1)} m³</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
