import { useRef, useState } from 'react'
import GlassCard from '../components/GlassCard'
import ClimateForm from '../components/ClimateForm'
import ShelterForm from '../components/ShelterForm'
import MaterialPicker from '../components/MaterialPicker'
import RecommendationPanel from '../components/RecommendationPanel'
import MetricCard from '../components/MetricCard'
import ViewControls from '../components/ViewControls'
import TemperatureChart from '../charts/TemperatureChart'
import HeatLossChart from '../charts/HeatLossChart'
import SolarGainChart from '../charts/SolarGainChart'
import EfficiencyChart from '../charts/EfficiencyChart'
import ShelterCanvas from '../3d/ShelterCanvas'
import { useSimulator } from '../context/SimulatorContext'
import { formatKw, formatKwh, formatPercent, formatTemp } from '../utils/format'
import { BarChart3, Box, CloudSun, Gauge, Layers, SlidersHorizontal } from 'lucide-react'

function SetupSection({ icon: Icon, title, defaultOpen = false, children }) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-lg border border-white/10 bg-black/20 transition hover:border-white/20"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <Icon size={16} className="text-[#00D4FF]" />
          {title}
        </span>
        <span className="text-lg leading-none text-slate-400 transition group-open:rotate-45">+</span>
      </summary>
      <div className="border-t border-white/10">{children}</div>
    </details>
  )
}

function WaitingForInput() {
  return (
    <GlassCard className="p-6 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-[#00D4FF]/30 bg-[#00D4FF]/10">
        <SlidersHorizontal size={18} className="text-[#00D4FF]" />
      </div>
      <h2 className="text-base font-semibold text-white">Enter data to view results</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">
        The shelter model is ready. Adjust any climate, shelter, or material value, or use Live Sync, and the
        temperature cards, charts, and advisor will appear with your simulation data.
      </p>
    </GlassCard>
  )
}

