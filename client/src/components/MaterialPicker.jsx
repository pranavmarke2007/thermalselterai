import materials from '../data/materials.json'
import { useSimulator } from '../context/SimulatorContext'
import { Layers, ShieldCheck } from 'lucide-react'
import InputField from './InputField'

function MaterialSelectCard({ item, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={`relative flex flex-col justify-between rounded-xl border p-2.5 text-left transition ${
        active
          ? 'border-[#00D4FF] bg-[#00D4FF]/15 text-white shadow-[0_0_15px_rgba(0,212,255,0.15)]'
          : 'border-white/10 bg-black/25 text-slate-300 hover:border-white/20'
      }`}
    >
      <div className="flex items-center justify-between gap-1 w-full">
        <span className="text-xs font-semibold truncate">{item.name}</span>
        <span
          className="h-3 w-3 shrink-0 rounded-full border border-white/20"
          style={{ backgroundColor: item.color }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 w-full">
        <span>k={item.conductivity} W/mK</span>
        <span className="text-slate-500">{item.density} kg/m³</span>
      </div>
      {active && (
        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#00D4FF] text-[#0B1020]">
          <ShieldCheck size={11} strokeWidth={3} />
        </span>
      )}
    </button>
  )
}

export default function MaterialPicker() {
  const { inputs, update } = useSimulator()

  const currentInsulation =
    materials.insulation.find((i) => i.id === inputs.insulationId) || materials.insulation[1]
  const currentThickness = inputs.insulationThickness ?? 0.08
  const calculatedRValue = (currentThickness / currentInsulation.conductivity).toFixed(2)
  const currentMass =
    materials.thermalMass.find((i) => i.id === inputs.thermalMassId) || materials.thermalMass[1]
  const massThickness = inputs.thermalMassThickness ?? currentMass.thickness ?? 0.08
  const massArea = inputs.thermalMassArea ?? 12
  const massCapacity = Math.round(
    (massArea * massThickness * currentMass.density * currentMass.specificHeat) / 1000,
  )

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white">
          <Layers size={16} className="text-[#00D4FF]" />
          Envelope Materials
        </h3>
        <span className="text-[11px] font-mono text-[#4ADE80]">
          R-{calculatedRValue} m²K/W Core
        </span>
      </div>

      {/* Wall Materials */}
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider font-mono text-slate-400">
          Wall Envelope
        </label>
        <div className="grid grid-cols-2 gap-2">
          {materials.walls.map((wall) => (
            <MaterialSelectCard
              key={wall.id}
              item={wall}
              active={inputs.wallMaterialId === wall.id}
              onSelect={(id) => update({ wallMaterialId: id })}
            />
          ))}
        </div>
      </div>

      {/* Roof Materials */}
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider font-mono text-slate-400">
          Roof Assembly
        </label>
        <div className="grid grid-cols-2 gap-2">
          {materials.roofs.map((roof) => (
            <MaterialSelectCard
              key={roof.id}
              item={roof}
              active={inputs.roofMaterialId === roof.id}
              onSelect={(id) => update({ roofMaterialId: id })}
            />
          ))}
        </div>
      </div>

      {/* Insulation Core Selection */}
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider font-mono text-slate-400">
          Insulation Material
        </label>
        <div className="grid grid-cols-2 gap-2">
          {materials.insulation.map((ins) => (
            <MaterialSelectCard
              key={ins.id}
              item={ins}
              active={inputs.insulationId === ins.id}
              onSelect={(id) => update({ insulationId: id })}
            />
          ))}
        </div>
      </div>

      {/* Insulation Thickness Slider */}
      <div className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-slate-300">Continuous Insulation Layer</span>
          <span className="telemetry-badge text-[#4ADE80] border-[#4ADE80]/30 bg-[#4ADE80]/10">
            {Math.round(currentThickness * 100)} cm ({(currentThickness * 1000).toFixed(0)} mm)
          </span>
        </div>
        <input
          type="range"
          min="0.02"
          max="0.25"
          step="0.01"
          value={currentThickness}
          onChange={(e) => update({ insulationThickness: Number(e.target.value) })}
          className="w-full h-1.5 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-[#4ADE80]"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>2 cm (Min)</span>
          <span>8 cm (Standard)</span>
          <span>15 cm (Passivehouse)</span>
          <span>25 cm (Extreme Cold)</span>
        </div>
      </div>

      {/* Thermal Storage Mass */}
      <div className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-mono text-slate-300">Thermal Mass Storage</span>
          <span className="telemetry-badge text-amber-300 border-amber-300/30 bg-amber-300/10">
            {massCapacity} kJ/K
          </span>
        </div>
        <select
          value={inputs.thermalMassId ?? 'stone-slab'}
          onChange={(e) => update({ thermalMassId: e.target.value })}
          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-[#00D4FF]"
        >
          {materials.thermalMass.map((mass) => (
            <option key={mass.id} value={mass.id} className="bg-[#151B2E]">
              {mass.name}
            </option>
          ))}
        </select>
        <p className="text-[11px] leading-5 text-slate-400">{currentMass.description}</p>
        <div className="grid grid-cols-2 gap-2.5">
          <InputField
            label="Storage Area"
            unit="m2"
            value={massArea}
            onChange={(v) => update({ thermalMassArea: v })}
            min={0}
            max={80}
            step={1}
          />
          <InputField
            label="Mass Thickness"
            unit="m"
            value={massThickness}
            onChange={(v) => update({ thermalMassThickness: v })}
            min={0}
            max={0.4}
            step={0.01}
          />
        </div>
      </div>
    </div>
  )
}
