import { CheckCircle2, ArrowRight, Cpu } from 'lucide-react'
import { useSimulator } from '../context/SimulatorContext'
import { formatKw, formatKwh, formatTemp } from '../utils/format'

export default function RecommendationPanel() {
  const { recommendations, applyDesign, addComparison, inputs } = useSimulator()
  const best = recommendations?.best

  if (!best) return null

  const isCurrentMatchingBest =
    inputs.shape === best.shape &&
    Math.abs((inputs.orientation || 0) - best.orientation) < 10 &&
    inputs.wallMaterialId === best.wallId &&
    inputs.roofMaterialId === best.roofId &&
    inputs.thermalMassId === best.thermalMassId

  return (
    <aside className="space-y-4 rounded-2xl border border-[#00D4FF]/30 bg-[#151B2E]/90 p-5 shadow-[0_0_35px_rgba(0,212,255,0.1)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#00D4FF]">
          <Cpu size={18} className="animate-pulse" />
          <h3 className="text-sm font-semibold tracking-wider uppercase">Design Optimizer</h3>
        </div>
        <span className="telemetry-badge text-[#4ADE80] border-[#4ADE80]/30 bg-[#4ADE80]/10">
          Target: 18–24°C
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Rule-based search evaluated <strong className="text-white">{recommendations.evaluated.toLocaleString()}</strong> design
        combinations for <strong className="text-[#00D4FF]">{inputs.location || 'Leh, Ladakh'}</strong>.
        {' '}<span className="text-[#4ADE80]">{recommendations.comfortCount}</span> maintain target comfort passively.
        It ranks comfort first, so hotter than 24°C is treated as overheating, not a better result.
      </p>

      {/* Best Recommended Configuration Card */}
      <div className="rounded-xl border border-[#00D4FF]/30 bg-black/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Optimal Configuration
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#4ADE80]/15 px-2 py-0.5 text-[11px] font-semibold text-[#4ADE80]">
            <CheckCircle2 size={12} />
            Best Match
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-[10px] text-slate-400 block">Shape</span>
            <span className="font-semibold text-white">{best.shapeName}</span>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-[10px] text-slate-400 block">Orientation</span>
            <span className="font-semibold text-amber-400">{best.orientation}° (Due South)</span>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-[10px] text-slate-400 block">Wall Assembly</span>
            <span className="font-semibold text-white">{best.wall}</span>
          </div>
          <div className="rounded-lg bg-white/5 p-2">
            <span className="text-[10px] text-slate-400 block">Roof Assembly</span>
            <span className="font-semibold text-white">{best.roof}</span>
          </div>
          <div className="col-span-2 rounded-lg bg-white/5 p-2">
            <span className="text-[10px] text-slate-400 block">Insulation Core</span>
            <span className="font-semibold text-[#4ADE80]">
              {best.insulation} · {Math.round(best.insulationThickness * 100)} cm
            </span>
          </div>
          <div className="col-span-2 rounded-lg bg-white/5 p-2">
            <span className="text-[10px] text-slate-400 block">Thermal Storage</span>
            <span className="font-semibold text-amber-300">
              {best.thermalMass || 'No Added Mass'} · {formatKwh(best.storedThermalEnergy || 0)}
            </span>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-2.5 text-center">
          <div>
            <span className="text-[10px] text-slate-400 block">Pred. Temp</span>
            <span className="text-sm font-bold text-[#4ADE80] font-mono">
              {formatTemp(best.indoorTemperature)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Heat Loss</span>
            <span className="text-sm font-bold text-rose-400 font-mono">
              {formatKw(best.heatLoss)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Solar Gain</span>
            <span className="text-sm font-bold text-[#00D4FF] font-mono">
              {formatKw(best.solarGain)}
            </span>
          </div>
        </div>

        {best.scoring ? (
          <div className="rounded-lg border border-white/10 bg-black/25 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Optimizer Score</span>
              <span className="font-mono text-sm font-bold text-[#00D4FF]">{best.scoring.total}</span>
            </div>
            <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
              <div className="rounded bg-white/5 p-1.5">
                <span className="block text-slate-500">Comfort</span>
                <strong className="font-mono text-emerald-300">{best.scoring.comfort}</strong>
              </div>
              <div className="rounded bg-white/5 p-1.5">
                <span className="block text-slate-500">Loss</span>
                <strong className="font-mono text-rose-300">{best.scoring.heatLoss}</strong>
              </div>
              <div className="rounded bg-white/5 p-1.5">
                <span className="block text-slate-500">Solar</span>
                <strong className="font-mono text-cyan-300">{best.scoring.solar}</strong>
              </div>
              <div className="rounded bg-white/5 p-1.5">
                <span className="block text-slate-500">Eff.</span>
                <strong className="font-mono text-lime-300">{best.scoring.efficiency}</strong>
              </div>
              <div className="rounded bg-white/5 p-1.5">
                <span className="block text-slate-500">Mass</span>
                <strong className="font-mono text-amber-300">{best.scoring.storage}</strong>
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-slate-400">
              Comfort delta from 21°C target: {best.scoring.comfortDelta}°C.
            </p>
          </div>
        ) : null}

        {/* Engineering Rationale */}
        {best.rationale && (
          <div className="rounded-lg border border-white/5 bg-slate-900/60 p-2.5 text-[11px] text-slate-300 leading-relaxed">
            <strong className="text-[#00D4FF] block mb-1">Architectural Physics Rationale:</strong>
            {best.rationale}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => applyDesign(best)}
            disabled={isCurrentMatchingBest}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
              isCurrentMatchingBest
                ? 'bg-slate-800 text-slate-400 cursor-default'
                : 'bg-[#00D4FF] text-[#0B1020] hover:bg-[#38bdf8] shadow-[0_0_20px_rgba(0,212,255,0.3)]'
            }`}
          >
            {isCurrentMatchingBest ? 'Active in Simulator' : 'Apply Best Design'}
            {!isCurrentMatchingBest && <ArrowRight size={13} />}
          </button>
          <button
            type="button"
            onClick={() => addComparison(best)}
            className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
            title="Pin to Comparison Studio"
          >
            Pin
          </button>
        </div>
      </div>

      {/* Alternative Ranked Candidates */}
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-wider font-mono text-slate-400 block">
          Ranked Alternatives
        </span>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {recommendations.alternatives.slice(0, 4).map((alt, idx) => (
            <div
              key={`${alt.shape}-${alt.wallId}-${alt.roofId}-${idx}`}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/25 p-2.5 text-xs hover:border-[#00D4FF]/40 transition"
            >
              <div className="space-y-0.5">
                <span className="font-semibold text-white block">{alt.shapeName}</span>
                <span className="text-[10px] text-slate-400">
                  {alt.wall} · {alt.orientation}° · score {alt.scoring?.total ?? alt.score}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-[#4ADE80]">
                  {formatTemp(alt.indoorTemperature)}
                </span>
                <button
                  type="button"
                  onClick={() => applyDesign(alt)}
                  className="rounded-lg border border-white/10 px-2 py-1 text-[10px] font-medium text-slate-200 hover:bg-[#00D4FF]/20 hover:text-[#00D4FF]"
                >
                  Load
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