function HeatFlowSummary({ thermal, hours }) {
  const rows = [
    ['Walls', thermal.breakdown.wall],
    ['Roof', thermal.breakdown.roof],
    ['Floor', thermal.breakdown.floor],
    ['Windows', thermal.breakdown.windows],
    ['Door', thermal.breakdown.door],
    ['Infiltration', thermal.breakdown.infiltration],
  ]
  const total = Math.max(1, thermal.heatLoss)

  return (
    <GlassCard className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Heat flow for selected period</h3>
          <p className="mt-1 text-xs text-slate-400">
            {hours} hour envelope loss, storage, and passive balance.
          </p>
        </div>
        <span className="telemetry-badge text-rose-300 border-rose-300/30 bg-rose-300/10">
          {formatKwh(thermal.heatLossEnergy)}
        </span>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <div className="space-y-2">
          {rows.map(([label, value]) => {
            const pct = Math.max(2, (value / total) * 100)
            return (
              <div key={label} className="grid grid-cols-[90px_1fr_76px] items-center gap-3 text-xs">
                <span className="text-slate-300">{label}</span>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[#00D4FF]" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-right font-mono text-slate-400">{formatKw(value)}</span>
              </div>
            )
          })}
        </div>
        <div className="grid gap-2 text-xs">
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <span className="block text-slate-400">Stored thermal energy</span>
            <strong className="mt-1 block font-mono text-base text-amber-300">
              {formatKwh(thermal.storedThermalEnergy)}
            </strong>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <span className="block text-slate-400">Storage night lift</span>
            <strong className="mt-1 block font-mono text-base text-emerald-300">
              +{formatTemp(thermal.storageTemperatureLift)}
            </strong>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <span className="block text-slate-400">Net passive balance</span>
            <strong className={`mt-1 block font-mono text-base ${thermal.netPassiveEnergy >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {formatKwh(thermal.netPassiveEnergy)}
            </strong>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

export default function Simulator() {
  const {
    inputs,
    thermal,
    hourly,
    materialLoss,
    shapeEfficiency,
    thermalView,
    setThermalView,
    hasUserInput,
  } = useSimulator()

  const [wireframe, setWireframe] = useState(false)
  const cameraRef = useRef(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div className="max-w-2xl">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#00D4FF]">
            Launch Simulator
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            Passive Shelter Thermal Studio
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Tune the model from a few tidy panels, then read the results only after your own data is in.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="telemetry-badge">Site: {inputs.location || 'Not selected'}</span>
          <span className="telemetry-badge text-[#F59E0B] border-[#F59E0B]/30 bg-[#F59E0B]/10">
            Hour: {inputs.timeOfDay ?? 13}:00
          </span>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-5">
          <GlassCard className="overflow-hidden border-[#00D4FF]/20">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#111827]/90 px-4 py-3">
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-[#00D4FF]" />
                <span className="text-sm font-semibold text-slate-100">3D thermal diagram</span>
              </div>
              <ViewControls
                thermalView={thermalView}
                onToggleThermal={() => setThermalView((v) => !v)}
                wireframe={wireframe}
                onToggleWireframe={() => setWireframe((v) => !v)}
                onView={(name) => cameraRef.current?.setView(name)}
              />
            </div>
            <div className="relative h-[560px] w-full bg-[#070B16]">
              <ShelterCanvas
                inputs={inputs}
                thermal={thermal}
                thermalView={thermalView}
                cameraRef={cameraRef}
                wireframe={wireframe}
                showData={hasUserInput}
              />
              <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
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
              {!hasUserInput ? (
                <div className="absolute left-4 top-4 max-w-xs rounded-lg border border-white/10 bg-black/55 px-4 py-3 text-sm text-slate-300 backdrop-blur-md">
                  Outside and inside temperature labels will appear here after you enter data.
                </div>
              ) : null}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-[11px] text-slate-300 backdrop-blur-md">
                <span className="font-mono">
                  Dimensions: {inputs.length}m (L) × {inputs.width}m (W) × {inputs.height}m (H)
                </span>
                <span className="hidden sm:inline text-slate-400">
                  Drag to orbit · Right drag to pan · Scroll to zoom
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#00D4FF]">
                  Setup
                </p>
                <h2 className="text-lg font-semibold text-white">Input panels</h2>
              </div>
              <BarChart3 size={20} className="text-slate-400" />
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              <SetupSection icon={CloudSun} title="Climate and site" defaultOpen>
                <ClimateForm />
              </SetupSection>
              <SetupSection icon={Box} title="Shelter shape">
                <ShelterForm />
              </SetupSection>
              <SetupSection icon={Layers} title="Materials">
                <MaterialPicker />
              </SetupSection>
            </div>
          </GlassCard>

          {hasUserInput ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                  label="Indoor Equilibrium"
                  value={formatTemp(thermal.indoorTemperature)}
                  hint={thermal.inComfortBand ? 'In comfort band (18-24C)' : 'Outside comfort range'}
                  color={thermal.inComfortBand ? '#4ADE80' : '#F59E0B'}
                />
                <MetricCard
                  label="Envelope Heat Loss"
                  value={formatKw(thermal.heatLoss)}
                  hint="Conduction and infiltration"
                  color="#EF4444"
                />
                <MetricCard
                  label="Solar Harvest Rate"
                  value={formatKw(thermal.solarGain)}
                  hint="Direct aperture plus sol-air gain"
                  color="#00D4FF"
                />
                <MetricCard
                  label="Thermal Efficiency"
                  value={formatPercent(thermal.thermalEfficiency)}
                  hint="Passive retention and solar offset"
                  color="#4ADE80"
                />
                <MetricCard
                  label="Stored Heat"
                  value={formatKwh(thermal.storedThermalEnergy)}
                  hint={thermal.materials.thermalMass.name}
                  color="#F59E0B"
                />
                <MetricCard
                  label="Period Heat Loss"
                  value={formatKwh(thermal.heatLossEnergy)}
                  hint={`${inputs.analysisHours ?? 12} hour defined period`}
                  color="#FB7185"
                />
                <MetricCard
                  label="Thermal Mass"
                  value={`${thermal.thermalMass} kJ/K`}
                  hint="Envelope plus storage capacity"
                  color="#A78BFA"
                />
                <MetricCard
                  label="Storage Lift"
                  value={`+${formatTemp(thermal.storageTemperatureLift)}`}
                  hint="Night heat-release contribution"
                  color="#34D399"
                />
              </div>

              <HeatFlowSummary thermal={thermal} hours={inputs.analysisHours ?? 12} />

              <div className="grid gap-4 md:grid-cols-2">
                <GlassCard className="p-4">
                  <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
                      Temperature over 24h
                    </h3>
                    <span className="text-[10px] text-[#4ADE80] font-mono">18-24C comfort</span>
                  </div>
                  <TemperatureChart data={hourly} />
                </GlassCard>

                <GlassCard className="p-4">
                  <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
                      Heat loss by material
                    </h3>
                    <span className="text-[10px] text-rose-400 font-mono">thermal loss</span>
                  </div>
                  <HeatLossChart data={materialLoss} />
                </GlassCard>

                <GlassCard className="p-4">
                  <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
                      Solar gain
                    </h3>
                    <span className="text-[10px] text-amber-400 font-mono">direct plus sol-air</span>
                  </div>
                  <SolarGainChart data={hourly} />
                </GlassCard>

                <GlassCard className="p-4">
                  <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
                      Efficiency by geometry
                    </h3>
                    <span className="text-[10px] text-[#00D4FF] font-mono">retention</span>
                  </div>
                  <EfficiencyChart data={shapeEfficiency} />
                </GlassCard>
              </div>
            </>
          ) : (
            <WaitingForInput />
          )}
        </div>

        {hasUserInput ? <RecommendationPanel /> : null}
      </div>
    </div>
  )
}
