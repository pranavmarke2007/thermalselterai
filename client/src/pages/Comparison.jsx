import { useState } from 'react'
import GlassCard from '../components/GlassCard'
import { useSimulator } from '../context/SimulatorContext'
import { formatKw, formatPercent, formatTemp } from '../utils/format'
import EfficiencyChart from '../charts/EfficiencyChart'
import HeatLossChart from '../charts/HeatLossChart'
import { Plus, Trash2, ArrowRight, Download, FileText } from 'lucide-react'

export default function Comparison() {
  const {
    recommendations,
    compareSet,
    applyDesign,
    addComparison,
    setCompareSet,
    thermal,
    inputs,
    shapeEfficiency,
    materialLoss,
  } = useSimulator()

  const [exportModal, setExportModal] = useState(false)

  // Default comparison cards: pinned items or best recommendation + live design
  const currentLiveDesign = {
    id: 'current-live',
    shape: inputs.shape,
    shapeName: inputs.shape.toUpperCase(),
    orientation: inputs.orientation,
    wall: thermal.materials?.wall?.name || 'Insulated Panel',
    wallId: inputs.wallMaterialId,
    roof: thermal.materials?.roof?.name || 'Insulated Roof',
    roofId: inputs.roofMaterialId,
    insulation: thermal.materials?.insulation?.name || 'XPS',
    insulationId: inputs.insulationId,
    insulationThickness: inputs.insulationThickness,
    indoorTemperature: thermal.indoorTemperature,
    heatLoss: thermal.heatLoss,
    solarGain: thermal.solarGain,
    thermalEfficiency: thermal.thermalEfficiency,
    ua: thermal.ua,
    inComfortBand: thermal.inComfortBand,
    isCurrent: true,
  }

  const rows = compareSet.length
    ? compareSet
    : [
        currentLiveDesign,
        recommendations?.best,
        recommendations?.alternatives?.[0],
      ].filter(Boolean)

  const pinCurrent = () => {
    addComparison(currentLiveDesign)
  }

  const removeRow = (id) => {
    setCompareSet((prev) => prev.filter((item) => item.id !== id))
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.24em] text-[#00D4FF]">
            Multi-Design Evaluation Studio
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-white">
            Architectural Trade-Off Comparison
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={pinCurrent}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#00D4FF]/40 bg-[#00D4FF]/10 px-4 py-2 text-xs font-semibold text-[#00D4FF] hover:bg-[#00D4FF]/20 transition"
          >
            <Plus size={14} /> Pin Current Live Design
          </button>
          <button
            type="button"
            onClick={() => setExportModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
          >
            <FileText size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((row, idx) => {
          const isComfort = row.indoorTemperature >= 18 && row.indoorTemperature <= 24
          return (
            <GlassCard
              key={`${row.shape}-${row.id || idx}`}
              className="p-5 relative space-y-4 border-[#00D4FF]/20"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    {row.isCurrent ? '● Active Live Design' : idx === 1 ? '★ AI Optimal Candidate' : `Iteration #${idx + 1}`}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{row.shapeName}</h3>
                </div>
                {compareSet.length > 0 && (
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Remove from comparison"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              {/* Physical Specifications */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Orientation</span>
                  <span className="font-mono font-semibold text-amber-400">{row.orientation}° (Azimuth)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Wall Assembly</span>
                  <span className="font-semibold text-white truncate max-w-[170px]">{row.wall}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Roof Assembly</span>
                  <span className="font-semibold text-white truncate max-w-[170px]">{row.roof}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Insulation Core</span>
                  <span className="font-semibold text-[#4ADE80]">
                    {row.insulation} ({Math.round((row.insulationThickness || 0.08) * 100)} cm)
                  </span>
                </div>
              </div>

              {/* Thermal Performance Telemetry */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Interior Temp:</span>
                  <span
                    className={`font-bold text-sm ${
                      isComfort ? 'text-[#4ADE80]' : 'text-amber-400'
                    }`}
                  >
                    {formatTemp(row.indoorTemperature)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Envelope Heat Loss:</span>
                  <span className="text-rose-400 font-semibold">{formatKw(row.heatLoss)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Solar Gain:</span>
                  <span className="text-[#00D4FF] font-semibold">{formatKw(row.solarGain)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Thermal Efficiency:</span>
                  <span className="text-[#4ADE80] font-semibold">
                    {formatPercent(row.thermalEfficiency)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => applyDesign(row)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#00D4FF]/15 border border-[#00D4FF]/40 px-3 py-2 text-xs font-semibold text-[#00D4FF] hover:bg-[#00D4FF]/30 transition"
                >
                  Load Design into Simulator
                  <ArrowRight size={13} />
                </button>
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Comparative Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5 space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            Shape Efficiency Comparison Matrix
          </h3>
          <EfficiencyChart data={shapeEfficiency} />
        </GlassCard>
        <GlassCard className="p-5 space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            Envelope Material Heat Loss (kW)
          </h3>
          <HeatLossChart data={materialLoss} />
        </GlassCard>
      </div>

      {/* Export Report Modal */}
      {exportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-3xl border border-[#00D4FF]/30 bg-[#151B2E] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#00D4FF]" />
                <h3 className="text-lg font-bold text-white">
                  SIH Thermal Simulation Specification Report
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExportModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 font-mono max-h-96 overflow-y-auto p-4 bg-black/40 rounded-xl border border-white/5">
              <p className="text-slate-400 uppercase tracking-widest text-[10px]">
                Project: ThermoShelter AI · Cold-Region Habitat Specification
              </p>
              <p>Site Location: {inputs.location || 'Leh, Ladakh (3,524 m MSL)'}</p>
              <p>Atmospheric Pressure: 67 kPa · Air Density: 0.825 kg/m³</p>
              <p>Ambient Temperature: {inputs.ambientTemperature}°C · Wind: {inputs.windSpeed} m/s</p>
              <hr className="border-white/10" />
              <p className="text-[#00D4FF] font-bold">Selected Shelter Configuration:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Shape Typology: {inputs.shape.toUpperCase()}</li>
                <li>Dimensions: {inputs.length}m (L) × {inputs.width}m (W) × {inputs.height}m (H)</li>
                <li>Solar Orientation: {inputs.orientation}° Azimuth (Due South)</li>
                <li>Wall Material: {thermal.materials?.wall?.name} (k={thermal.materials?.wall?.conductivity} W/mK)</li>
                <li>Roof Material: {thermal.materials?.roof?.name}</li>
                <li>Insulation Core: {thermal.materials?.insulation?.name} ({Math.round(inputs.insulationThickness * 100)} cm)</li>
              </ul>
              <hr className="border-white/10" />
              <p className="text-[#4ADE80] font-bold">Predicted Thermal Equilibrium:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Indoor Temperature: {formatTemp(thermal.indoorTemperature)}</li>
                <li>Heat Loss Rate: {formatKw(thermal.heatLoss)}</li>
                <li>Solar Harvest Rate: {formatKw(thermal.solarGain)}</li>
                <li>Thermal Efficiency: {formatPercent(thermal.thermalEfficiency)}</li>
                <li>Comfort Band Compliance (18–24°C): {thermal.inComfortBand ? 'YES (COMPLIANT)' : 'MARGINAL'}</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExportModal(false)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs text-slate-300 hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#00D4FF] px-4 py-2 text-xs font-bold text-[#0B1020] hover:bg-[#38bdf8]"
              >
                <Download size={14} />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
